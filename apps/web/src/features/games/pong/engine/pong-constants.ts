import type { PongConfig, PongDifficulty } from './pong-types';

export const PONG_ARENA_WIDTH = 800;
export const PONG_ARENA_HEIGHT = 500;

export const PADDLE_WIDTH = 14;
export const PADDLE_HEIGHT = 90;
export const PADDLE_OFFSET_X = 24;

export const BALL_RADIUS = 7;
export const BALL_INITIAL_SPEED = 460; // px/sec
export const BALL_MAX_SPEED = 960; // px/sec
export const BALL_SPEED_INCREMENT = 1.05; // 5% increase on each paddle hit
export const BALL_MAX_BOUNCE_ANGLE = (55 * Math.PI) / 180; // ~0.96 rad (55 degrees max)

export const DEFAULT_PADDLE_SPEED = 500; // px/sec for human players

export const AI_DIFFICULTY_SPEEDS: Record<PongDifficulty, number> = {
  easy: 320,
  medium: 440,
  hard: 540,
};

export const AI_DIFFICULTY_JITTER: Record<PongDifficulty, number> = {
  easy: 28,
  medium: 12,
  hard: 2,
};

export const SERVE_DELAY_SECONDS = 1.0;

export const DEFAULT_PONG_CONFIG: PongConfig = {
  mode: 'single-player',
  difficulty: 'medium',
  winningScore: 7,
  paddleSpeed: DEFAULT_PADDLE_SPEED,
  soundEnabled: true,
};

export const WINNING_SCORE_OPTIONS = [5, 7, 11, 21] as const;
