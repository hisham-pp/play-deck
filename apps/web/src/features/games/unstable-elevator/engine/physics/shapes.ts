import { vec, type Vec2 } from './vector';

/** Axis-aligned rectangle hull, wound counter-clockwise in a y-up world. */
export function boxVertices(width: number, height: number): Vec2[] {
  const hw = width / 2;
  const hh = height / 2;
  return [vec(-hw, -hh), vec(hw, -hh), vec(hw, hh), vec(-hw, hh)];
}

/** Regular polygon hull with `sides` corners on a circle of `radius`. */
export function regularPolygonVertices(sides: number, radius: number, offset = 0): Vec2[] {
  const points: Vec2[] = [];
  for (let i = 0; i < sides; i += 1) {
    const angle = offset + (i / sides) * Math.PI * 2;
    points.push(vec(Math.cos(angle) * radius, Math.sin(angle) * radius));
  }
  return points;
}

/** Isoceles triangle standing on its base, counter-clockwise. */
export function triangleVertices(width: number, height: number): Vec2[] {
  const hw = width / 2;
  const hh = height / 2;
  return [vec(-hw, -hh), vec(hw, -hh), vec(0, hh)];
}

/** Trapezoid with a narrower top edge — stacks well, tips badly. */
export function trapezoidVertices(bottom: number, top: number, height: number): Vec2[] {
  const hb = bottom / 2;
  const ht = top / 2;
  const hh = height / 2;
  return [vec(-hb, -hh), vec(hb, -hh), vec(ht, hh), vec(-ht, hh)];
}
