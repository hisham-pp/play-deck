/** Minimal 2D vector maths for the elevator's rigid-body solver. */

export interface Vec2 {
  x: number;
  y: number;
}

export function vec(x: number, y: number): Vec2 {
  return { x, y };
}

export function add(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function sub(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function scale(a: Vec2, s: number): Vec2 {
  return { x: a.x * s, y: a.y * s };
}

export function neg(a: Vec2): Vec2 {
  return { x: -a.x, y: -a.y };
}

export function dot(a: Vec2, b: Vec2): number {
  return a.x * b.x + a.y * b.y;
}

/** The z component of the 3D cross product of two flat vectors. */
export function cross(a: Vec2, b: Vec2): number {
  return a.x * b.y - a.y * b.x;
}

/** Cross of a vector with a scalar angular value: `v × s`. */
export function crossVecScalar(v: Vec2, s: number): Vec2 {
  return { x: s * v.y, y: -s * v.x };
}

/** Cross of a scalar angular value with a vector: `s × v`. */
export function crossScalarVec(s: number, v: Vec2): Vec2 {
  return { x: -s * v.y, y: s * v.x };
}

export function lengthSq(a: Vec2): number {
  return a.x * a.x + a.y * a.y;
}

export function length(a: Vec2): number {
  return Math.sqrt(lengthSq(a));
}

export function normalize(a: Vec2): Vec2 {
  const len = length(a);
  if (len === 0) return { x: 0, y: 0 };
  return { x: a.x / len, y: a.y / len };
}

/** Rotates `a` counter-clockwise by `angle` radians. */
export function rotate(a: Vec2, angle: number): Vec2 {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return { x: a.x * c - a.y * s, y: a.x * s + a.y * c };
}

/** Rotates `a` by `-angle`, i.e. world space into a body's local frame. */
export function unrotate(a: Vec2, angle: number): Vec2 {
  return rotate(a, -angle);
}

export function clamp(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}
