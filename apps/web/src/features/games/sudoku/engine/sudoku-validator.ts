import type { SudokuCellState } from '../types/sudoku.types';
import { DIGITS, EMPTY_CELL, GRID_SIZE } from './sudoku-constants';
import { PEERS, UNITS } from './sudoku-grid';

/**
 * Indices whose digit is duplicated by a peer. Givens are reported too — a
 * conflict is a property of the pair, not of who placed it.
 */
export function findConflicts(values: number[]): number[] {
  const conflicted = new Set<number>();

  for (const unit of UNITS) {
    const seen = new Map<number, number[]>();
    for (const index of unit) {
      const value = values[index];
      if (value === EMPTY_CELL) continue;
      const bucket = seen.get(value);
      if (bucket) bucket.push(index);
      else seen.set(value, [index]);
    }
    for (const bucket of seen.values()) {
      if (bucket.length > 1) bucket.forEach((index) => conflicted.add(index));
    }
  }

  return [...conflicted].sort((a, b) => a - b);
}

/** Indices holding a digit that contradicts the puzzle's unique solution. */
export function findErrors(values: number[], solution: number[]): number[] {
  const errors: number[] = [];
  for (let index = 0; index < values.length; index++) {
    const value = values[index];
    if (value !== EMPTY_CELL && solution[index] !== EMPTY_CELL && value !== solution[index]) {
      errors.push(index);
    }
  }
  return errors;
}

/** A board is solved when every cell is filled and no unit repeats a digit. */
export function isSolved(values: number[]): boolean {
  if (values.some((value) => value === EMPTY_CELL)) return false;
  return findConflicts(values).length === 0;
}

export function toValues(cells: SudokuCellState[]): number[] {
  return cells.map((cell) => cell.value);
}

/** Digits still legally placeable at `index`, ignoring cells already filled. */
export function computeCandidates(values: number[], index: number): number[] {
  if (values[index] !== EMPTY_CELL) return [];
  const blocked = new Set(PEERS[index].map((peer) => values[peer]));
  return DIGITS.filter((digit) => !blocked.has(digit));
}

/** How many of each digit (1-9) remain unplaced on the board. */
export function remainingDigitCounts(values: number[]): Record<number, number> {
  const counts: Record<number, number> = {};
  for (const digit of DIGITS) counts[digit] = GRID_SIZE;
  for (const value of values) {
    if (value !== EMPTY_CELL && counts[value] !== undefined) counts[value] -= 1;
  }
  return counts;
}
