import { CELL_COUNT, EMPTY_CELL, GRID_SIZE } from './sudoku-constants';
import { boxOf, cloneValues, colOf, rowOf, shuffle } from './sudoku-grid';

const FULL_MASK = 0b111111111;

interface UnitMasks {
  rows: number[];
  cols: number[];
  boxes: number[];
}

function bit(digit: number): number {
  return 1 << (digit - 1);
}

function maskToDigits(mask: number): number[] {
  const digits: number[] = [];
  for (let digit = 1; digit <= GRID_SIZE; digit++) {
    if (mask & bit(digit)) digits.push(digit);
  }
  return digits;
}

function popCount(mask: number): number {
  let count = 0;
  let value = mask;
  while (value) {
    value &= value - 1;
    count++;
  }
  return count;
}

/**
 * Builds per-unit occupancy masks, or null when the board already contradicts
 * itself. Without this check a contradictory board sends the search into an
 * exhaustive, effectively unbounded backtrack.
 */
function buildMasks(values: number[]): UnitMasks | null {
  const masks: UnitMasks = {
    rows: new Array<number>(GRID_SIZE).fill(0),
    cols: new Array<number>(GRID_SIZE).fill(0),
    boxes: new Array<number>(GRID_SIZE).fill(0),
  };

  for (let index = 0; index < CELL_COUNT; index++) {
    const digit = values[index];
    if (digit === EMPTY_CELL) continue;

    const row = rowOf(index);
    const col = colOf(index);
    const box = boxOf(index);
    const flag = bit(digit);

    if (masks.rows[row] & flag || masks.cols[col] & flag || masks.boxes[box] & flag) {
      return null;
    }

    masks.rows[row] |= flag;
    masks.cols[col] |= flag;
    masks.boxes[box] |= flag;
  }

  return masks;
}

function allowedMask(masks: UnitMasks, index: number): number {
  const used = masks.rows[rowOf(index)] | masks.cols[colOf(index)] | masks.boxes[boxOf(index)];
  return FULL_MASK & ~used;
}

function place(masks: UnitMasks, index: number, digit: number): void {
  const flag = bit(digit);
  masks.rows[rowOf(index)] |= flag;
  masks.cols[colOf(index)] |= flag;
  masks.boxes[boxOf(index)] |= flag;
}

function unplace(masks: UnitMasks, index: number, digit: number): void {
  const flag = ~bit(digit);
  masks.rows[rowOf(index)] &= flag;
  masks.cols[colOf(index)] &= flag;
  masks.boxes[boxOf(index)] &= flag;
}

/**
 * Minimum-remaining-values heuristic: the empty cell with the fewest legal
 * digits. Returns index -1 when the board is full, and a zero mask for a cell
 * with no legal digit (a dead end the caller should abandon).
 */
function findBestCell(values: number[], masks: UnitMasks): { index: number; mask: number } {
  let bestIndex = -1;
  let bestMask = 0;
  let bestCount = GRID_SIZE + 1;

  for (let index = 0; index < CELL_COUNT; index++) {
    if (values[index] !== EMPTY_CELL) continue;

    const mask = allowedMask(masks, index);
    const count = popCount(mask);
    if (count < bestCount) {
      bestIndex = index;
      bestMask = mask;
      bestCount = count;
      if (count <= 1) break;
    }
  }

  return { index: bestIndex, mask: bestMask };
}

/**
 * Counts solutions, stopping as soon as `limit` is reached. Uniqueness checks
 * only need to know whether a second solution exists, so limit 2 is cheap.
 */
export function countSolutions(values: number[], limit: number = 2): number {
  const working = cloneValues(values);
  const masks = buildMasks(working);
  if (!masks) return 0;

  let found = 0;

  const search = (): void => {
    const { index, mask } = findBestCell(working, masks);
    if (index === -1) {
      found += 1;
      return;
    }
    if (mask === 0) return;

    for (const digit of maskToDigits(mask)) {
      working[index] = digit;
      place(masks, index, digit);
      search();
      unplace(masks, index, digit);
      working[index] = EMPTY_CELL;
      if (found >= limit) return;
    }
  };

  search();
  return found;
}

export function hasUniqueSolution(values: number[]): boolean {
  return countSolutions(values, 2) === 1;
}

/**
 * Solves the grid, returning a filled copy, or null when the board contradicts
 * itself or has no solution. A `random` source shuffles the digit order, which
 * is how the generator produces a different completed grid every run.
 */
export function solve(values: number[], random?: () => number): number[] | null {
  const working = cloneValues(values);
  const masks = buildMasks(working);
  if (!masks) return null;

  const search = (): boolean => {
    const { index, mask } = findBestCell(working, masks);
    if (index === -1) return true;
    if (mask === 0) return false;

    const options = maskToDigits(mask);
    const ordered = random ? shuffle(options, random) : options;

    for (const digit of ordered) {
      working[index] = digit;
      place(masks, index, digit);
      if (search()) return true;
      unplace(masks, index, digit);
      working[index] = EMPTY_CELL;
    }
    return false;
  };

  return search() ? working : null;
}
