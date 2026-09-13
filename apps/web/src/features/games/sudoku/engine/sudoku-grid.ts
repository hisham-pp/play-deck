import { BOX_SIZE, CELL_COUNT, EMPTY_CELL, GRID_SIZE } from './sudoku-constants';

export function rowOf(index: number): number {
  return Math.floor(index / GRID_SIZE);
}

export function colOf(index: number): number {
  return index % GRID_SIZE;
}

export function boxOf(index: number): number {
  return Math.floor(rowOf(index) / BOX_SIZE) * BOX_SIZE + Math.floor(colOf(index) / BOX_SIZE);
}

export function toIndex(row: number, col: number): number {
  return row * GRID_SIZE + col;
}

export function isOnBoard(row: number, col: number): boolean {
  return row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE;
}

function buildUnits(): number[][] {
  const rows: number[][] = Array.from({ length: GRID_SIZE }, () => []);
  const cols: number[][] = Array.from({ length: GRID_SIZE }, () => []);
  const boxes: number[][] = Array.from({ length: GRID_SIZE }, () => []);

  for (let index = 0; index < CELL_COUNT; index++) {
    rows[rowOf(index)].push(index);
    cols[colOf(index)].push(index);
    boxes[boxOf(index)].push(index);
  }

  return [...rows, ...cols, ...boxes];
}

/** All 27 units (9 rows, 9 columns, 9 boxes) as arrays of cell indices. */
export const UNITS: number[][] = buildUnits();

function buildPeers(): number[][] {
  const peers: number[][] = Array.from({ length: CELL_COUNT }, () => []);

  for (let index = 0; index < CELL_COUNT; index++) {
    const seen = new Set<number>();
    for (const unit of UNITS) {
      if (!unit.includes(index)) continue;
      for (const peer of unit) {
        if (peer !== index) seen.add(peer);
      }
    }
    peers[index] = [...seen].sort((a, b) => a - b);
  }

  return peers;
}

/** The 20 cells that share a row, column or box with each index. */
export const PEERS: number[][] = buildPeers();

export function createEmptyValues(): number[] {
  return new Array<number>(CELL_COUNT).fill(EMPTY_CELL);
}

export function cloneValues(values: number[]): number[] {
  return values.slice();
}

/** True when `digit` can legally occupy `index` given the current values. */
export function isValidPlacement(values: number[], index: number, digit: number): boolean {
  if (digit === EMPTY_CELL) return true;
  for (const peer of PEERS[index]) {
    if (values[peer] === digit) return false;
  }
  return true;
}

export function isFilled(values: number[]): boolean {
  return values.every((value) => value !== EMPTY_CELL);
}

export function shuffle<T>(items: T[], random: () => number): T[] {
  const next = items.slice();
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}
