import type { TetrominoType } from '../types/tetris.types';

export const COLS = 10;
export const VISIBLE_ROWS = 20;
export const HIDDEN_ROWS = 2;
export const TOTAL_ROWS = VISIBLE_ROWS + HIDDEN_ROWS;

export const STATUS_IDLE = 'idle' as const;
export const STATUS_COUNTDOWN = 'countdown' as const;
export const STATUS_PLAYING = 'playing' as const;
export const STATUS_PAUSED = 'paused' as const;
export const STATUS_GAME_OVER = 'game-over' as const;

export const COUNTDOWN_SECONDS = 3;

export const BASE_GRAVITY_MS = 800;
export const MIN_GRAVITY_MS = 100;
export const GRAVITY_STEP_MS = 60;
export const LOCK_DELAY_MS = 500;
export const MAX_LOCK_RESETS = 15;

export const LINES_PER_LEVEL = 10;
export const SOFT_DROP_POINTS_PER_CELL = 1;
export const HARD_DROP_POINTS_PER_CELL = 2;
export const LINE_CLEAR_POINTS = [0, 100, 300, 500, 800];

export const PREVIEW_COUNT = 4;

export const TETROMINO_TYPES: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

export const SPAWN_COLUMN: Record<TetrominoType, number> = {
  I: 3,
  O: 3,
  T: 3,
  S: 3,
  Z: 3,
  J: 3,
  L: 3,
};

export const SPAWN_ROW = 0;

export { PIECE_SHAPES } from './tetris-shapes';
export { getKickTable, type KickKey } from './tetris-kicks';
