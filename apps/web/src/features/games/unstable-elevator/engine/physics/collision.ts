import { worldNormals, worldVertices, type RigidBody } from './body';
import { add, dot, neg, scale, sub, vec, type Vec2 } from './vector';

export interface Contact {
  point: Vec2;
  penetration: number;
  /** Impulse carried over between iterations so stacks settle instead of jitter. */
  normalImpulse: number;
  tangentImpulse: number;
}

export interface Manifold {
  a: RigidBody;
  b: RigidBody;
  /** Unit vector pointing from `a` towards `b`. */
  normal: Vec2;
  contacts: Contact[];
  restitution: number;
  friction: number;
}

interface Hull {
  vertices: Vec2[];
  normals: Vec2[];
}

/** Bias towards keeping the current reference face, which stops flip-flopping. */
const REFERENCE_FACE_BIAS = 0.98;
const REFERENCE_FACE_EPSILON = 0.0005;

function hullOf(body: RigidBody): Hull {
  const vertices = worldVertices(body);
  return { vertices, normals: worldNormals(vertices) };
}

/** The hull vertex furthest along `direction`. */
function support(vertices: Vec2[], direction: Vec2): Vec2 {
  let best = vertices[0];
  let bestDistance = dot(best, direction);
  for (let i = 1; i < vertices.length; i += 1) {
    const distance = dot(vertices[i], direction);
    if (distance > bestDistance) {
      bestDistance = distance;
      best = vertices[i];
    }
  }
  return best;
}

/** Largest gap between the hulls along any face normal of `a`. */
function leastSeparation(a: Hull, b: Hull): { separation: number; faceIndex: number } {
  let bestSeparation = -Infinity;
  let bestFace = 0;

  for (let i = 0; i < a.normals.length; i += 1) {
    const normal = a.normals[i];
    const deepest = support(b.vertices, neg(normal));
    const separation = dot(normal, sub(deepest, a.vertices[i]));
    if (separation > bestSeparation) {
      bestSeparation = separation;
      bestFace = i;
    }
  }

  return { separation: bestSeparation, faceIndex: bestFace };
}

/** The face of `incident` that most directly opposes the reference normal. */
function incidentFace(incident: Hull, referenceNormal: Vec2): [Vec2, Vec2] {
  let bestFace = 0;
  let bestDot = Infinity;
  for (let i = 0; i < incident.normals.length; i += 1) {
    const facing = dot(incident.normals[i], referenceNormal);
    if (facing < bestDot) {
      bestDot = facing;
      bestFace = i;
    }
  }
  return [
    incident.vertices[bestFace],
    incident.vertices[(bestFace + 1) % incident.vertices.length],
  ];
}

/** Keeps the part of a segment on the inner side of the plane `dot(n, p) = c`. */
function clipToPlane(normal: Vec2, offset: number, face: [Vec2, Vec2]): Vec2[] {
  const out: Vec2[] = [];
  const d1 = dot(normal, face[0]) - offset;
  const d2 = dot(normal, face[1]) - offset;

  if (d1 <= 0) out.push(face[0]);
  if (d2 <= 0) out.push(face[1]);
  if (d1 * d2 < 0) {
    const alpha = d1 / (d1 - d2);
    out.push(add(face[0], scale(sub(face[1], face[0]), alpha)));
  }
  return out.slice(0, 2);
}

function buildContacts(
  reference: Hull,
  incident: Hull,
  faceIndex: number,
): Manifold['contacts'] | null {
  const v1 = reference.vertices[faceIndex];
  const v2 = reference.vertices[(faceIndex + 1) % reference.vertices.length];
  const tangent = sub(v2, v1);
  const tangentLength = Math.hypot(tangent.x, tangent.y) || 1;
  const sideNormal = vec(tangent.x / tangentLength, tangent.y / tangentLength);
  const faceNormal = reference.normals[faceIndex];
  const faceOffset = dot(faceNormal, v1);

  // The reference normal always points at the incident hull, whichever body owns it.
  let face = incidentFace(incident, faceNormal);

  let clipped = clipToPlane(neg(sideNormal), -dot(sideNormal, v1), face);
  if (clipped.length < 2) return null;
  face = [clipped[0], clipped[1]];

  clipped = clipToPlane(sideNormal, dot(sideNormal, v2), face);
  if (clipped.length < 2) return null;

  const contacts: Contact[] = [];
  for (const point of clipped) {
    const separation = dot(faceNormal, point) - faceOffset;
    if (separation > 0) continue;
    contacts.push({ point, penetration: -separation, normalImpulse: 0, tangentImpulse: 0 });
  }
  return contacts.length > 0 ? contacts : null;
}

/**
 * Separating-axis test between two convex hulls, returning the clipped contact
 * manifold. Returns `null` when the bodies are apart.
 */
export function collide(a: RigidBody, b: RigidBody): Manifold | null {
  const gap = Math.hypot(b.position.x - a.position.x, b.position.y - a.position.y);
  if (gap > a.radius + b.radius) return null;

  const hullA = hullOf(a);
  const hullB = hullOf(b);

  const fromA = leastSeparation(hullA, hullB);
  if (fromA.separation > 0) return null;

  const fromB = leastSeparation(hullB, hullA);
  if (fromB.separation > 0) return null;

  // Whichever hull is less deeply penetrated owns the reference face.
  const useA = fromA.separation > fromB.separation * REFERENCE_FACE_BIAS + REFERENCE_FACE_EPSILON;
  const reference = useA ? hullA : hullB;
  const incident = useA ? hullB : hullA;
  const faceIndex = useA ? fromA.faceIndex : fromB.faceIndex;

  const contacts = buildContacts(reference, incident, faceIndex);
  if (!contacts) return null;

  const faceNormal = reference.normals[faceIndex];
  return {
    a,
    b,
    normal: useA ? faceNormal : neg(faceNormal),
    contacts,
    restitution: Math.min(a.restitution, b.restitution),
    friction: Math.sqrt(a.friction * b.friction),
  };
}
