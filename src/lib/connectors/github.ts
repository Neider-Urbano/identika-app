import { BreakdownEntry, CardData, CardStat, ConnectorError, PlatformConnector } from './types';
import { computeGithubLevel } from '../level';

const GITHUB_API = 'https://api.github.com';

/** Paleta aproximada por lenguaje, solo para los puntos de color del reverso. No pretende ser exacta. */
const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#4f9dff',
  JavaScript: '#f4d35e',
  Python: '#35a3ff',
  Go: '#35d0c0',
  Rust: '#ff8b6b',
  Java: '#e8735c',
  'C#': '#8b7bff',
  C: '#8899aa',
  'C++': '#8b7bff',
  HTML: '#e8735c',
  CSS: '#4f9dff',
  Shell: '#8899aa',
  Ruby: '#ff6b6b',
  PHP: '#8b7bff',
};

function formatCompact(n: number): string {
  return new Intl.NumberFormat('es-CO', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
}

/** Serial determinístico tipo "7F3K-9QZP-GH" a partir del handle — no es criptográfico, es solo decorativo. */
function makeSerial(handle: string, suffix: string): string {
  let hash = 0;
  for (let i = 0; i < handle.length; i++) {
    hash = (hash * 31 + handle.charCodeAt(i)) >>> 0;
  }
  const hex = hash.toString(16).toUpperCase().padStart(8, '0');
  return `${hex.slice(0, 4)}-${hex.slice(4, 8)}-${suffix}`;
}

interface GithubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  location: string | null;
  public_repos: number;
  followers: number;
  html_url: string;
}

interface GithubRepo {
  stargazers_count: number;
  language: string | null;
  fork: boolean;
}

function authHeaders(): Record<string, string> {
  const token = process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function fetchUser(username: string): Promise<GithubUser> {
  const res = await fetch(`${GITHUB_API}/users/${encodeURIComponent(username)}`, {
    headers: authHeaders(),
    next: { revalidate: 300 },
  });
  if (res.status === 404) {
    throw new ConnectorError(`No existe ningún usuario de GitHub con el nombre "${username}".`, 404);
  }
  if (res.status === 403) {
    throw new ConnectorError(
      'GitHub limitó las peticiones sin autenticar (60/hora). Agrega GITHUB_TOKEN en .env.local para subir el límite a 5000/hora.',
      429,
    );
  }
  if (!res.ok) {
    throw new ConnectorError(`GitHub respondió con un error inesperado (${res.status}).`, 502);
  }
  return res.json();
}

/** Trae hasta 300 repos públicos (3 páginas) para sumar estrellas y calcular el lenguaje principal. */
async function fetchRepos(username: string): Promise<GithubRepo[]> {
  const repos: GithubRepo[] = [];
  for (let page = 1; page <= 3; page++) {
    const res = await fetch(
      `${GITHUB_API}/users/${encodeURIComponent(username)}/repos?per_page=100&page=${page}&sort=updated`,
      { headers: authHeaders(), next: { revalidate: 300 } },
    );
    if (!res.ok) break;
    const batch: GithubRepo[] = await res.json();
    repos.push(...batch);
    if (batch.length < 100) break;
  }
  return repos;
}

function computeLanguageBreakdown(repos: GithubRepo[]): BreakdownEntry[] {
  const counts = new Map<string, number>();
  let total = 0;
  for (const repo of repos) {
    if (repo.fork || !repo.language) continue;
    counts.set(repo.language, (counts.get(repo.language) ?? 0) + 1);
    total += 1;
  }
  if (total === 0) return [];
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, count]) => ({
      name,
      percent: Math.round((count / total) * 100),
      color: LANGUAGE_COLORS[name] ?? '#8899aa',
    }));
}

/**
 * Racha de contribuciones — requiere GraphQL autenticado (GitHub no expone esto
 * en la API REST pública). Si no hay GITHUB_TOKEN configurado, se omite por
 * completo en vez de inventar un número: así lo pedimos en el roadmap.
 */
async function fetchStreak(username: string): Promise<number | null> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return null;

  const query = `
    query($login: String!) {
      user(login: $login) {
        contributionsCollection {
          contributionCalendar {
            weeks { contributionDays { date contributionCount } }
          }
        }
      }
    }
  `;

  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { login: username } }),
  });
  if (!res.ok) return null;

  const json = await res.json();
  const weeks = json?.data?.user?.contributionsCollection?.contributionCalendar?.weeks;
  if (!Array.isArray(weeks)) return null;

  const days = weeks.flatMap((w: { contributionDays: { date: string; contributionCount: number }[] }) => w.contributionDays);
  days.sort((a, b) => (a.date < b.date ? 1 : -1)); // más reciente primero

  let streak = 0;
  for (const day of days) {
    if (day.contributionCount > 0) streak += 1;
    else break;
  }
  return streak;
}

export async function fetchGithubCard(username: string): Promise<CardData> {
  const [user, repos, streak] = await Promise.all([
    fetchUser(username),
    fetchRepos(username),
    fetchStreak(username),
  ]);

  const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);
  const languageBreakdown = computeLanguageBreakdown(repos);
  const topLanguage = languageBreakdown[0];

  const { label: rank } = computeGithubLevel({
    followers: user.followers,
    totalStars,
    publicRepos: user.public_repos,
  });

  const stats: CardStat[] = [
    { key: 'repos', label: 'Repos', value: formatCompact(user.public_repos), icon: 'repo' },
    { key: 'stars', label: 'Estrellas', value: formatCompact(totalStars), icon: 'star' },
    topLanguage
      ? { key: 'language', label: topLanguage.name, value: `${topLanguage.percent}%`, icon: 'language' }
      : { key: 'followers', label: 'Seguidores', value: formatCompact(user.followers), icon: 'trophy' },
  ];

  if (streak !== null && streak > 0) {
    stats.push({ key: 'streak', label: 'Días racha', value: formatCompact(streak), icon: 'flame' });
  }

  return {
    platform: 'github',
    handle: user.login,
    displayName: user.name ?? user.login,
    avatarUrl: user.avatar_url,
    location: user.location ?? undefined,
    suggestedAccent: '#8b7bff',
    rank,
    stats,
    breakdownTitle: 'Lenguajes principales',
    breakdown: languageBreakdown.length > 0 ? languageBreakdown : undefined,
    profileUrl: user.html_url,
    serial: makeSerial(user.login, 'GH'),
    issuedAt: new Date().toISOString(),
  };
}

export const githubConnector: PlatformConnector = {
  id: 'github',
  fetchCard: fetchGithubCard,
};
