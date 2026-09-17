import type { PowerUpKind } from '../types/ball-bounce.types';

/**
 * Logical world. Height is fixed so speeds feel identical on every screen; width follows the
 * viewport's aspect ratio (within bounds) so the board fills the screen edge to edge.
 */
export const WORLD_HEIGHT = 800;
export const DEFAULT_WORLD_WIDTH = 600;
export const MIN_WORLD_WIDTH = 440;
export const MAX_WORLD_WIDTH = 1280;
/** Target block width used to pick a column count for the current world width. */
export const BLOCK_TARGET_WIDTH = 58;
export const MIN_BLOCK_COLUMNS = 7;
export const MAX_BLOCK_COLUMNS = 14;

export const STARTING_LIVES = 3;
export const MAX_LIVES = 5;
export const COUNTDOWN_SECONDS = 3;
export const SERVE_DELAY_SECONDS = 0.9;
export const LEVEL_CLEAR_SECONDS = 1.8;

export const PADDLE_WIDTH = 104;
export const PADDLE_HEIGHT = 14;
export const PADDLE_Y = WORLD_HEIGHT - 64;
export const PADDLE_MAX_SPEED = 880;
export const PADDLE_ACCEL = 5200;
export const PADDLE_FOLLOW_RATE = 22;
export const WIDE_PADDLE_SCALE = 1.55;
export const PADDLE_RESIZE_RATE = 10;

export const BALL_RADIUS = 8;
export const BALL_TRAIL_LENGTH = 9;
export const MAX_BALLS = 6;
/** Max bounce angle off the paddle, measured from vertical. */
export const MAX_BOUNCE_ANGLE = (62 * Math.PI) / 180;
/** Keeps the ball from settling into near-horizontal loops. */
export const MIN_VERTICAL_RATIO = 0.28;

export const BASE_BALL_SPEED = 390;
export const SPEED_PER_LEVEL = 24;
export const MAX_BALL_SPEED = 720;
/** Ball speed ramps up by this fraction as a level's blocks are cleared. */
export const IN_LEVEL_SPEED_RAMP = 0.14;
export const SLOW_MOTION_SCALE = 0.6;

export const BLOCK_GAP = 6;
export const BLOCK_SIDE_MARGIN = 24;
export const BLOCK_TOP = 96;
export const BLOCK_HEIGHT = 24;
export const BLOCK_POINTS = 10;

export const POWER_UP_DROP_CHANCE = 0.13;
export const POWER_UP_FALL_SPEED = 170;
export const POWER_UP_SIZE = { w: 44, h: 20 } as const;
export const WIDE_DURATION = 12;
export const SLOW_DURATION = 8;
export const LIFE_BONUS_POINTS = 250;
export const LEVEL_CLEAR_BONUS = 100;

export const POWER_UP_WEIGHTS: ReadonlyArray<readonly [PowerUpKind, number]> = [
  ['wide', 34],
  ['multi', 30],
  ['slow', 26],
  ['life', 10],
];

/** Every COMBO_STEP consecutive breaks adds +1 to the multiplier. */
export const COMBO_STEP = 4;
export const MAX_MULTIPLIER = 8;

export function comboMultiplier(combo: number): number {
  return Math.min(MAX_MULTIPLIER, 1 + Math.floor(combo / COMBO_STEP));
}

export function worldWidthForViewport(width: number, height: number): number {
  if (width <= 0 || height <= 0) return DEFAULT_WORLD_WIDTH;
  const fitted = Math.round((WORLD_HEIGHT * width) / height);
  return Math.min(MAX_WORLD_WIDTH, Math.max(MIN_WORLD_WIDTH, fitted));
}

export function blockColumnsFor(worldWidth: number): number {
  const cols = Math.round(worldWidth / BLOCK_TARGET_WIDTH);
  return Math.min(MAX_BLOCK_COLUMNS, Math.max(MIN_BLOCK_COLUMNS, cols));
}

export function levelBaseSpeed(level: number): number {
  return Math.min(MAX_BALL_SPEED, BASE_BALL_SPEED + (level - 1) * SPEED_PER_LEVEL);
}
