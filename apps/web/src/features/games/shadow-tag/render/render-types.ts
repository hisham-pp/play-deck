import type { ShadowCast, ShadowTagWorld } from '../types/shadow-tag.types';

export interface RenderOptions {
  /** Seat tint per player id, so a shadow can be told apart from a shadow. */
  colors: Record<string, string>;
  localPlayerId: string | null;
  /** Brighter floor, harder shadow edges, outlined props. */
  highContrast: boolean;
  /** Stills the drift, flicker and ripples. */
  reducedMotion: boolean;
}

export interface RenderFrame {
  world: ShadowTagWorld;
  casts: ShadowCast[];
  options: RenderOptions;
}

export const FLOOR_DARK = '#05070d';
export const FLOOR_LIGHT = '#0d1320';

export function withAlpha(hex: string, alpha: number): string {
  const value = hex.replace('#', '');
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
