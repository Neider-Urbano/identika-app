/**
 * Fórmulas del "nivel / rango" por plataforma — v1, TENTATIVAS.
 *
 * Marcadas como pendientes por afinar en el roadmap del proyecto; son primeras
 * versiones razonables para tener algo real que mostrar, no las fórmulas
 * finales. Viven en un solo lugar para que ajustarlas más adelante no implique
 * tocar el conector ni el componente de la tarjeta.
 *
 * GitHub: Puntaje = seguidores·2 + estrellas totales·3 + repos públicos·1;
 *   nivel = escala logarítmica del puntaje, entre 1 y 10.
 * Chess.com: nivel por tramos del mejor rating alcanzado en cualquier ritmo.
 */

export interface LevelResult {
  level: number; // 1–10
  title: string;
  label: string; // "Nivel 7 · Arquitecto"
}

function toLabel(level: number, title: string): LevelResult {
  return { level, title, label: `Nivel ${level} · ${title}` };
}

const RANK_TITLES = [
  'Explorador',
  'Explorador',
  'Colaborador',
  'Colaborador',
  'Mantenedor',
  'Mantenedor',
  'Arquitecto',
  'Arquitecto',
  'Leyenda',
  'Leyenda',
] as const;

export function computeGithubLevel(input: {
  followers: number;
  totalStars: number;
  publicRepos: number;
}): LevelResult {
  const score = input.followers * 2 + input.totalStars * 3 + input.publicRepos * 1;
  const raw = Math.floor(Math.log2(score + 1));
  const level = Math.min(10, Math.max(1, raw));
  return toLabel(level, RANK_TITLES[level - 1] ?? 'Explorador');
}

/** Rangos de Chess.com por el mejor rating alcanzado en cualquier ritmo. */
const CHESS_TIERS: { min: number; title: string }[] = [
  { min: 2400, title: 'Gran Maestro' },
  { min: 2200, title: 'Maestro' },
  { min: 2000, title: 'Candidato a Maestro' },
  { min: 1800, title: 'Experto' },
  { min: 1600, title: 'Avanzado' },
  { min: 1400, title: 'Intermedio' },
  { min: 1200, title: 'Jugador de Club' },
  { min: 1000, title: 'Aficionado' },
  { min: 800, title: 'Aprendiz' },
  { min: 0, title: 'Peón' },
];

export function computeChessLevel(input: { bestRating: number }): LevelResult {
  const rating = Number.isFinite(input.bestRating) ? input.bestRating : 0;
  const found = CHESS_TIERS.findIndex((t) => rating >= t.min);
  const idx = found < 0 ? CHESS_TIERS.length - 1 : found;
  const level = CHESS_TIERS.length - idx; // 1 (Peón) … 10 (Gran Maestro)
  return toLabel(level, CHESS_TIERS[idx]!.title);
}
