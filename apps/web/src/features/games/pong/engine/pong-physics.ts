import {
  BALL_MAX_BOUNCE_ANGLE,
  BALL_MAX_SPEED,
  BALL_SPEED_INCREMENT,
  PONG_ARENA_HEIGHT,
  PONG_ARENA_WIDTH,
} from './pong-constants';
import type { Ball, Paddle, PaddleInput, PongEvent } from './pong-types';

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

/**
 * Updates a paddle's position based on inputs and delta time.
 */
export function updatePaddlePosition(
  paddle: Paddle,
  input: PaddleInput,
  speed: number,
  dt: number,
  arenaHeight: number = PONG_ARENA_HEIGHT,
): Paddle {
  let newY = paddle.y;
  let vy: number;

  if (input.targetY !== undefined && input.targetY !== null) {
    // Direct target positioning (touch / mouse / AI)
    const desiredY = input.targetY - paddle.height / 2;
    const diff = desiredY - paddle.y;
    const maxStep = speed * dt;

    if (Math.abs(diff) <= maxStep) {
      newY = desiredY;
      vy = dt > 0 ? diff / dt : 0;
    } else {
      const dir = Math.sign(diff);
      newY += dir * maxStep;
      vy = dir * speed;
    }
  } else {
    // Digital keyboard input
    if (input.up && !input.down) {
      vy = -speed;
      newY += vy * dt;
    } else if (input.down && !input.up) {
      vy = speed;
      newY += vy * dt;
    } else {
      vy = 0;
    }
  }

  const maxY = arenaHeight - paddle.height;
  newY = clamp(newY, 0, maxY);

  return {
    ...paddle,
    y: newY,
    vy,
  };
}

export interface PhysicsStepResult {
  ball: Ball;
  rally: number;
  events: PongEvent[];
}

/**
 * Advances ball physics by dt, checks collisions with walls and paddles.
 */
export function updateBallPhysics(
  prevBall: Ball,
  player1: Paddle,
  player2: Paddle,
  currentRally: number,
  dt: number,
  arenaWidth: number = PONG_ARENA_WIDTH,
  arenaHeight: number = PONG_ARENA_HEIGHT,
): PhysicsStepResult {
  const events: PongEvent[] = [];
  let rally = currentRally;

  // Next candidate position
  let x = prevBall.x + prevBall.vx * dt;
  let y = prevBall.y + prevBall.vy * dt;
  let vx = prevBall.vx;
  let vy = prevBall.vy;
  let speed = prevBall.speed;

  // 1. Top and bottom wall collisions
  if (y - prevBall.radius <= 0 && vy < 0) {
    y = prevBall.radius;
    vy = Math.abs(vy);
    events.push({ type: 'wall-hit' });
  } else if (y + prevBall.radius >= arenaHeight && vy > 0) {
    y = arenaHeight - prevBall.radius;
    vy = -Math.abs(vy);
    events.push({ type: 'wall-hit' });
  }

  // 2. Left Paddle collision (Player 1)
  const p1Right = player1.x + player1.width;
  const p1Top = player1.y - prevBall.radius;
  const p1Bottom = player1.y + player1.height + prevBall.radius;

  if (vx < 0) {
    const prevBallLeft = prevBall.x - prevBall.radius;
    const nextBallLeft = x - prevBall.radius;

    // Check if ball swept through or overlaps paddle face
    if (prevBallLeft >= p1Right - 4 && nextBallLeft <= p1Right && y >= p1Top && y <= p1Bottom) {
      // Calculate hit angle based on contact offset from paddle center
      const paddleCenterY = player1.y + player1.height / 2;
      const hitFactor = clamp((y - paddleCenterY) / (player1.height / 2), -1, 1);
      const bounceAngle = hitFactor * BALL_MAX_BOUNCE_ANGLE;

      speed = Math.min(BALL_MAX_SPEED, speed * BALL_SPEED_INCREMENT);
      vx = Math.abs(Math.cos(bounceAngle) * speed);
      vy = Math.sin(bounceAngle) * speed;
      x = p1Right + prevBall.radius;
      rally += 1;

      events.push({
        type: 'paddle-hit',
        side: 'left',
        ballSpeed: speed,
        rally,
      });
    }
  }

  // 3. Right Paddle collision (Player 2 / AI)
  const p2Left = player2.x;
  const p2Top = player2.y - prevBall.radius;
  const p2Bottom = player2.y + player2.height + prevBall.radius;

  if (vx > 0) {
    const prevBallRight = prevBall.x + prevBall.radius;
    const nextBallRight = x + prevBall.radius;

    if (prevBallRight <= p2Left + 4 && nextBallRight >= p2Left && y >= p2Top && y <= p2Bottom) {
      const paddleCenterY = player2.y + player2.height / 2;
      const hitFactor = clamp((y - paddleCenterY) / (player2.height / 2), -1, 1);
      const bounceAngle = hitFactor * BALL_MAX_BOUNCE_ANGLE;

      speed = Math.min(BALL_MAX_SPEED, speed * BALL_SPEED_INCREMENT);
      vx = -Math.abs(Math.cos(bounceAngle) * speed);
      vy = Math.sin(bounceAngle) * speed;
      x = p2Left - prevBall.radius;
      rally += 1;

      events.push({
        type: 'paddle-hit',
        side: 'right',
        ballSpeed: speed,
        rally,
      });
    }
  }

  // 4. Scoring triggers (ball passed paddles beyond arena boundaries)
  if (x + prevBall.radius < 0) {
    events.push({
      type: 'point-scored',
      scorer: 'right',
    });
  } else if (x - prevBall.radius > arenaWidth) {
    events.push({
      type: 'point-scored',
      scorer: 'left',
    });
  }

  return {
    ball: {
      x,
      y,
      radius: prevBall.radius,
      vx,
      vy,
      speed,
    },
    rally,
    events,
  };
}
