import type { TetrisState } from '../types/tetris.types';
import { BASE_GRAVITY_MS, COUNTDOWN_SECONDS, PREVIEW_COUNT, STATUS_IDLE } from './tetris-constants';
import { createEmptyBoard, refillQueue, spawnPiece } from './tetris-utils';

export function createInitialTetrisState(
  highScore: number = 0,
  random: () => number = Math.random,
): TetrisState {
  const { queue, bag } = refillQueue([], [], PREVIEW_COUNT + 1, random);
  const [firstType, ...restQueue] = queue;

  return {
    status: STATUS_IDLE,
    board: createEmptyBoard(),
    active: spawnPiece(firstType),
    holdType: null,
    canHold: true,
    queue: restQueue,
    bag,
    score: 0,
    highScore,
    isNewHighScore: false,
    level: 1,
    linesCleared: 0,
    gravityMs: BASE_GRAVITY_MS,
    lockDelayMs: 0,
    lockResets: 0,
    countdown: COUNTDOWN_SECONDS,
    lastClearedLines: [],
    lastClearWasTetris: false,
  };
}
