import type { RigidBody } from './body';
import type { Manifold } from './collision';
import { add, clamp, cross, dot, lengthSq, scale, sub, vec, type Vec2 } from './vector';

/** Penetration left uncorrected, so resting stacks stop fighting the solver. */
const PENETRATION_SLOP = 0.008;
/** Share of the remaining overlap pushed out per step. */
const CORRECTION_PERCENT = 0.3;
/** Below this approach speed a contact is treated as resting, not a bounce. */
const RESTITUTION_THRESHOLD = 0.6;

function applyImpulse(body: RigidBody, impulse: Vec2, contactArm: Vec2): void {
  body.velocity = add(body.velocity, scale(impulse, body.invMass));
  body.angularVelocity += body.invInertia * cross(contactArm, impulse);
}

function relativeVelocity(manifold: Manifold, armA: Vec2, armB: Vec2): Vec2 {
  const { a, b } = manifold;
  return vec(
    b.velocity.x - b.angularVelocity * armB.y - (a.velocity.x - a.angularVelocity * armA.y),
    b.velocity.y + b.angularVelocity * armB.x - (a.velocity.y + a.angularVelocity * armA.x),
  );
}

function effectiveMass(manifold: Manifold, armA: Vec2, armB: Vec2, direction: Vec2): number {
  const { a, b } = manifold;
  const crossA = cross(armA, direction);
  const crossB = cross(armB, direction);
  return a.invMass + b.invMass + crossA * crossA * a.invInertia + crossB * crossB * b.invInertia;
}

/**
 * Records each contact's bounce target once per step. Restitution measured
 * mid-iteration would compound, turning a light tap into a launch.
 */
export function prepareManifolds(manifolds: Manifold[]): number[][] {
  return manifolds.map((manifold) =>
    manifold.contacts.map((contact) => {
      const armA = sub(contact.point, manifold.a.position);
      const armB = sub(contact.point, manifold.b.position);
      const approach = dot(relativeVelocity(manifold, armA, armB), manifold.normal);
      if (approach > -RESTITUTION_THRESHOLD) return 0;
      return -manifold.restitution * approach;
    }),
  );
}

function solveContact(manifold: Manifold, contactIndex: number, bounceTarget: number): void {
  const contact = manifold.contacts[contactIndex];
  const armA = sub(contact.point, manifold.a.position);
  const armB = sub(contact.point, manifold.b.position);

  const normalMass = effectiveMass(manifold, armA, armB, manifold.normal);
  if (normalMass <= 0) return;

  const approach = dot(relativeVelocity(manifold, armA, armB), manifold.normal);
  let normalImpulse = (-approach + bounceTarget) / normalMass;

  // Accumulated impulses are clamped as a total, never per iteration, so a
  // contact can be relaxed by later iterations without ever pulling bodies in.
  const previousNormal = contact.normalImpulse;
  contact.normalImpulse = Math.max(previousNormal + normalImpulse, 0);
  normalImpulse = contact.normalImpulse - previousNormal;

  const normalDelta = scale(manifold.normal, normalImpulse);
  applyImpulse(manifold.a, scale(normalDelta, -1), armA);
  applyImpulse(manifold.b, normalDelta, armB);

  const tangent = vec(-manifold.normal.y, manifold.normal.x);
  const tangentMass = effectiveMass(manifold, armA, armB, tangent);
  if (tangentMass <= 0) return;

  const slide = dot(relativeVelocity(manifold, armA, armB), tangent);
  let tangentImpulse = -slide / tangentMass;

  const limit = manifold.friction * contact.normalImpulse;
  const previousTangent = contact.tangentImpulse;
  contact.tangentImpulse = clamp(previousTangent + tangentImpulse, -limit, limit);
  tangentImpulse = contact.tangentImpulse - previousTangent;

  const tangentDelta = scale(tangent, tangentImpulse);
  applyImpulse(manifold.a, scale(tangentDelta, -1), armA);
  applyImpulse(manifold.b, tangentDelta, armB);
}

export function solveManifolds(
  manifolds: Manifold[],
  bounceTargets: number[][],
  iterations: number,
): void {
  for (let pass = 0; pass < iterations; pass += 1) {
    for (let i = 0; i < manifolds.length; i += 1) {
      const manifold = manifolds[i];
      for (let c = 0; c < manifold.contacts.length; c += 1) {
        solveContact(manifold, c, bounceTargets[i][c]);
      }
    }
  }
}

/**
 * Nudges overlapping bodies apart after the velocity pass. Pure impulses leave
 * a little sink under a tall stack; this is what keeps the tower crisp.
 */
export function correctPositions(manifolds: Manifold[]): void {
  for (const manifold of manifolds) {
    const totalInvMass = manifold.a.invMass + manifold.b.invMass;
    if (totalInvMass <= 0) continue;

    let deepest = 0;
    for (const contact of manifold.contacts) {
      deepest = Math.max(deepest, contact.penetration);
    }

    const overlap = Math.max(deepest - PENETRATION_SLOP, 0);
    if (overlap === 0) continue;

    const push = scale(manifold.normal, (overlap / totalInvMass) * CORRECTION_PERCENT);
    manifold.a.position = sub(manifold.a.position, scale(push, manifold.a.invMass));
    manifold.b.position = add(manifold.b.position, scale(push, manifold.b.invMass));
  }
}

/** True once a body has slowed enough to be treated as resting. */
export function isResting(body: RigidBody, linearEpsilon: number, angularEpsilon: number): boolean {
  return (
    lengthSq(body.velocity) < linearEpsilon * linearEpsilon &&
    Math.abs(body.angularVelocity) < angularEpsilon
  );
}
