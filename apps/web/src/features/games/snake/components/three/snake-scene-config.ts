import type { Direction } from '../../types/snake.types';

/**
 * The board always occupies the same world footprint regardless of the chosen
 * grid size, so the fixed camera never has to be re-tuned per difficulty.
 */
export const ARENA_SPAN = 20;

/** World size of a single grid cell for the given grid resolution. */
export function cellSize(gridSize: number): number {
  return ARENA_SPAN / gridSize;
}

/** Converts a grid coordinate (y grows downward) into arena world space. */
export function gridToWorldX(x: number, gridSize: number): number {
  return (x + 0.5) * cellSize(gridSize) - ARENA_SPAN / 2;
}

export function gridToWorldZ(y: number, gridSize: number): number {
  return (y + 0.5) * cellSize(gridSize) - ARENA_SPAN / 2;
}

/**
 * Heading of the head in radians around Y. Head models are authored facing -Z,
 * which is "UP" on the grid.
 */
export const DIRECTION_YAW: Record<Direction, number> = {
  UP: 0,
  DOWN: Math.PI,
  LEFT: Math.PI / 2,
  RIGHT: -Math.PI / 2,
};

export const PALETTE = {
  background: '#05070c',
  wallTrim: '#f59e0b',
  scaleLight: '#86c96b',
  scaleDark: '#1f4429',
  belly: '#dbe6b4',
  dead: '#7f1d2e',
  apple: '#c2172b',
  appleStem: '#4a3120',
  appleLeaf: '#2f7d3a',
} as const;
