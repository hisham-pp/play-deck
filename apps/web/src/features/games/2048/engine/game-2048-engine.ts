import type { Direction, GridState, TileItem } from '../types/2048.types';
import { GRID_SIZE, SPAWN_PROBABILITY_4, WINNING_VALUE } from './game-2048-constants';

/**
 * Creates an empty 4x4 grid filled with 0s.
 */
export function createEmptyGrid(): GridState {
  return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));
}

/**
 * Deep clones a 4x4 grid.
 */
export function cloneGrid(grid: GridState): GridState {
  return grid.map((row) => [...row]);
}

/**
 * Compares two grids for value equality.
 */
export function areGridsEqual(a: GridState, b: GridState): boolean {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (a[r][c] !== b[r][c]) return false;
    }
  }
  return true;
}

export interface SlideLineResult {
  line: number[];
  scoreGain: number;
  mergedIndices: number[]; // indices in the resulting line that were formed by merges
}

/**
 * Slides and merges a single line (row/col) towards index 0.
 *
 * Rules:
 * - Moves all non-zero numbers towards index 0.
 * - Merges identical adjacent pairs (left-to-right).
 * - Each tile merges at most once per slide.
 * - Returns the resulting 4-element line, total score gained, and indices of merges.
 */
export function slideLine(line: number[]): SlideLineResult {
  const nonZeros = line.filter((val) => val !== 0);
  const result: number[] = [];
  const mergedIndices: number[] = [];
  let scoreGain = 0;

  let i = 0;
  while (i < nonZeros.length) {
    if (i + 1 < nonZeros.length && nonZeros[i] === nonZeros[i + 1]) {
      const mergedValue = nonZeros[i] * 2;
      result.push(mergedValue);
      scoreGain += mergedValue;
      mergedIndices.push(result.length - 1);
      i += 2; // Both tiles consumed in this merge
    } else {
      result.push(nonZeros[i]);
      i += 1;
    }
  }

  // Pad the rest of the line with zeroes to maintain length
  while (result.length < line.length) {
    result.push(0);
  }

  return { line: result, scoreGain, mergedIndices };
}

/**
 * Transposes an NxN matrix (rows become columns).
 */
export function transpose(grid: GridState): GridState {
  const result = createEmptyGrid();
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      result[c][r] = grid[r][c];
    }
  }
  return result;
}

export interface MoveGridResult {
  grid: GridState;
  scoreGain: number;
  hasChanged: boolean;
}

/**
 * Moves the 4x4 grid in the specified direction.
 * Pure function: does not mutate the input grid.
 */
export function moveGrid(grid: GridState, direction: Direction): MoveGridResult {
  let workingGrid = cloneGrid(grid);
  let totalScoreGain = 0;

  if (direction === 'LEFT') {
    for (let r = 0; r < GRID_SIZE; r++) {
      const { line, scoreGain } = slideLine(workingGrid[r]);
      workingGrid[r] = line;
      totalScoreGain += scoreGain;
    }
  } else if (direction === 'RIGHT') {
    for (let r = 0; r < GRID_SIZE; r++) {
      const reversed = [...workingGrid[r]].reverse();
      const { line, scoreGain } = slideLine(reversed);
      workingGrid[r] = line.reverse();
      totalScoreGain += scoreGain;
    }
  } else if (direction === 'UP') {
    const transposed = transpose(workingGrid);
    for (let r = 0; r < GRID_SIZE; r++) {
      const { line, scoreGain } = slideLine(transposed[r]);
      transposed[r] = line;
      totalScoreGain += scoreGain;
    }
    workingGrid = transpose(transposed);
  } else if (direction === 'DOWN') {
    const transposed = transpose(workingGrid);
    for (let r = 0; r < GRID_SIZE; r++) {
      const reversed = [...transposed[r]].reverse();
      const { line, scoreGain } = slideLine(reversed);
      transposed[r] = line.reverse();
      totalScoreGain += scoreGain;
    }
    workingGrid = transpose(transposed);
  }

  const hasChanged = !areGridsEqual(grid, workingGrid);

  return {
    grid: workingGrid,
    scoreGain: totalScoreGain,
    hasChanged,
  };
}

export interface EmptyCell {
  row: number;
  col: number;
}

/**
 * Returns all coordinates on the grid where value is 0.
 */
export function getEmptyCells(grid: GridState): EmptyCell[] {
  const empty: EmptyCell[] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === 0) {
        empty.push({ row: r, col: c });
      }
    }
  }
  return empty;
}

/**
 * Spawns a new tile into a randomly chosen empty cell.
 * Value is 4 with 10% chance, 2 with 90% chance.
 */
export function spawnTile(
  grid: GridState,
  idGenerator: () => string,
  rng: () => number = Math.random,
): { grid: GridState; tile: TileItem | null } {
  const emptyCells = getEmptyCells(grid);
  if (emptyCells.length === 0) {
    return { grid, tile: null };
  }

  const randomIndex = Math.floor(rng() * emptyCells.length);
  const targetCell = emptyCells[randomIndex];
  const value = rng() < SPAWN_PROBABILITY_4 ? 4 : 2;

  const nextGrid = cloneGrid(grid);
  nextGrid[targetCell.row][targetCell.col] = value;

  const tile: TileItem = {
    id: idGenerator(),
    value,
    row: targetCell.row,
    col: targetCell.col,
    isNew: true,
  };

  return { grid: nextGrid, tile };
}

/**
 * Checks if any valid move exists on the grid.
 * A move is possible if:
 * - At least one cell is empty (0), OR
 * - Two adjacent cells horizontally or vertically share the same value.
 */
export function isGameOver(grid: GridState): boolean {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const val = grid[r][c];
      if (val === 0) return false;

      // Check right neighbor
      if (c + 1 < GRID_SIZE && val === grid[r][c + 1]) {
        return false;
      }
      // Check bottom neighbor
      if (r + 1 < GRID_SIZE && val === grid[r + 1][c]) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Checks if the grid contains a winning tile (>= 2048 by default).
 */
export function hasWinningTile(grid: GridState, target = WINNING_VALUE): boolean {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] >= target) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Computes the maximum tile value present on the board.
 */
export function getHighestTile(grid: GridState): number {
  let max = 0;
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] > max) {
        max = grid[r][c];
      }
    }
  }
  return max;
}

/**
 * Checks if moving in a specific direction would alter the board.
 */
export function canMove(grid: GridState, direction: Direction): boolean {
  const { hasChanged } = moveGrid(grid, direction);
  return hasChanged;
}

/**
 * Generates the TileItem[] representation from a GridState.
 * Stable id assignment preserves existing tile IDs at identical coordinates when possible.
 */
export function syncTilesFromGrid(
  grid: GridState,
  prevTiles: TileItem[],
  idGenerator: () => string,
): TileItem[] {
  const result: TileItem[] = [];
  const prevMap = new Map<string, TileItem>();

  for (const t of prevTiles) {
    prevMap.set(`${t.row}:${t.col}:${t.value}`, t);
  }

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const value = grid[r][c];
      if (value !== 0) {
        const key = `${r}:${c}:${value}`;
        const existing = prevMap.get(key);
        if (existing) {
          result.push({
            ...existing,
            row: r,
            col: c,
            isNew: false,
            isMerged: false,
          });
          prevMap.delete(key);
        } else {
          result.push({
            id: idGenerator(),
            value,
            row: r,
            col: c,
            isNew: false,
            isMerged: true,
          });
        }
      }
    }
  }

  return result;
}
