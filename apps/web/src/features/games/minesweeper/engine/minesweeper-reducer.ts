import type { MinesweeperAction, MinesweeperState } from '../types/minesweeper.types';
import { STATUS_PLAYING } from './minesweeper-constants';
import {
  handleChord,
  handleMoveSelection,
  handleReveal,
  handleToggleFlag,
} from './minesweeper-moves';
import { createInitialMinesweeperState } from './minesweeper-state';

export { createInitialMinesweeperState, resolveDimensions } from './minesweeper-state';

export function minesweeperReducer(
  state: MinesweeperState,
  action: MinesweeperAction,
  random: () => number = Math.random,
): MinesweeperState {
  switch (action.type) {
    case 'REVEAL_CELL':
      return handleReveal(state, action.index, random);

    case 'TOGGLE_FLAG':
      return handleToggleFlag(state, action.index);

    case 'CHORD_CELL':
      return handleChord(state, action.index);

    case 'SELECT_CELL':
      return {
        ...state,
        selectedCellIndex: Math.max(0, Math.min(state.cells.length - 1, action.index)),
      };

    case 'MOVE_SELECTION':
      return handleMoveSelection(state, action.rowDelta, action.colDelta);

    case 'TICK':
      if (state.status !== STATUS_PLAYING) return state;
      return { ...state, elapsedMs: state.elapsedMs + action.deltaMs };

    case 'NEW_GAME':
      return createInitialMinesweeperState(
        action.difficulty ?? state.difficulty,
        state.bestTimeMs,
        action.customConfig,
      );

    case 'RESET_GAME':
      return createInitialMinesweeperState(state.difficulty, state.bestTimeMs, {
        rows: state.rows,
        cols: state.cols,
        mines: state.mines,
      });

    case 'SET_BEST_TIME':
      return { ...state, bestTimeMs: action.bestTimeMs };

    default:
      return state;
  }
}
