import type { SnakeState } from '../types/snake.types';
import {
  BASE_SPEED_MS,
  COUNTDOWN_SECONDS,
  GRID_SIZE,
  INITIAL_DIRECTION,
  INITIAL_SNAKE,
  STATUS_IDLE,
} from './snake-constants';
import { spawnFood } from './snake-utils';

export function createInitialSnakeState(
  highScore: number = 0,
  gridSize: number = GRID_SIZE,
): SnakeState {
  const snakeCopy = INITIAL_SNAKE.map((c) => ({ ...c }));
  return {
    status: STATUS_IDLE,
    snake: snakeCopy,
    direction: INITIAL_DIRECTION,
    pendingDirections: [],
    food: spawnFood(snakeCopy, gridSize),
    score: 0,
    highScore,
    speedMs: BASE_SPEED_MS,
    countdown: COUNTDOWN_SECONDS,
    isNewHighScore: false,
    gridSize,
  };
}
