import type { GiantWorld, TreasureTier } from '../types/giant.types';

export interface RenderOptions {
  /** Seat tint per thief id, so a torch can be told apart from a torch. */
  colors: Record<string, string>;
  localPlayerId: string | null;
  /** Lighter floor, harder outlines, stronger rings. */
  highContrast: boolean;
  /** Stills the breathing, the flicker and the ripple pulses. */
  reducedMotion: boolean;
}

export interface RenderFrame {
  world: GiantWorld;
  options: RenderOptions;
}

export const FLOOR_DARK = '#080b13';
export const FLOOR_LIGHT = '#101725';
export const STONE = '#161d2e';
export const STONE_EDGE = '#232f45';
export const MOSS = '#134e4a';

/** Loot reads by colour before it reads by shape, so tiers get their own metal. */
export const TIER_COLOR: Record<TreasureTier, string> = {
  trinket: '#94a3b8',
  goblet: '#f59e0b',
  relic: '#c084fc',
};

export function withAlpha(hex: string, alpha: number): string {
  const value = hex.replace('#', '');
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** A 0..1 pulse that holds still when the player has asked for less motion. */
export function pulse(elapsedMs: number, periodMs: number, options: RenderOptions): number {
  if (options.reducedMotion) return 0.5;
  return (Math.sin((elapsedMs / periodMs) * Math.PI * 2) + 1) / 2;
}
