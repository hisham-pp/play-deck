import type { Terrain, Vec2 } from './summit-types';

export interface ContactResult {
  depth: number;
  normal: Vec2;
  point: Vec2;
}

const UP: Vec2 = { x: 0, y: 1 };

/** Index of the segment [i, i+1] that contains x (clamped to the polyline). */
export function segmentIndexAt(points: Vec2[], x: number): number {
  let lo = 0;
  let hi = points.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (points[mid].x <= x) lo = mid;
    else hi = mid - 1;
  }
  return Math.max(0, Math.min(points.length - 2, lo));
}

export function groundHeightAt(terrain: Terrain, x: number): number {
  const pts = terrain.points;
  const i = segmentIndexAt(pts, x);
  const a = pts[i];
  const b = pts[i + 1];
  const dx = b.x - a.x;
  if (dx < 1e-6) return Math.max(a.y, b.y);
  const t = Math.max(0, Math.min(1, (x - a.x) / dx));
  return a.y + (b.y - a.y) * t;
}

function segmentNormal(a: Vec2, b: Vec2): Vec2 {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  // Left-hand normal of a left-to-right segment points "up/out" of the ground.
  return { x: -dy / len, y: dx / len };
}

export function groundNormalAt(terrain: Terrain, x: number): Vec2 {
  const pts = terrain.points;
  const i = segmentIndexAt(pts, x);
  const a = pts[i];
  const b = pts[i + 1];
  if (b.x - a.x < 1e-6) return UP;
  return segmentNormal(a, b);
}

/** Slope angle of the ground at x (radians, positive = uphill). */
export function groundAngleAt(terrain: Terrain, x: number): number {
  const n = groundNormalAt(terrain, x);
  return Math.atan2(-n.x, n.y);
}

function closestOnSegment(p: Vec2, a: Vec2, b: Vec2): Vec2 {
  const abx = b.x - a.x;
  const aby = b.y - a.y;
  const lenSq = abx * abx + aby * aby;
  if (lenSq < 1e-12) return { x: a.x, y: a.y };
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * abx + (p.y - a.y) * aby) / lenSq));
  return { x: a.x + abx * t, y: a.y + aby * t };
}

/**
 * Circle vs polyline. Handles both shallow overlap (closest point) and deep
 * tunnelling (centre below the surface), returning the deepest contact.
 */
export function circleContact(
  terrain: Terrain,
  center: Vec2,
  radius: number,
): ContactResult | null {
  const pts = terrain.points;
  if (pts.length < 2) return null;

  const surface = groundHeightAt(terrain, center.x);
  if (center.y < surface) {
    const n = groundNormalAt(terrain, center.x);
    return {
      depth: radius + (surface - center.y) * n.y,
      normal: n,
      point: { x: center.x, y: surface },
    };
  }

  const first = segmentIndexAt(pts, center.x - radius);
  const last = Math.min(pts.length - 2, segmentIndexAt(pts, center.x + radius) + 1);
  let best: ContactResult | null = null;

  for (let i = first; i <= last; i++) {
    const q = closestOnSegment(center, pts[i], pts[i + 1]);
    const dx = center.x - q.x;
    const dy = center.y - q.y;
    const dist = Math.hypot(dx, dy);
    const depth = radius - dist;
    if (depth <= 0 || (best && depth <= best.depth)) continue;
    const normal = dist > 1e-6 ? { x: dx / dist, y: dy / dist } : segmentNormal(pts[i], pts[i + 1]);
    best = { depth, normal, point: q };
  }
  return best;
}

/** Point test used for hull samples: depth below the surface, or null. */
export function pointContact(terrain: Terrain, p: Vec2): ContactResult | null {
  const surface = groundHeightAt(terrain, p.x);
  if (p.y >= surface) return null;
  const n = groundNormalAt(terrain, p.x);
  return { depth: (surface - p.y) * n.y, normal: n, point: { x: p.x, y: surface } };
}
