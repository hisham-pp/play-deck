import type {
  BallBounceEvent,
  BallBounceInput,
  BallBounceState,
  BallState,
} from '../types/ball-bounce.types';
import {
  BALL_TRAIL_LENGTH,
  BLOCK_POINTS,
  IN_LEVEL_SPEED_RAMP,
  LEVEL_CLEAR_BONUS,
  LEVEL_CLEAR_SECONDS,
  SERVE_DELAY_SECONDS,
  SLOW_MOTION_SCALE,
  comboMultiplier,
} from './ball-bounce-constants';
import { updatePaddle } from './ball-bounce-paddle';
import {
  bounceOffPaddle,
  circleRectContact,
  clamp,
  enforceMinVertical,
  paddleRect,
  resolveContact,
  setSpeed,
} from './ball-bounce-physics';
import { maybeDropPowerUp, updatePowerUps } from './ball-bounce-power-ups';
import { createStuckBall, loadLevel } from './ball-bounce-state';

/** Upper bound on a single frame, so a backgrounded tab never teleports the ball. */
export const MAX_FRAME_DT = 1 / 30;

export function currentBallSpeed(state: BallBounceState): number {
  const { totalBlocks, baseSpeed } = state.level;
  const cleared = totalBlocks > 0 ? 1 - state.blocks.length / totalBlocks : 0;
  return baseSpeed * (1 + IN_LEVEL_SPEED_RAMP * cleared);
}

export function launchStuckBalls(state: BallBounceState): void {
  const speed = currentBallSpeed(state);
  const paddle = state.player.paddle;
  for (const ball of state.balls) {
    if (!ball.stuck) continue;
    ball.stuck = false;
    // Serve slightly in the direction the paddle is travelling, defaulting right.
    const lean = paddle.vx < -1 ? -1 : 1;
    const angle = lean * 0.3;
    ball.vx = Math.sin(angle) * speed;
    ball.vy = -Math.cos(angle) * speed;
  }
}

function breakBlock(
  state: BallBounceState,
  index: number,
  events: BallBounceEvent[],
  rng: () => number,
): void {
  const block = state.blocks[index];
  const cx = block.x + block.w / 2;
  const cy = block.y + block.h / 2;
  const { score } = state;
  score.combo += 1;
  score.bestCombo = Math.max(score.bestCombo, score.combo);
  score.blocksBroken += 1;
  const points = BLOCK_POINTS * block.maxHp * comboMultiplier(score.combo);
  score.score += points;
  state.blocks.splice(index, 1);
  events.push({
    type: 'block-break',
    x: cx,
    y: cy,
    maxHp: block.maxHp,
    points,
    combo: score.combo,
  });
  maybeDropPowerUp(state, cx, cy, rng);
}

function collideBlocks(
  state: BallBounceState,
  ball: BallState,
  events: BallBounceEvent[],
  rng: () => number,
): void {
  let hitIndex = -1;
  let best: ReturnType<typeof circleRectContact> = null;
  for (let i = 0; i < state.blocks.length; i++) {
    const contact = circleRectContact(ball.x, ball.y, ball.radius, state.blocks[i]);
    if (contact && (!best || contact.depth > best.depth)) {
      best = contact;
      hitIndex = i;
    }
  }
  if (!best) return;

  resolveContact(ball, best);
  enforceMinVertical(ball);
  const block = state.blocks[hitIndex];
  block.hp -= 1;
  if (block.hp <= 0) {
    breakBlock(state, hitIndex, events, rng);
  } else {
    block.flash = 1;
    events.push({
      type: 'block-hit',
      x: block.x + block.w / 2,
      y: block.y + block.h / 2,
      hp: block.hp,
    });
  }
}

function moveBall(
  state: BallBounceState,
  ball: BallState,
  dt: number,
  speed: number,
  events: BallBounceEvent[],
  rng: () => number,
): void {
  const { width } = state.world;
  const r = ball.radius;
  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;

  if (ball.x < r || ball.x > width - r) {
    ball.x = clamp(ball.x, r, width - r);
    ball.vx = ball.x <= r ? Math.abs(ball.vx) : -Math.abs(ball.vx);
    events.push({ type: 'wall', x: ball.x, y: ball.y });
  }
  if (ball.y < r) {
    ball.y = r;
    ball.vy = Math.abs(ball.vy);
    events.push({ type: 'wall', x: ball.x, y: ball.y });
  }

  const paddle = state.player.paddle;
  if (ball.vy > 0 && circleRectContact(ball.x, ball.y, r, paddleRect(paddle))) {
    // Only bounce while the ball is still above the paddle's midline.
    if (ball.y <= paddle.y + paddle.height / 2) {
      bounceOffPaddle(ball, paddle, speed);
      events.push({ type: 'paddle', x: ball.x, y: paddle.y });
    }
  }

  collideBlocks(state, ball, events, rng);
}

