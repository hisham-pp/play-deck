import type { BlockState } from '../types/ball-bounce.types';
import {
  BLOCK_GAP,
  BLOCK_HEIGHT,
  BLOCK_SIDE_MARGIN,
  BLOCK_TOP,
  blockColumnsFor,
} from './ball-bounce-constants';

interface Cell {
  col: number;
  row: number;
  cols: number;
  rows: number;
}

type Pattern = (cell: Cell) => boolean;

const center = (n: number) => (n - 1) / 2;

/** Layouts cycle in this order; each full cycle adds durability. */
export const LEVEL_PATTERNS: ReadonlyArray<{ name: string; fill: Pattern }> = [
  { name: 'Wall', fill: () => true },
  {
    name: 'Pyramid',
    fill: ({ col, row, cols }) => Math.abs(col - center(cols)) <= row + 1.5,
  },
  {
    name: 'Checker',
    fill: ({ col, row }) => (col + row) % 2 === 0 || row % 3 === 0,
  },
  {
    name: 'Diamond',
    fill: ({ col, row, cols, rows }) =>
      Math.abs(col - center(cols)) / (center(cols) + 0.5) +
        Math.abs(row - center(rows)) / (center(rows) + 0.5) <=
      1.05,
  },
  {
    name: 'Pillars',
    fill: ({ col, row }) => col % 3 !== 1 || row === 0,
  },
  {
    name: 'Fortress',
    fill: ({ col, row, cols, rows }) =>
      row === 0 || row === rows - 1 || col === 0 || col === cols - 1 || (row + col) % 3 === 0,
  },
];

export function rowsForLevel(level: number): number {
  return 4 + Math.min(level - 1, 4);
}

/** Highest block durability that can appear on a level (1..4). */
export function maxHpForLevel(level: number): number {
  return Math.min(4, 1 + Math.floor((level - 1) / 2));
}

export function patternForLevel(level: number) {
  return LEVEL_PATTERNS[(level - 1) % LEVEL_PATTERNS.length];
}

/**
 * Builds the block grid for a level. Top rows are the toughest, so players chip through
 * soft blocks first and difficulty rises smoothly rather than all at once.
 */
export function buildLevelBlocks(
  level: number,
  worldWidth: number,
  startId: number,
): { blocks: BlockState[]; nextId: number } {
  const cols = blockColumnsFor(worldWidth);
  const rows = rowsForLevel(level);
  const maxHp = maxHpForLevel(level);
  const pattern = patternForLevel(level).fill;
  const usable = worldWidth - BLOCK_SIDE_MARGIN * 2;
  const w = (usable - BLOCK_GAP * (cols - 1)) / cols;

  const blocks: BlockState[] = [];
  let id = startId;

  for (let row = 0; row < rows; row++) {
    const hp = Math.max(1, Math.ceil(((rows - row) / rows) * maxHp));
    for (let col = 0; col < cols; col++) {
      if (!pattern({ col, row, cols, rows })) continue;
      blocks.push({
        id: id++,
        x: BLOCK_SIDE_MARGIN + col * (w + BLOCK_GAP),
        y: BLOCK_TOP + row * (BLOCK_HEIGHT + BLOCK_GAP),
        w,
        h: BLOCK_HEIGHT,
        hp,
        maxHp: hp,
        flash: 0,
      });
    }
  }

  return { blocks, nextId: id };
}
