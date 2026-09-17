import type { BallBounceEvent, BallBounceState, PowerUpKind } from '../types/ball-bounce.types';
import {
  LIFE_BONUS_POINTS,
  MAX_BALLS,
  MAX_LIVES,
  POWER_UP_DROP_CHANCE,
  POWER_UP_FALL_SPEED,
  POWER_UP_SIZE,
  POWER_UP_WEIGHTS,
  SLOW_DURATION,
  WIDE_DURATION,
} from './ball-bounce-constants';
import { paddleRect, rectsOverlap, rotateVelocity } from './ball-bounce-physics';

const MAX_FALLING_POWER_UPS = 3;
const MULTI_BALL_SPREAD = 0.38;

export function pickPowerUpKind(roll: number): PowerUpKind {
  const total = POWER_UP_WEIGHTS.reduce((sum, [, w]) => sum + w, 0);
  let threshold = roll * total;
  for (const [kind, weight] of POWER_UP_WEIGHTS) {
    threshold -= weight;
    if (threshold < 0) return kind;
  }
  return POWER_UP_WEIGHTS[0][0];
}

export function maybeDropPowerUp(
  state: BallBounceState,
  x: number,
  y: number,
  rng: () => number,
): void {
  if (state.powerUps.items.length >= MAX_FALLING_POWER_UPS) return;
  if (rng() >= POWER_UP_DROP_CHANCE) return;
  state.powerUps.items.push({
    id: state.nextId++,
    kind: pickPowerUpKind(rng()),
    x,
    y,
    vy: POWER_UP_FALL_SPEED,
  });
}

function splitBalls(state: BallBounceState, launch: (s: BallBounceState) => void): void {
  if (state.balls.some((b) => b.stuck)) launch(state);
  const sources = state.balls.slice();
  for (const source of sources) {
    for (const dir of [-1, 1]) {
      if (state.balls.length >= MAX_BALLS) return;
      const clone = {
        ...source,
        id: state.nextId++,
        trail: [],
      };
      rotateVelocity(clone, dir * MULTI_BALL_SPREAD);
      state.balls.push(clone);
    }
  }
}

export function applyPowerUp(
  state: BallBounceState,
  kind: PowerUpKind,
  launch: (s: BallBounceState) => void,
): void {
  switch (kind) {
    case 'wide':
      state.powerUps.wideTimer = WIDE_DURATION;
      break;
    case 'slow':
      state.powerUps.slowTimer = SLOW_DURATION;
      break;
    case 'life':
      if (state.player.lives < MAX_LIVES) {
        state.player.lives += 1;
      } else {
        state.score.score += LIFE_BONUS_POINTS;
      }
      break;
    case 'multi':
      splitBalls(state, launch);
      break;
  }
}

/** Moves falling capsules, applying any the paddle catches. */
export function updatePowerUps(
  state: BallBounceState,
  dt: number,
  events: BallBounceEvent[],
  launch: (s: BallBounceState) => void,
): void {
  const { powerUps } = state;
  powerUps.wideTimer = Math.max(0, powerUps.wideTimer - dt);
  powerUps.slowTimer = Math.max(0, powerUps.slowTimer - dt);

  const paddle = paddleRect(state.player.paddle);
  const kept = [];
  for (const item of powerUps.items) {
    item.y += item.vy * dt;
    const box = {
      x: item.x - POWER_UP_SIZE.w / 2,
      y: item.y - POWER_UP_SIZE.h / 2,
      w: POWER_UP_SIZE.w,
      h: POWER_UP_SIZE.h,
    };
    if (rectsOverlap(box, paddle)) {
      applyPowerUp(state, item.kind, launch);
      events.push({ type: 'power-up', x: item.x, y: item.y, kind: item.kind });
    } else if (box.y <= state.world.height) {
      kept.push(item);
    }
  }
  powerUps.items = kept;
}
