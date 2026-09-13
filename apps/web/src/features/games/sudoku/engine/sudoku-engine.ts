import type { BaseGameEngine } from '@playdeck/game-types';
import type { SudokuAction, SudokuDifficulty, SudokuState } from '../types/sudoku.types';
import { DEFAULT_DIFFICULTY, STATUS_COMPLETED, STATUS_FAILED } from './sudoku-constants';
import { sudokuReducer } from './sudoku-reducer';
import { createInitialSudokuState } from './sudoku-state';

/**
 * Framework-agnostic Sudoku engine. Holds no React, DOM or storage concerns —
 * the UI subscribes to state and dispatches intent.
 */
export class SudokuEngine implements BaseGameEngine<SudokuState, SudokuAction> {
  private state: SudokuState;
  private listeners: Set<(state: SudokuState) => void> = new Set();
  private readonly random: () => number;

  constructor(
    difficulty: SudokuDifficulty = DEFAULT_DIFFICULTY,
    bestTimeMs: number | null = null,
    random: () => number = Math.random,
  ) {
    this.random = random;
    this.state = createInitialSudokuState(difficulty, bestTimeMs);
  }

  getState(): SudokuState {
    return this.state;
  }

  dispatch(action: SudokuAction): void {
    const next = sudokuReducer(this.state, action, this.random);
    if (next === this.state) return;
    this.state = next;
    this.notify();
  }

  subscribe(listener: (state: SudokuState) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  reset(): void {
    this.dispatch({ type: 'RESET' });
  }

  newPuzzle(difficulty?: SudokuDifficulty): void {
    this.dispatch({ type: 'NEW_PUZZLE', difficulty });
  }

  selectCell(index: number): void {
    this.dispatch({ type: 'SELECT_CELL', index });
  }

  moveSelection(rowDelta: number, colDelta: number): void {
    this.dispatch({ type: 'MOVE_SELECTION', rowDelta, colDelta });
  }

  setDigit(digit: number): void {
    this.dispatch({ type: 'SET_DIGIT', digit });
  }

  toggleCandidate(digit: number): void {
    this.dispatch({ type: 'TOGGLE_CANDIDATE', digit });
  }

  clearCell(): void {
    this.dispatch({ type: 'CLEAR_CELL' });
  }

  toggleNoteMode(): void {
    this.dispatch({ type: 'TOGGLE_NOTE_MODE' });
  }

  autoFillCandidates(): void {
    this.dispatch({ type: 'AUTO_FILL_CANDIDATES' });
  }

  undo(): void {
    this.dispatch({ type: 'UNDO' });
  }

  hint(): void {
    this.dispatch({ type: 'HINT' });
  }

  tick(deltaMs: number): void {
    this.dispatch({ type: 'TICK', deltaMs });
  }

  pause(): void {
    this.dispatch({ type: 'PAUSE' });
  }

  resume(): void {
    this.dispatch({ type: 'RESUME' });
  }

  setBestTime(bestTimeMs: number | null): void {
    this.dispatch({ type: 'SET_BEST_TIME', bestTimeMs });
  }

  isComplete(): boolean {
    return this.state.status === STATUS_COMPLETED;
  }

  isFailed(): boolean {
    return this.state.status === STATUS_FAILED;
  }

  destroy(): void {
    this.listeners.clear();
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }
}
