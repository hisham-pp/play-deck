import type { SudokuAction, SudokuState } from '../types/sudoku.types';
import { GRID_SIZE, STATUS_IDLE, STATUS_PAUSED, STATUS_PLAYING } from './sudoku-constants';
import { generatePuzzle } from './sudoku-generator';
import { colOf, isOnBoard, rowOf, toIndex } from './sudoku-grid';
import {
  applyAutoCandidates,
  applyCandidate,
  applyClear,
  applyDigit,
  applyHint,
  applyUndo,
} from './sudoku-moves';
import { createPlayingState } from './sudoku-state';

function isDigit(digit: number): boolean {
  return Number.isInteger(digit) && digit >= 1 && digit <= GRID_SIZE;
}

function moveSelection(state: SudokuState, rowDelta: number, colDelta: number): SudokuState {
  const row = rowOf(state.selectedIndex) + rowDelta;
  const col = colOf(state.selectedIndex) + colDelta;
  if (!isOnBoard(row, col)) return state;
  return { ...state, selectedIndex: toIndex(row, col) };
}

/**
 * Actions that only make sense mid-run. Returns the state unchanged for
 * anything it does not own, so the main reducer can fall through to lifecycle.
 */
function reduceBoardAction(state: SudokuState, action: SudokuAction): SudokuState {
  if (state.status !== STATUS_PLAYING) return state;

  switch (action.type) {
    case 'SET_DIGIT':
      if (!isDigit(action.digit)) return state;
      return state.noteMode ? applyCandidate(state, action.digit) : applyDigit(state, action.digit);

    case 'TOGGLE_CANDIDATE':
      return isDigit(action.digit) ? applyCandidate(state, action.digit) : state;

    case 'CLEAR_CELL':
      return applyClear(state);

    case 'AUTO_FILL_CANDIDATES':
      return applyAutoCandidates(state);

    case 'UNDO':
      return applyUndo(state);

    case 'HINT':
      return applyHint(state);

    case 'TICK':
      return action.deltaMs > 0 ? { ...state, elapsedMs: state.elapsedMs + action.deltaMs } : state;

    default:
      return state;
  }
}

export function sudokuReducer(
  state: SudokuState,
  action: SudokuAction,
  random: () => number = Math.random,
): SudokuState {
  switch (action.type) {
    case 'NEW_PUZZLE':
      return createPlayingState(
        generatePuzzle(action.difficulty ?? state.difficulty, random),
        state,
      );

    case 'RESET':
      // Nothing to restart until a puzzle has actually been dealt.
      return state.status === STATUS_IDLE ? state : createPlayingState(state.puzzle, state);

    case 'SELECT_CELL':
      if (action.index < 0 || action.index >= state.cells.length) return state;
      return { ...state, selectedIndex: action.index };

    case 'MOVE_SELECTION':
      return moveSelection(state, action.rowDelta, action.colDelta);

    case 'TOGGLE_NOTE_MODE':
      return { ...state, noteMode: !state.noteMode };

    case 'PAUSE':
      return state.status === STATUS_PLAYING ? { ...state, status: STATUS_PAUSED } : state;

    case 'RESUME':
      return state.status === STATUS_PAUSED ? { ...state, status: STATUS_PLAYING } : state;

    case 'SET_BEST_TIME':
      return { ...state, bestTimeMs: action.bestTimeMs };

    default:
      return reduceBoardAction(state, action);
  }
}
