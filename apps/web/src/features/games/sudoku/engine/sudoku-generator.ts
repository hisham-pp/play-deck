import type { SudokuDifficulty, SudokuPuzzle } from '../types/sudoku.types';
import { CELL_COUNT, EMPTY_CELL, getDifficultyConfig } from './sudoku-constants';
import { cloneValues, colOf, createEmptyValues, rowOf, shuffle, toIndex } from './sudoku-grid';
import { hasUniqueSolution, solve } from './sudoku-solver';

/** Extra asymmetric digging passes used to reach a low clue target. */
const EXTRA_DIG_PASSES = 3;

/** Mirror of `index` through the centre of the board (180° rotation). */
export function mirrorIndex(index: number): number {
  return toIndex(8 - rowOf(index), 8 - colOf(index));
}

/** A complete, valid, randomly ordered 9x9 solution grid. */
export function generateSolvedGrid(random: () => number = Math.random): number[] {
  const solved = solve(createEmptyValues(), random);
  if (!solved) {
    // Unreachable: an empty grid always solves. Guarded so callers get a value.
    throw new Error('Failed to generate a solved Sudoku grid');
  }
  return solved;
}

function countClues(values: number[]): number {
  return values.reduce((total, value) => (value === EMPTY_CELL ? total : total + 1), 0);
}

/**
 * Removes clues from a solved grid while keeping the solution unique.
 * Symmetric digging removes mirrored pairs together, which is what gives the
 * classic newspaper look; it also floors the clue count at an even-ish number,
 * so the hardest levels dig asymmetrically.
 */
export function digHoles(
  solution: number[],
  targetClues: number,
  symmetric: boolean,
  random: () => number,
): number[] {
  const puzzle = cloneValues(solution);
  const order = shuffle(
    Array.from({ length: CELL_COUNT }, (_, index) => index),
    random,
  );

  for (const index of order) {
    if (countClues(puzzle) <= targetClues) break;
    if (puzzle[index] === EMPTY_CELL) continue;

    const partner = symmetric ? mirrorIndex(index) : index;
    const removed: Array<{ index: number; value: number }> = [{ index, value: puzzle[index] }];
    if (partner !== index && puzzle[partner] !== EMPTY_CELL) {
      removed.push({ index: partner, value: puzzle[partner] });
    }

    for (const cell of removed) puzzle[cell.index] = EMPTY_CELL;

    if (!hasUniqueSolution(puzzle)) {
      for (const cell of removed) puzzle[cell.index] = cell.value;
    }
  }

  return puzzle;
}

/**
 * Builds a puzzle for `difficulty`. The clue target is a goal, not a promise:
 * digging stops early when no further removal keeps the solution unique, so the
 * returned `clueCount` reports what was actually achieved.
 */
export function generatePuzzle(
  difficulty: SudokuDifficulty,
  random: () => number = Math.random,
): SudokuPuzzle {
  const config = getDifficultyConfig(difficulty);
  const solution = generateSolvedGrid(random);
  let givens = digHoles(solution, config.targetClues, config.symmetric, random);

  // A single pass can stall above the target: symmetric digging rejects pairs
  // it could remove singly, and any pass is at the mercy of its removal order.
  // Retry asymmetrically while fresh orders keep finding removable clues.
  for (let pass = 0; pass < EXTRA_DIG_PASSES; pass++) {
    const before = countClues(givens);
    if (before <= config.targetClues) break;

    givens = digHoles(givens, config.targetClues, false, random);
    if (countClues(givens) === before) break;
  }

  return {
    difficulty,
    givens,
    solution,
    clueCount: countClues(givens),
  };
}

/** An all-empty puzzle used before the player picks a level. */
export function createBlankPuzzle(difficulty: SudokuDifficulty): SudokuPuzzle {
  return {
    difficulty,
    givens: createEmptyValues(),
    solution: createEmptyValues(),
    clueCount: 0,
  };
}
