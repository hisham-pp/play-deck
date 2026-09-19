import type { Obstacle, Vec2 } from '../types/giant.types';

export function sub(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function distance(a: Vec2, b: Vec2): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function normalize(a: Vec2): Vec2 {
  const len = Math.hypot(a.x, a.y);
  return len < 1e-6 ? { x: 0, y: 0 } : { x: a.x / len, y: a.y / len };
}

export function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Wraps an angle into -PI..PI, so drifting limbs always take the short way round. */
export function wrapAngle(radians: number): number {
  let angle = radians;
  while (angle > Math.PI) angle -= Math.PI * 2;
  while (angle < -Math.PI) angle += Math.PI * 2;
  return angle;
}

export function containsPoint(box: Obstacle, p: Vec2): boolean {
  return p.x >= box.x && p.x <= box.x + box.w && p.y >= box.y && p.y <= box.y + box.h;
}

/** Nearest point on an axis-aligned box to `p`, which may be `p` itself. */
export function closestOnBox(box: Obstacle, p: Vec2): Vec2 {
  return {
    x: clamp(p.x, box.x, box.x + box.w),
    y: clamp(p.y, box.y, box.y + box.h),
  };
}

export function distanceToBox(box: Obstacle, p: Vec2): number {
  return distance(closestOnBox(box, p), p);
}

/** Closest point to `p` on the segment `a → b`. */
export function closestOnSegment(a: Vec2, b: Vec2, p: Vec2): Vec2 {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq < 1e-6) return { ...a };
  const t = clamp(((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq, 0, 1);
  return { x: a.x + dx * t, y: a.y + dy * t };
}

export function distanceToSegment(a: Vec2, b: Vec2, p: Vec2): number {
  return distance(closestOnSegment(a, b, p), p);
}

/** Where a limb of `length` swung from `pivot` at `angle` ends up. */
export function limbTip(pivot: Vec2, angle: number, length: number): Vec2 {
  return { x: pivot.x + Math.cos(angle) * length, y: pivot.y + Math.sin(angle) * length };
}
