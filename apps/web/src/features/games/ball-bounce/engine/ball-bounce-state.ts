import type { BallBounceState, BallState } from '../types/ball-bounce.types';
import {
  BALL_RADIUS,
  COUNTDOWN_SECONDS,
  DEFAULT_WORLD_WIDTH,
  PADDLE_HEIGHT,
  PADDLE_WIDTH,
  PADDLE_Y,
  STARTING_LIVES,
  WORLD_HEIGHT,
  levelBaseSpeed,
} from './ball-bounce-constants';
import { buildLevelBlocks } from './ball-bounce-levels';

export function createStuckBall(state: BallBounceState): BallState {
  const { paddle } = state.player;
  return {
    id: state.nextId++,
    x: paddle.x,
    y: paddle.y - BALL_RADIUS - 1,
    vx: 0,
    vy: 0,
    radius: BALL_RADIUS,
    stuck: true,
    trail: [],
  };
}

/** Loads a level's blocks and resets the table (ball on paddle, no falling capsules). */
export function loadLevel(state: BallBounceState, level: number): void {
  const { blocks, nextId } = buildLevelBlocks(level, state.world.width, state.nextId);
  state.nextId = nextId;
  state.blocks = blocks;
  state.level = {
    number: level,
    baseSpeed: levelBaseSpeed(level),
    totalBlocks: blocks.length,
    serveTimer: 0,
    clearTimer: 0,
  };
  state.powerUps.items = [];
  state.balls = [createStuckBall(state)];
}

export function createInitialState(
  highScore = 0,
  worldWidth: number = DEFAULT_WORLD_WIDTH,
): BallBounceState {
  const state: BallBounceState = {
    status: 'idle',
    pausedFrom: null,
    world: { width: worldWidth, height: WORLD_HEIGHT },
    countdown: COUNTDOWN_SECONDS,
    player: {
      lives: STARTING_LIVES,
      paddle: {
        x: worldWidth / 2,
        y: PADDLE_Y,
        width: PADDLE_WIDTH,
        height: PADDLE_HEIGHT,
        vx: 0,
      },
    },
    balls: [],
    blocks: [],
    powerUps: { items: [], wideTimer: 0, slowTimer: 0 },
    level: {
      number: 1,
      baseSpeed: levelBaseSpeed(1),
      totalBlocks: 0,
      serveTimer: 0,
      clearTimer: 0,
    },
    score: {
      score: 0,
      highScore,
      startingHighScore: highScore,
      combo: 0,
      bestCombo: 0,
      blocksBroken: 0,
    },
    nextId: 1,
  };
  loadLevel(state, 1);
  return state;
}

/** Fresh run that keeps the world size and best score, then counts down. */
export function startGame(prev: BallBounceState): BallBounceState {
  const next = createInitialState(prev.score.highScore, prev.world.width);
  next.status = 'countdown';
  next.countdown = COUNTDOWN_SECONDS;
  return next;
}

export function pauseGame(state: BallBounceState): void {
  if (
    state.status === 'playing' ||
    state.status === 'countdown' ||
    state.status === 'level-clear'
  ) {
    state.pausedFrom = state.status;
    state.status = 'paused';
  }
}

export function resumeGame(state: BallBounceState): void {
  if (state.status !== 'paused') return;
  state.status = state.pausedFrom ?? 'playing';
  state.pausedFrom = null;
}

/**
 * Adapts the world to a new viewport width by scaling horizontal positions, so a resize
 * or rotation mid-game keeps the layout intact instead of restarting the level.
 */
export function resizeWorld(state: BallBounceState, width: number): void {
  const prev = state.world.width;
  if (Math.abs(prev - width) < 0.5) return;
  const k = width / prev;
  state.world.width = width;

  for (const block of state.blocks) {
    block.x *= k;
    block.w *= k;
  }
  for (const ball of state.balls) {
    ball.x = Math.min(width - ball.radius, ball.x * k);
    for (const p of ball.trail) p.x *= k;
  }
  for (const item of state.powerUps.items) item.x *= k;

  const paddle = state.player.paddle;
  paddle.x = Math.min(width - paddle.width / 2, Math.max(paddle.width / 2, paddle.x * k));
}
