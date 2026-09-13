import type {
  SudokuCellState,
  SudokuDifficulty,
  SudokuPuzzle,
  SudokuState,
} from '../types/sudoku.types';
import {
  DEFAULT_DIFFICULTY,
  EMPTY_CELL,
  STATUS_IDLE,
  STATUS_PLAYING,
  getDifficultyConfig,
} from './sudoku-constants';
import { createBlankPuzzle } from './sudoku-generator';
import { findConflicts, findErrors } from './sudoku-validator';

export function createCellsFromGivens(givens: number[]): SudokuCellState[] {
  return givens.map((value) => ({
    value,
    given: value !== EMPTY_CELL,
    candidates: [],
  }));
}

/** Index of the first empty cell, or 0 when the board is full. */
export function firstEmptyIndex(cells: SudokuCellState[]): number {
  const index = cells.findIndex((cell) => cell.value === EMPTY_CELL);
  return index === -1 ? 0 : index;
}

/** Idle shell — no puzzle generated yet, so mounting the game is instant. */
export function createInitialSudokuState(
  difficulty: SudokuDifficulty = DEFAULT_DIFFICULTY,
  bestTimeMs: number | null = null,
): SudokuState {
  const config = getDifficultyConfig(difficulty);
  const puzzle = createBlankPuzzle(difficulty);

  return {
    status: STATUS_IDLE,
    difficulty,
    puzzle,
    cells: createCellsFromGivens(puzzle.givens),
    selectedIndex: 0,
    noteMode: false,
    conflicts: [],
    errors: [],
    mistakes: 0,
    maxMistakes: config.maxMistakes,
    hintsRemaining: config.hints,
    elapsedMs: 0,
    bestTimeMs,
    isNewBestTime: false,
    history: [],
    lastEvent: null,
  };
}

/** A fresh playable run over `puzzle`, preserving the known best time. */
export function createPlayingState(puzzle: SudokuPuzzle, previous: SudokuState): SudokuState {
  const config = getDifficultyConfig(puzzle.difficulty);
  const cells = createCellsFromGivens(puzzle.givens);
  const values = puzzle.givens;

  return {
    ...previous,
    status: STATUS_PLAYING,
    difficulty: puzzle.difficulty,
    puzzle,
    cells,
    selectedIndex: firstEmptyIndex(cells),
    noteMode: false,
    conflicts: findConflicts(values),
    errors: findErrors(values, puzzle.solution),
    mistakes: 0,
    maxMistakes: config.maxMistakes,
    hintsRemaining: config.hints,
    elapsedMs: 0,
    isNewBestTime: false,
    history: [],
    lastEvent: null,
  };
}
