import type { BallBounceInput, BallBounceState } from '../types/ball-bounce.types';
import {
  PADDLE_ACCEL,
  PADDLE_FOLLOW_RATE,
  PADDLE_MAX_SPEED,
  PADDLE_RESIZE_RATE,
  PADDLE_WIDTH,
  WIDE_PADDLE_SCALE,
} from './ball-bounce-constants';
import { clamp } from './ball-bounce-physics';

/**
 * Pointer input eases the paddle toward the finger/cursor; keyboard input accelerates it,
 * so both feel smooth without being floaty. Stuck balls ride along.
 */
export function updatePaddle(state: BallBounceState, input: BallBounceInput, dt: number): void {
  const paddle = state.player.paddle;
  const targetWidth = PADDLE_WIDTH * (state.powerUps.wideTimer > 0 ? WIDE_PADDLE_SCALE : 1);
  paddle.width += (targetWidth - paddle.width) * (1 - Math.exp(-PADDLE_RESIZE_RATE * dt));

  const prevX = paddle.x;
  if (input.pointerX !== null) {
    const follow = 1 - Math.exp(-PADDLE_FOLLOW_RATE * dt);
    paddle.x += (input.pointerX - paddle.x) * follow;
    paddle.vx = dt > 0 ? (paddle.x - prevX) / dt : 0;
  } else {
    const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    const target = dir * PADDLE_MAX_SPEED;
    const maxDelta = PADDLE_ACCEL * dt;
    paddle.vx += clamp(target - paddle.vx, -maxDelta, maxDelta);
    paddle.x += paddle.vx * dt;
  }

  const half = paddle.width / 2;
  const clamped = clamp(paddle.x, half, state.world.width - half);
  if (clamped !== paddle.x) {
    paddle.x = clamped;
    paddle.vx = 0;
  }

  for (const ball of state.balls) {
    if (!ball.stuck) continue;
    ball.x = paddle.x;
    ball.y = paddle.y - ball.radius - 1;
  }
}