function updateBalls(
  state: BallBounceState,
  dt: number,
  events: BallBounceEvent[],
  rng: () => number,
) {
  if (state.balls.length === 0) return;
  const speed = currentBallSpeed(state);
  const scaled = dt * (state.powerUps.slowTimer > 0 ? SLOW_MOTION_SCALE : 1);
  // Sub-step so a fast ball never moves more than half its radius per step (no tunnelling).
  const maxStep = Math.max(...state.balls.map((b) => b.radius)) * 0.5;
  const steps = Math.max(1, Math.ceil((speed * scaled) / maxStep));
  const sub = scaled / steps;

  for (const ball of state.balls) {
    if (ball.stuck) continue;
    setSpeed(ball, speed);
    for (let i = 0; i < steps && ball.y - ball.radius <= state.world.height; i++) {
      moveBall(state, ball, sub, speed, events, rng);
    }
    ball.trail.unshift({ x: ball.x, y: ball.y });
    if (ball.trail.length > BALL_TRAIL_LENGTH) ball.trail.length = BALL_TRAIL_LENGTH;
  }

  const survivors = state.balls.filter((b) => b.y - b.radius <= state.world.height);
  for (const lost of state.balls) {
    if (!survivors.includes(lost)) events.push({ type: 'ball-lost', x: lost.x });
  }
  state.balls = survivors;
}

function loseLife(state: BallBounceState, events: BallBounceEvent[]): void {
  state.player.lives -= 1;
  state.score.combo = 0;
  state.powerUps = { items: [], wideTimer: 0, slowTimer: 0 };
  events.push({ type: 'life-lost', livesLeft: state.player.lives });

  if (state.player.lives <= 0) {
    state.status = 'over';
    state.score.highScore = Math.max(state.score.highScore, state.score.score);
    events.push({ type: 'game-over', score: state.score.score });
    return;
  }
  state.balls = [createStuckBall(state)];
  state.level.serveTimer = SERVE_DELAY_SECONDS * 1.4;
}

function updatePlaying(
  state: BallBounceState,
  input: BallBounceInput,
  dt: number,
  events: BallBounceEvent[],
  rng: () => number,
): void {
  if (state.balls.some((b) => b.stuck)) {
    state.level.serveTimer -= dt;
    if (state.level.serveTimer <= 0 || input.launch) {
      launchStuckBalls(state);
      events.push({ type: 'launch' });
    }
  }

  updateBalls(state, dt, events, rng);
  updatePowerUps(state, dt, events, launchStuckBalls);
  for (const block of state.blocks) block.flash = Math.max(0, block.flash - dt * 6);

  if (state.blocks.length === 0) {
    state.status = 'level-clear';
    state.level.clearTimer = LEVEL_CLEAR_SECONDS;
    state.score.score += LEVEL_CLEAR_BONUS * state.level.number;
    state.powerUps.items = [];
    events.push({ type: 'level-clear', level: state.level.number });
  } else if (state.balls.length === 0) {
    loseLife(state, events);
  }
}

/**
 * Advances the simulation by `dt` seconds, mutating `state` in place (it runs every frame,
 * so avoiding allocations matters). Returns what happened so the view can add sound and juice.
 */
export function stepGame(
  state: BallBounceState,
  input: BallBounceInput,
  rawDt: number,
  rng: () => number = Math.random,
): BallBounceEvent[] {
  const events: BallBounceEvent[] = [];
  const dt = clamp(rawDt, 0, MAX_FRAME_DT);

  switch (state.status) {
    case 'countdown':
      updatePaddle(state, input, dt);
      state.countdown -= dt;
      if (state.countdown <= 0) {
        state.countdown = 0;
        state.status = 'playing';
        state.level.serveTimer = 0;
      }
      break;
    case 'level-clear':
      updatePaddle(state, input, dt);
      state.level.clearTimer -= dt;
      if (state.level.clearTimer <= 0) {
        loadLevel(state, state.level.number + 1);
        state.level.serveTimer = SERVE_DELAY_SECONDS;
        state.status = 'playing';
        events.push({ type: 'level-start', level: state.level.number });
      }
      break;
    case 'playing':
      updatePaddle(state, input, dt);
      updatePlaying(state, input, dt, events, rng);
      break;
    default:
      break;
  }

  state.score.highScore = Math.max(state.score.highScore, state.score.score);
  return events;
}
