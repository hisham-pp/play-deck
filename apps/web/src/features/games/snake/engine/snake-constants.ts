import type { Coordinate, Direction } from '../types/snake.types';

export const GRID_SIZE = 20;

export const INITIAL_SNAKE: Coordinate[] = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 },
];

export const INITIAL_DIRECTION: Direction = 'RIGHT';

export const STATUS_IDLE = 'idle' as const;
export const STATUS_COUNTDOWN = 'countdown' as const;
export const STATUS_PLAYING = 'playing' as const;
export const STATUS_PAUSED = 'paused' as const;
export const STATUS_GAME_OVER = 'game-over' as const;

export const BASE_SPEED_MS = 140;
export const MIN_SPEED_MS = 65;
export const SPEED_STEP_MS = 5;
export const POINTS_PER_FOOD = 10;
export const POINTS_PER_SPEED_STEP = 30;

export const DIFFICULTY_SPEEDS = {
  easy: 175,
  normal: 140,
  hard: 105,
  insane: 75,
} as const;
export const COUNTDOWN_SECONDS = 3;
export const MAX_PENDING_DIRECTIONS = 2;

export const DIRECTION_VECTORS: Record<Direction, Coordinate> = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

export const OPPOSITE_DIRECTIONS: Record<Direction, Direction> = {
  UP: 'DOWN',
  DOWN: 'UP',
  LEFT: 'RIGHT',
  RIGHT: 'LEFT',
};
