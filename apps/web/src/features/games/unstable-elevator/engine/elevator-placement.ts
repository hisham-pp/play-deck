import { CLAW_RANGE, DROP_HEIGHT, PLATFORM_SURFACE_Y } from './elevator-constants';
import type { ElevatorShape } from './elevator-objects';
import { BODY_DYNAMIC, createBody, worldVertices, type RigidBody } from './physics/body';
import { collide } from './physics/collision';
import { clamp, vec, type Vec2 } from './physics/vector';
import type { PhysicsWorld } from './physics/world';

/** Extra room left around the claw so a drop never starts inside the tower. */
const CLEARANCE_MARGIN = 0.12;

export function clampClawX(x: number): number {
  return clamp(x, -CLAW_RANGE, CLAW_RANGE);
}

/** Keeps the claw's rotation in a single turn, so the HUD dial reads sensibly. */
export function normalizeClawAngle(angle: number): number {
  const full = Math.PI * 2;
  return ((angle % full) + full) % full;
}

export function dropPosition(clawX: number): Vec2 {
  return vec(clampClawX(clawX), DROP_HEIGHT);
}

/** A throwaway body used only to test whether a drop would start overlapping. */
function probeBody(shape: ElevatorShape, position: Vec2, angle: number): RigidBody {
  const body = createBody({
    id: '__probe__',
    type: BODY_DYNAMIC,
    shapeId: shape.id,
    vertices: shape.build(),
    position,
    angle,
    density: shape.density,
  });
  body.radius += CLEARANCE_MARGIN;
  return body;
}

/**
 * True when the claw can release here. A blocked drop is better feedback than
 * an object spawning inside the stack and exploding out of it.
 */
export function isClearToDrop(
  world: PhysicsWorld,
  shape: ElevatorShape,
  clawX: number,
  angle: number,
): boolean {
  const probe = probeBody(shape, dropPosition(clawX), angle);
  return !world.bodies.some((body) => body.id !== probe.id && collide(probe, body) !== null);
}

/** Highest point of any cargo body, measured from the platform surface. */
export function stackHeight(world: PhysicsWorld): number {
  let highest = PLATFORM_SURFACE_Y;
  for (const body of world.bodies) {
    if (body.type !== BODY_DYNAMIC) continue;
    for (const vertex of worldVertices(body)) {
      if (vertex.y > highest) highest = vertex.y;
    }
  }
  return Math.max(0, highest - PLATFORM_SURFACE_Y);
}

/**
 * Surface height of the tower sampled across `columns` slices of the platform.
 * The bots read this to find a flat landing spot, and the HUD uses it to warn
 * when the stack is about to leave the shaft.
 */
export function surfaceProfile(world: PhysicsWorld, halfWidth: number, columns: number): number[] {
  const profile = new Array<number>(columns).fill(PLATFORM_SURFACE_Y);
  const step = (halfWidth * 2) / columns;

  for (const body of world.bodies) {
    if (body.type !== BODY_DYNAMIC) continue;
    const vertices = worldVertices(body);
    let minX = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const vertex of vertices) {
      if (vertex.x < minX) minX = vertex.x;
      if (vertex.x > maxX) maxX = vertex.x;
      if (vertex.y > maxY) maxY = vertex.y;
    }

    const first = Math.max(0, Math.floor((minX + halfWidth) / step));
    const last = Math.min(columns - 1, Math.floor((maxX + halfWidth) / step));
    for (let i = first; i <= last; i += 1) {
      if (maxY > profile[i]) profile[i] = maxY;
    }
  }

  return profile;
}

export { DROP_HEIGHT };
