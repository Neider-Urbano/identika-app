import { BreakdownEntry, CardData, CardStat, ConnectorError, PlatformConnector } from './types';
import { computeChessLevel } from '../level';

const CHESS_API = 'https://api.chess.com/pub';

/**
 * Chess.com pide un User-Agent descriptivo en su API pública (si no, algunas
 * IPs reciben 403). No hace falta key ni login — todo es lectura pública.
 */
const HEADERS = { 'User-Agent': 'Identika/0.1 (generador de tarjetas; https://github.com/identika)' };

/** Ritmos que consideramos para stats y para el desglose del reverso. */
const TIME_CLASSES = ['rapid', 'blitz', 'bullet', 'daily'] as const;
type TimeClass = (typeof TIME_CLASSES)[number];

const TIME_CLASS_LABEL: Record<TimeClass, string> = {
  rapid: 'Rapid',
  blitz: 'Blitz',
  bullet: 'Bullet',
  daily: 'Por días',
};

const TIME_CLASS_COLOR: Record<TimeClass, string> = {
  rapid: '#81b64c',
  blitz: '#f4c04e',
  bullet: '#e8735c',
  daily: '#4f9dff',
};

interface ChessProfile {
  avatar?: string;
  url: string;
  name?: string;
  username: string;
  title?: string;
  followers: number;
  country: string; // URL tipo https://api.chess.com/pub/country/NO
  location?: string;
  joined: number; // unix (segundos)
}

interface ChessModeStats {
  last?: { rating: number };
  best?: { rating: number };
  record?: { win: number; loss: number; draw: number };
}

type ChessStats = Partial<Record<`chess_${TimeClass}`, ChessModeStats>>;

function formatCompact(n: number): string {
  return new Intl.NumberFormat('es-CO', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
}

/** Serial determinístico tipo "7F3K-9QZP-CH" a partir del handle — decorativo, no criptográfico. */
function makeSerial(handle: string, suffix: string): string {
  let hash = 0;
  for (let i = 0; i < handle.length; i++) {
    hash = (hash * 31 + handle.charCodeAt(i)) >>> 0;
  }
  const hex = hash.toString(16).toUpperCase().padStart(8, '0');
  return `${hex.slice(0, 4)}-${hex.slice(4, 8)}-${suffix}`;
}

async function fetchJson(path: string): Promise<Response> {
  return fetch(`${CHESS_API}${path}`, { headers: HEADERS, next: { revalidate: 300 } });
}

async function fetchProfile(username: string): Promise<ChessProfile> {
  const res = await fetchJson(`/player/${encodeURIComponent(username)}`);
  if (res.status === 404) {
    throw new ConnectorError(`No existe ningún jugador de Chess.com con el nombre "${username}".`, 404);
  }
  if (res.status === 429) {
    throw new ConnectorError('Chess.com limitó las peticiones por ahora. Espera un momento y reintenta.', 429);
  }
  if (!res.ok) {
    throw new ConnectorError(`Chess.com respondió con un error inesperado (${res.status}).`, 502);
  }
  return res.json();
}

async function fetchStats(username: string): Promise<ChessStats> {
  const res = await fetchJson(`/player/${encodeURIComponent(username)}/stats`);
  if (!res.ok) return {};
  return res.json();
}

/** Código de país de 2 letras a partir de la URL que devuelve Chess.com. */
function countryCode(url: string): string {
  return url.split('/').pop()?.toUpperCase() ?? '';
}

interface ModeSummary {
  timeClass: TimeClass;
  rating: number;
  best: number;
  games: number;
}

function summarizeModes(stats: ChessStats): ModeSummary[] {
  const out: ModeSummary[] = [];
  for (const tc of TIME_CLASSES) {
    const mode = stats[`chess_${tc}`];
    if (!mode) continue;
    const rating = mode.last?.rating ?? 0;
    const best = mode.best?.rating ?? rating;
    const record = mode.record;
    const games = record ? record.win + record.loss + record.draw : 0;
    if (rating === 0 && games === 0) continue;
    out.push({ timeClass: tc, rating, best, games });
  }
  return out;
}

export async function fetchChessCard(username: string): Promise<CardData> {
  const [profile, stats] = await Promise.all([fetchProfile(username), fetchStats(username)]);

  const modes = summarizeModes(stats);
  const totalGames = modes.reduce((sum, m) => sum + m.games, 0);
  const totalWins = TIME_CLASSES.reduce((sum, tc) => sum + (stats[`chess_${tc}`]?.record?.win ?? 0), 0);
  const bestRating = modes.reduce((max, m) => Math.max(max, m.best), 0);

  const { label: rank } = computeChessLevel({ bestRating });

  // Ritmo principal: el primero disponible en orden rapid > blitz > bullet > daily.
  const primary = modes[0];
  const blitz = modes.find((m) => m.timeClass === 'blitz');

  const stats_: CardStat[] = [];
  if (primary && primary.rating > 0) {
    stats_.push({
      key: `rating-${primary.timeClass}`,
      label: TIME_CLASS_LABEL[primary.timeClass],
      value: String(primary.rating), // los ratings se muestran crudos, sin separador ni notación compacta
      icon: 'trophy',
    });
  }
  if (blitz && blitz.rating > 0 && blitz.timeClass !== primary?.timeClass) {
    stats_.push({ key: 'rating-blitz', label: 'Blitz', value: String(blitz.rating), icon: 'flame' });
  }
  if (totalGames > 0) {
    stats_.push({
      key: 'winrate',
      label: 'Victorias',
      value: `${Math.round((totalWins / totalGames) * 100)}%`,
      icon: 'star',
    });
    stats_.push({ key: 'games', label: 'Partidas', value: formatCompact(totalGames), icon: 'play' });
  }
  if (stats_.length === 0) {
    // Cuenta sin partidas jugadas todavía: al menos mostramos seguidores.
    stats_.push({ key: 'followers', label: 'Seguidores', value: formatCompact(profile.followers), icon: 'trophy' });
  }

  const breakdown: BreakdownEntry[] =
    totalGames > 0
      ? modes
          .filter((m) => m.games > 0)
          .sort((a, b) => b.games - a.games)
          .slice(0, 3)
          .map((m) => ({
            name: TIME_CLASS_LABEL[m.timeClass],
            percent: Math.round((m.games / totalGames) * 100),
            color: TIME_CLASS_COLOR[m.timeClass],
          }))
      : [];

  const displayName = profile.title
    ? `${profile.title} ${profile.name ?? profile.username}`
    : profile.name ?? profile.username;

  return {
    platform: 'chess',
    handle: profile.username,
    displayName,
    avatarUrl: profile.avatar ?? 'https://www.chess.com/bundles/web/images/user-image.007dad08.svg',
    location: profile.location ?? (countryCode(profile.country) || undefined),
    suggestedAccent: '#81b64c',
    rank,
    breakdownTitle: 'Rendimiento por ritmo',
    breakdown: breakdown.length > 0 ? breakdown : undefined,
    stats: stats_,
    profileUrl: profile.url,
    serial: makeSerial(profile.username, 'CH'),
    issuedAt: new Date().toISOString(),
  };
}

export const chessConnector: PlatformConnector = {
  id: 'chess',
  fetchCard: fetchChessCard,
};
