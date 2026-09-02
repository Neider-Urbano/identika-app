import type { Platform, PlatformConnector } from './types';
import { githubConnector } from './github';
import { chessConnector } from './chess';

/**
 * Registro de conectores disponibles. Al sumar una plataforma (Steam, YouTube…)
 * se agrega aquí y la ruta /api/card/[platform] la expone automáticamente —
 * no hay que crear un endpoint nuevo por cada una.
 */
export const CONNECTORS: Partial<Record<Platform, PlatformConnector>> = {
  github: githubConnector,
  chess: chessConnector,
};

export function getConnector(platform: string): PlatformConnector | undefined {
  return CONNECTORS[platform as Platform];
}
