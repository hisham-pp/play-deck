import type { Obstacle, Vec2 } from '../types/shadow-tag.types';

export function vec(x: number, y: number): Vec2 {
  return { x, y };
}

export function add(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function sub(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function scale(a: Vec2, k: number): Vec2 {
  return { x: a.x * k, y: a.y * k };
}

export function length(a: Vec2): number {
  return Math.hypot(a.x, a.y);
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

/** Closest parameter along segment `a → b` to `p`, clamped to the segment. */
export function closestParamOnSegment(a: Vec2, b: Vec2, p: Vec2): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq < 1e-6) return 0;
  return clamp(((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq, 0, 1);
}

export function pointAt(a: Vec2, b: Vec2, t: number): Vec2 {
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) };
}

/** Shortest distance from `p` to the segment `a → b`. */
export function distanceToSegment(a: Vec2, b: Vec2, p: Vec2): number {
  return distance(pointAt(a, b, closestParamOnSegment(a, b, p)), p);
}

export function expandObstacle(box: Obstacle, pad: number): Obstacle {
  return { x: box.x - pad, y: box.y - pad, w: box.w + pad * 2, h: box.h + pad * 2 };
}

export function containsPoint(box: Obstacle, p: Vec2): boolean {
  return p.x >= box.x && p.x <= box.x + box.w && p.y >= box.y && p.y <= box.y + box.h;
}

/**
 * Slab test for a segment against an axis-aligned box. Used both for light
 * occlusion and for the bots' line of sight, so it has to be exact rather than
 * sampled — a lamp either reaches a runner or it does not.
 */
export function segmentHitsBox(a: Vec2, b: Vec2, box: Obstacle): boolean {
  if (containsPoint(box, a) || containsPoint(box, b)) return true;

  const dx = b.x - a.x;
  const dy = b.y - a.y;
  let tMin = 0;
  let tMax = 1;

  const axes: [number, number, number, number][] = [
    [dx, a.x, box.x, box.x + box.w],
    [dy, a.y, box.y, box.y + box.h],
  ];

  for (const [delta, origin, lo, hi] of axes) {
    if (Math.abs(delta) < 1e-6) {
      if (origin < lo || origin > hi) return false;
      continue;
    }
    const t1 = (lo - origin) / delta;
    const t2 = (hi - origin) / delta;
    tMin = Math.max(tMin, Math.min(t1, t2));
    tMax = Math.min(tMax, Math.max(t1, t2));
    if (tMin > tMax) return false;
  }

  return true;
}

export function segmentBlocked(a: Vec2, b: Vec2, obstacles: Obstacle[]): boolean {
  return obstacles.some((box) => segmentHitsBox(a, b, box));
}
