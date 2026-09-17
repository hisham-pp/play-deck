import type { BallState, PaddleState } from '../types/ball-bounce.types';
import { MAX_BOUNCE_ANGLE, MIN_VERTICAL_RATIO, PADDLE_MAX_SPEED } from './ball-bounce-constants';

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Contact {
  /** Unit normal pointing from the rect toward the ball. */
  nx: number;
  ny: number;
  depth: number;
}

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export function paddleRect(paddle: PaddleState): Rect {
  return {
    x: paddle.x - paddle.width / 2,
    y: paddle.y,
    w: paddle.width,
    h: paddle.height,
  };
}

export function rectsOverlap(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

/** Circle vs axis-aligned rect. Corner hits produce diagonal normals for natural deflections. */
export function circleRectContact(cx: number, cy: number, radius: number, r: Rect): Contact | null {
  const px = clamp(cx, r.x, r.x + r.w);
  const py = clamp(cy, r.y, r.y + r.h);
  const dx = cx - px;
  const dy = cy - py;
  const d2 = dx * dx + dy * dy;
  if (d2 >= radius * radius) return null;

  if (d2 > 1e-9) {
    const d = Math.sqrt(d2);
    return { nx: dx / d, ny: dy / d, depth: radius - d };
  }

  // Center is inside the rect (tunnelled or spawned inside): exit along the shallowest side.
  const left = cx - r.x;
  const right = r.x + r.w - cx;
  const top = cy - r.y;
  const bottom = r.y + r.h - cy;
  const min = Math.min(left, right, top, bottom);
  if (min === top) return { nx: 0, ny: -1, depth: top + radius };
  if (min === bottom) return { nx: 0, ny: 1, depth: bottom + radius };
  if (min === left) return { nx: -1, ny: 0, depth: left + radius };
  return { nx: 1, ny: 0, depth: right + radius };
}

/** Reflects velocity about the contact normal and pushes the ball out of the surface. */
export function resolveContact(ball: BallState, contact: Contact): void {
  ball.x += contact.nx * contact.depth;
  ball.y += contact.ny * contact.depth;
  const dot = ball.vx * contact.nx + ball.vy * contact.ny;
  if (dot < 0) {
    ball.vx -= 2 * dot * contact.nx;
    ball.vy -= 2 * dot * contact.ny;
  }
}

export function speedOf(ball: BallState): number {
  return Math.hypot(ball.vx, ball.vy);
}

export function setSpeed(ball: BallState, speed: number): void {
  const current = speedOf(ball);
  if (current < 1e-6) {
    ball.vx = 0;
    ball.vy = -speed;
    return;
  }
  ball.vx = (ball.vx / current) * speed;
  ball.vy = (ball.vy / current) * speed;
}

/** Prevents near-horizontal trajectories that would stall play. */
export function enforceMinVertical(ball: BallState): void {
  const speed = speedOf(ball);
  if (speed < 1e-6) return;
  const minVy = speed * MIN_VERTICAL_RATIO;
  if (Math.abs(ball.vy) >= minVy) return;
  const sign = ball.vy === 0 ? -1 : Math.sign(ball.vy);
  ball.vy = sign * minVy;
  ball.vx = Math.sign(ball.vx || 1) * Math.sqrt(speed * speed - minVy * minVy);
}

/**
 * Classic arcade paddle response: where the ball lands decides the outgoing angle,
 * with a light nudge from paddle motion. Predictable, but still skill-expressive.
 */
export function bounceOffPaddle(ball: BallState, paddle: PaddleState, speed: number): void {
  const offset = clamp((ball.x - paddle.x) / (paddle.width / 2), -1, 1);
  const nudge = clamp(paddle.vx / PADDLE_MAX_SPEED, -1, 1) * 0.12;
  const angle = clamp(offset * MAX_BOUNCE_ANGLE + nudge, -MAX_BOUNCE_ANGLE, MAX_BOUNCE_ANGLE);
  ball.vx = Math.sin(angle) * speed;
  ball.vy = -Math.cos(angle) * speed;
  ball.y = paddle.y - ball.radius;
}

export function rotateVelocity(ball: BallState, radians: number): void {
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const vx = ball.vx * cos - ball.vy * sin;
  const vy = ball.vx * sin + ball.vy * cos;
  ball.vx = vx;
  ball.vy = vy;
}
