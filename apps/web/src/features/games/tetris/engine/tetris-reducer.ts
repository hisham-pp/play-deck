import type { ActivePiece, TetrisAction, TetrisState } from '../types/tetris.types';
import {
  COUNTDOWN_SECONDS,
  MAX_LOCK_RESETS,
  STATUS_COUNTDOWN,
  STATUS_PAUSED,
  STATUS_PLAYING,
} from './tetris-constants';
import { advanceGravity, hardDrop, hold, isPieceGrounded, softDrop } from './tetris-lock';
import { createInitialTetrisState } from './tetris-state';
import { isValidPlacement, tryRotate } from './tetris-utils';

function tryMove(state: TetrisState, deltaRow: number, deltaCol: number): TetrisState {
  if (state.status !== STATUS_PLAYING || !state.active) return state;

  const moved: ActivePiece = {
    ...state.active,
    row: state.active.row + deltaRow,
    col: state.active.col + deltaCol,
  };
  if (!isValidPlacement(state.board, moved)) return state;

  const wasGrounded = isPieceGrounded(state);
  const canResetLock = wasGrounded && state.lockResets < MAX_LOCK_RESETS;

  return {
    ...state,
    active: moved,
    lockDelayMs: canResetLock ? 0 : state.lockDelayMs,
    lockResets: canResetLock ? state.lockResets + 1 : state.lockResets,
  };
}

function rotate(state: TetrisState, direction: 1 | -1): TetrisState {
  if (state.status !== STATUS_PLAYING || !state.active) return state;

  const rotated = tryRotate(state.board, state.active, direction);
  if (!rotated) return state;

  const wasGrounded = isPieceGrounded(state);
  const canResetLock = wasGrounded && state.lockResets < MAX_LOCK_RESETS;

  return {
    ...state,
    active: rotated,
    lockDelayMs: canResetLock ? 0 : state.lockDelayMs,
    lockResets: canResetLock ? state.lockResets + 1 : state.lockResets,
  };
}

export function tetrisReducer(
  state: TetrisState,
  action: TetrisAction,
  random: () => number = Math.random,
): TetrisState {
  switch (action.type) {
    case 'START':
      return { ...state, status: STATUS_COUNTDOWN, countdown: COUNTDOWN_SECONDS };

    case 'COUNTDOWN_TICK':
      if (state.countdown <= 1) {
        return { ...state, status: STATUS_PLAYING, countdown: 0 };
      }
      return { ...state, countdown: state.countdown - 1 };

    case 'TICK':
      return advanceGravity(state, random);

    case 'MOVE_LEFT':
      return tryMove(state, 0, -1);

    case 'MOVE_RIGHT':
      return tryMove(state, 0, 1);

    case 'SOFT_DROP':
      return softDrop(state, random);

    case 'HARD_DROP':
      return hardDrop(state, random);

    case 'ROTATE_CW':
      return rotate(state, 1);

    case 'ROTATE_CCW':
      return rotate(state, -1);

    case 'HOLD':
      return hold(state, random);

    case 'PAUSE':
      return state.status === STATUS_PLAYING ? { ...state, status: STATUS_PAUSED } : state;

    case 'RESUME':
      return state.status === STATUS_PAUSED ? { ...state, status: STATUS_PLAYING } : state;

    case 'RESTART':
      return {
        ...createInitialTetrisState(state.highScore, random),
        status: STATUS_COUNTDOWN,
      };

    case 'SET_HIGH_SCORE':
      return { ...state, highScore: Math.max(state.highScore, action.highScore) };

    default:
      return state;
  }
}

export { advanceGravity, hardDrop, hold, softDrop, tryMove, rotate, isPieceGrounded };
export { lockActivePiece } from './tetris-lock';
