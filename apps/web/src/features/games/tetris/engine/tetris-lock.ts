import type { ActivePiece, TetrisState, TetrominoType } from '../types/tetris.types';
import {
  HARD_DROP_POINTS_PER_CELL,
  LOCK_DELAY_MS,
  PREVIEW_COUNT,
  SOFT_DROP_POINTS_PER_CELL,
  STATUS_GAME_OVER,
  STATUS_PLAYING,
} from './tetris-constants';
import {
  calculateGravityMs,
  calculateLevel,
  calculateLineClearScore,
  clearRows,
  findFullRows,
  getGhostPiece,
  isTopRowOccupied,
  isValidPlacement,
  mergePieceIntoBoard,
  refillQueue,
  spawnPiece,
} from './tetris-utils';

export function isPieceGrounded(state: TetrisState): boolean {
  if (!state.active) return false;
  return !isValidPlacement(state.board, { ...state.active, row: state.active.row + 1 });
}

export function withNextPiece(
  state: TetrisState,
  random: () => number,
): { active: ActivePiece; queue: TetrominoType[]; bag: TetrominoType[] } {
  const { queue, bag } = refillQueue(state.queue, state.bag, PREVIEW_COUNT + 1, random);
  const [nextType, ...restQueue] = queue;
  return { active: spawnPiece(nextType), queue: restQueue, bag };
}

export function lockActivePiece(state: TetrisState, random: () => number): TetrisState {
  if (!state.active) return state;

  const boardWithPiece = mergePieceIntoBoard(state.board, state.active);
  const fullRows = findFullRows(boardWithPiece);
  const clearedBoard = clearRows(boardWithPiece, fullRows);

  const totalLinesCleared = state.linesCleared + fullRows.length;
  const level = calculateLevel(totalLinesCleared);
  const lineScore = calculateLineClearScore(fullRows.length, state.level);
  const newScore = state.score + lineScore;
  const newHighScore = Math.max(state.highScore, newScore);

  if (isTopRowOccupied(clearedBoard)) {
    return {
      ...state,
      board: clearedBoard,
      active: null,
      score: newScore,
      highScore: newHighScore,
      isNewHighScore: newScore > state.highScore,
      linesCleared: totalLinesCleared,
      level,
      lastClearedLines: fullRows,
      lastClearWasTetris: fullRows.length >= 4,
      status: STATUS_GAME_OVER,
    };
  }

  const { active, queue, bag } = withNextPiece(state, random);
  const spawnBlocked = !isValidPlacement(clearedBoard, active);

  return {
    ...state,
    board: clearedBoard,
    active: spawnBlocked ? null : active,
    queue,
    bag,
    canHold: true,
    lockDelayMs: 0,
    lockResets: 0,
    score: newScore,
    highScore: newHighScore,
    isNewHighScore: newScore > state.highScore,
    linesCleared: totalLinesCleared,
    level,
    gravityMs: calculateGravityMs(level),
    lastClearedLines: fullRows,
    lastClearWasTetris: fullRows.length >= 4,
    status: spawnBlocked ? STATUS_GAME_OVER : state.status,
  };
}

export function advanceGravity(state: TetrisState, random: () => number): TetrisState {
  if (state.status !== STATUS_PLAYING || !state.active) return state;

  const dropped: ActivePiece = { ...state.active, row: state.active.row + 1 };
  if (isValidPlacement(state.board, dropped)) {
    return { ...state, active: dropped, lockDelayMs: 0 };
  }

  const nextLockDelay = state.lockDelayMs + state.gravityMs;
  if (nextLockDelay >= LOCK_DELAY_MS) {
    return lockActivePiece(state, random);
  }
  return { ...state, lockDelayMs: nextLockDelay };
}

export function softDrop(state: TetrisState, random: () => number): TetrisState {
  if (state.status !== STATUS_PLAYING || !state.active) return state;

  const dropped: ActivePiece = { ...state.active, row: state.active.row + 1 };
  if (isValidPlacement(state.board, dropped)) {
    return { ...state, active: dropped, score: state.score + SOFT_DROP_POINTS_PER_CELL };
  }
  return lockActivePiece(state, random);
}

export function hardDrop(state: TetrisState, random: () => number): TetrisState {
  if (state.status !== STATUS_PLAYING || !state.active) return state;

  const ghost = getGhostPiece(state.board, state.active);
  const cellsDropped = ghost.row - state.active.row;
  const droppedState: TetrisState = {
    ...state,
    active: ghost,
    score: state.score + cellsDropped * HARD_DROP_POINTS_PER_CELL,
  };
  return lockActivePiece(droppedState, random);
}

export function hold(state: TetrisState, random: () => number): TetrisState {
  if (state.status !== STATUS_PLAYING || !state.active || !state.canHold) return state;

  if (state.holdType === null) {
    const { active, queue, bag } = withNextPiece(state, random);
    return {
      ...state,
      holdType: state.active.type,
      active,
      queue,
      bag,
      canHold: false,
      lockDelayMs: 0,
      lockResets: 0,
    };
  }

  const swapped = spawnPiece(state.holdType);
  if (!isValidPlacement(state.board, swapped)) return state;

  return {
    ...state,
    holdType: state.active.type,
    active: swapped,
    canHold: false,
    lockDelayMs: 0,
    lockResets: 0,
  };
}
