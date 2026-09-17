import type { PowerUpKind } from '../types/ball-bounce.types';

export const PALETTE = {
  backdrop: '#05070d',
  board: '#0a0f1c',
  boardEdge: '#1c2438',
  grid: 'rgba(148, 163, 184, 0.045)',
  ball: '#f8fafc',
  paddle: '#e5e7eb',
  paddleAccent: '#f59e0b',
  paddleWide: '#fbbf24',
  text: '#f8fafc',
  danger: '#f43f5e',
  slowTint: 'rgba(56, 189, 248, 0.07)',
} as const;

/** Block colour by remaining durability: cool → warm as blocks get tougher. */
export const BLOCK_COLORS: Record<number, string> = {
  1: '#2dd4bf',
  2: '#60a5fa',
  3: '#a78bfa',
  4: '#f59e0b',
};

export function blockColor(hp: number): string {
  return BLOCK_COLORS[Math.min(4, Math.max(1, hp))];
}

export const POWER_UP_STYLE: Record<PowerUpKind, { color: string; glyph: string; label: string }> =
  {
    wide: { color: '#f59e0b', glyph: '↔', label: 'Wide paddle' },
    multi: { color: '#2dd4bf', glyph: '×3', label: 'Multi-ball' },
    slow: { color: '#38bdf8', glyph: '½', label: 'Slow motion' },
    life: { color: '#f43f5e', glyph: '♥', label: 'Extra life' },
  };
