/**
 * Esquema único de tarjeta (ver "Identika Roadmap" → sección Arquitectura).
 * Cada conector de plataforma (GitHub, Chess.com, Steam, YouTube, ...) debe
 * traducir los datos reales de su API a esta forma. Lo que una plataforma no
 * pueda entregar simplemente no se incluye — nunca se inventa un valor.
 */

export type Platform = 'github' | 'chess' | 'steam' | 'youtube';

/** Nombre visible de cada plataforma para el chip de la tarjeta. */
export const PLATFORM_LABEL: Record<Platform, string> = {
  github: 'GitHub',
  chess: 'Chess.com',
  steam: 'Steam',
  youtube: 'YouTube',
};

/** Íconos disponibles para una stat (ver IdentikaCard.tsx). Ampliar aquí al sumar plataformas. */
export type StatIcon = 'repo' | 'star' | 'flame' | 'language' | 'trophy' | 'play';

export interface CardStat {
  key: string;
  label: string;
  /** Ya formateado para mostrar (ej. "3.4k", "48%"), no el número crudo. */
  value: string;
  icon: StatIcon;
}

/**
 * Una fila del desglose que se muestra en el reverso de la tarjeta. En GitHub son
 * lenguajes; en Chess.com son ritmos de juego. Cada conector decide qué representa
 * y pone el título con `breakdownTitle`.
 */
export interface BreakdownEntry {
  name: string;
  percent: number;
  color: string;
}

export interface CardData {
  platform: Platform;
  /** @handle público de la plataforma. */
  handle: string;
  displayName: string;
  avatarUrl: string;
  location?: string;
  /** Color de acento sugerido para esta plataforma; el usuario lo puede sobreescribir en el editor. */
  suggestedAccent: string;
  /** Etiqueta ya calculada, ej. "Nivel 7 · Mantenedor". Ver lib/level.ts. */
  rank: string;
  stats: CardStat[];
  /** Título del desglose del reverso, ej. "Lenguajes principales" o "Rendimiento por ritmo". */
  breakdownTitle?: string;
  /** Detalle opcional para el reverso de la tarjeta (ver IdentikaCard "back"). */
  breakdown?: BreakdownEntry[];
  profileUrl: string;
  /** Código único de esta tarjeta, tipo serial de carnet. Determinístico a partir del handle. */
  serial: string;
  issuedAt: string; // ISO date
}

export interface PlatformConnector {
  id: Platform;
  /** Recibe el identificador público (username, etc.) y devuelve la tarjeta ya mapeada. */
  fetchCard(identifier: string): Promise<CardData>;
}

export class ConnectorError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ConnectorError';
  }
}
