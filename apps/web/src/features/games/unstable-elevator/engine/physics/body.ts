import { cross, dot, length, rotate, sub, vec, type Vec2 } from './vector';

/** A body the solver never moves: the platform and the shaft walls. */
export const BODY_STATIC = 'static';
/** A body the game drives by hand each step — the elevator platform. */
export const BODY_KINEMATIC = 'kinematic';
export const BODY_DYNAMIC = 'dynamic';

export type BodyType = typeof BODY_STATIC | typeof BODY_KINEMATIC | typeof BODY_DYNAMIC;

export interface RigidBody {
  id: string;
  type: BodyType;
  /** Seat id of the player who placed this body; platform and walls own none. */
  ownerId: string | null;
  /** Catalogue entry this body was spawned from, for rendering and scoring. */
  shapeId: string;
  /** Convex hull in body space, wound counter-clockwise around the centroid. */
  vertices: Vec2[];
  position: Vec2;
  angle: number;
  velocity: Vec2;
  angularVelocity: number;
  mass: number;
  invMass: number;
  invInertia: number;
  restitution: number;
  friction: number;
  /** Bounding-circle radius, used to skip narrow-phase work. */
  radius: number;
}

export interface BodyOptions {
  id: string;
  type?: BodyType;
  ownerId?: string | null;
  shapeId?: string;
  vertices: Vec2[];
  position: Vec2;
  angle?: number;
  density?: number;
  restitution?: number;
  friction?: number;
}

/** Signed area of a counter-clockwise convex polygon. */
export function polygonArea(vertices: Vec2[]): number {
  let area = 0;
  for (let i = 0; i < vertices.length; i += 1) {
    const a = vertices[i];
    const b = vertices[(i + 1) % vertices.length];
    area += cross(a, b);
  }
  return area / 2;
}

/**
 * Second moment of area about the origin for a polygon already centred on its
 * centroid — the standard triangle-fan decomposition.
 */
export function polygonInertia(vertices: Vec2[]): number {
  let numerator = 0;
  let denominator = 0;
  for (let i = 0; i < vertices.length; i += 1) {
    const a = vertices[i];
    const b = vertices[(i + 1) % vertices.length];
    const areaTerm = Math.abs(cross(a, b));
    numerator += areaTerm * (dot(a, a) + dot(a, b) + dot(b, b));
    denominator += areaTerm;
  }
  if (denominator === 0) return 0;
  return numerator / (6 * denominator);
}

/** Recentres a hull on its own centroid so rotation happens about the middle. */
export function centreVertices(vertices: Vec2[]): Vec2[] {
  const area = polygonArea(vertices);
  if (area === 0) return vertices.map((v) => ({ ...v }));

  let cx = 0;
  let cy = 0;
  for (let i = 0; i < vertices.length; i += 1) {
    const a = vertices[i];
    const b = vertices[(i + 1) % vertices.length];
    const factor = cross(a, b);
    cx += (a.x + b.x) * factor;
    cy += (a.y + b.y) * factor;
  }
  const centroid = vec(cx / (6 * area), cy / (6 * area));
  return vertices.map((v) => sub(v, centroid));
}

export function createBody(options: BodyOptions): RigidBody {
  const type = options.type ?? BODY_DYNAMIC;
  const vertices = centreVertices(options.vertices);
  const area = Math.abs(polygonArea(vertices));
  const density = options.density ?? 1;
  const isMoveable = type === BODY_DYNAMIC;

  const mass = isMoveable ? area * density : 0;
  const inertia = isMoveable ? polygonInertia(vertices) * mass : 0;

  return {
    id: options.id,
    type,
    ownerId: options.ownerId ?? null,
    shapeId: options.shapeId ?? 'box',
    vertices,
    position: { ...options.position },
    angle: options.angle ?? 0,
    velocity: vec(0, 0),
    angularVelocity: 0,
    mass,
    invMass: mass > 0 ? 1 / mass : 0,
    invInertia: inertia > 0 ? 1 / inertia : 0,
    restitution: options.restitution ?? 0.02,
    friction: options.friction ?? 0.55,
    radius: vertices.reduce((max, v) => Math.max(max, length(v)), 0),
  };
}

/** The hull in world space, rebuilt from the body's current transform. */
export function worldVertices(body: RigidBody): Vec2[] {
  return body.vertices.map((v) => {
    const r = rotate(v, body.angle);
    return vec(body.position.x + r.x, body.position.y + r.y);
  });
}

/** Outward edge normals in world space, one per vertex index. */
export function worldNormals(vertices: Vec2[]): Vec2[] {
  const normals: Vec2[] = [];
  for (let i = 0; i < vertices.length; i += 1) {
    const a = vertices[i];
    const b = vertices[(i + 1) % vertices.length];
    const edge = sub(b, a);
    const len = Math.hypot(edge.x, edge.y) || 1;
    normals.push(vec(edge.y / len, -edge.x / len));
  }
  return normals;
}

/** Velocity of the world-space point `point` on `body`. */
export function pointVelocity(body: RigidBody, point: Vec2): Vec2 {
  const r = sub(point, body.position);
  return vec(
    body.velocity.x - body.angularVelocity * r.y,
    body.velocity.y + body.angularVelocity * r.x,
  );
}
