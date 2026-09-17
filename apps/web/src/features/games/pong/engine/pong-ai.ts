import { AI_DIFFICULTY_JITTER, PONG_ARENA_HEIGHT, PONG_ARENA_WIDTH } from './pong-constants';
import type { Ball, Paddle, PaddleInput, PongDifficulty } from './pong-types';

/**
 * Predicts the Y coordinate where the ball will arrive at a given X target,
 * accounting for bounces off top and bottom boundaries.
 */
export function predictBallY(
  ball: Ball,
  targetX: number,
  arenaHeight: number = PONG_ARENA_HEIGHT,
): number {
  if (ball.vx <= 0) {
    return arenaHeight / 2;
  }

  const time = (targetX - ball.x) / ball.vx;
  if (time <= 0) return ball.y;

  const effectiveHeight = arenaHeight - 2 * ball.radius;
  if (effectiveHeight <= 0) return ball.y;

  // Unbounded prospective Y relative to top bounce limit
  const unboundedY = ball.y - ball.radius + ball.vy * time;
  const cycle = 2 * effectiveHeight;

  let pos = unboundedY % cycle;
  if (pos < 0) pos += cycle;

  if (pos > effectiveHeight) {
    pos = cycle - pos;
  }

  return pos + ball.radius;
}

/**
 * Computes the simulated paddle input for the AI opponent.
 */
export function computeAiInput(
  paddle: Paddle,
  ball: Ball,
  difficulty: PongDifficulty,
  arenaWidth: number = PONG_ARENA_WIDTH,
  arenaHeight: number = PONG_ARENA_HEIGHT,
  customJitter?: number,
): PaddleInput {
  const centerCourtX = arenaWidth * 0.5;
  const paddleCenterY = paddle.y + paddle.height / 2;
  const jitterMax = AI_DIFFICULTY_JITTER[difficulty];
  const jitter = customJitter ?? (Math.random() * 2 - 1) * jitterMax;

  let targetY = arenaHeight / 2;

  switch (difficulty) {
    case 'easy': {
      // Only react when ball has crossed past 45% of the court and is heading towards AI
      if (ball.vx > 0 && ball.x >= centerCourtX * 0.9) {
        targetY = ball.y + jitter;
      } else {
        targetY = arenaHeight / 2;
      }
      break;
    }

    case 'medium': {
      // Tracks ball when moving towards AI, slight error margin
      if (ball.vx > 0) {
        targetY = ball.y + jitter;
      } else {
        targetY = arenaHeight / 2;
      }
      break;
    }

    case 'hard': {
      // Predicts exact trajectory with wall bounces
      if (ball.vx > 0) {
        const predicted = predictBallY(ball, paddle.x, arenaHeight);
        // Slightly bias hit point towards upper or lower half of paddle to return sharp angles
        const offset = ball.y > arenaHeight / 2 ? 14 : -14;
        targetY = predicted + offset + jitter;
      } else {
        targetY = arenaHeight / 2;
      }
      break;
    }
  }

  // Deadzone to prevent jittery twitching when close to target
  const deadzone = 8;
  const diff = targetY - paddleCenterY;

  if (Math.abs(diff) <= deadzone) {
    return { up: false, down: false, targetY: null };
  }

  return {
    up: diff < 0,
    down: diff > 0,
    targetY,
  };
}
