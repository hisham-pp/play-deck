import type { ElevatorBodyView, ElevatorGameState } from '../types/unstable-elevator.types';
import {
  FALL_LINE_Y,
  GRAVITY,
  PLATFORM_CENTRE_Y,
  PLATFORM_THICKNESS,
  PLATFORM_WIDTH,
  REST_ANGULAR_EPSILON,
  REST_LINEAR_EPSILON,
  SIDE_LINE_X,
} from './elevator-constants';
import type { ElevatorMotion } from './elevator-motion';
import { getShape, type ElevatorShape } from './elevator-objects';
import { BODY_DYNAMIC, BODY_KINEMATIC, createBody, type RigidBody } from './physics/body';
import { boxVertices } from './physics/shapes';
import { isResting } from './physics/solver';
import { vec } from './physics/vector';
import { PhysicsWorld } from './physics/world';

export const PLATFORM_BODY_ID = 'platform';

export interface ElevatorWorld {
  world: PhysicsWorld;
  platform: RigidBody;
}

/**
 * The shaft has no walls on purpose: cargo that slides sideways is meant to go
 * over the edge. Only the platform and the stack are simulated.
 */
export function createElevatorWorld(): ElevatorWorld {
  const world = new PhysicsWorld({ gravity: vec(0, -GRAVITY) });
  const platform = world.add(
    createBody({
      id: PLATFORM_BODY_ID,
      type: BODY_KINEMATIC,
      shapeId: 'platform',
      vertices: boxVertices(PLATFORM_WIDTH, PLATFORM_THICKNESS),
      position: vec(0, PLATFORM_CENTRE_Y),
      friction: 0.86,
      restitution: 0.01,
    }),
  );
  return { world, platform };
}

export function spawnCargo(
  world: PhysicsWorld,
  shape: ElevatorShape,
  bodyId: string,
  ownerId: string,
  x: number,
  y: number,
  angle: number,
): RigidBody {
  return world.add(
    createBody({
      id: bodyId,
      type: BODY_DYNAMIC,
      ownerId,
      shapeId: shape.id,
      vertices: shape.build(),
      position: vec(x, y),
      angle,
      density: shape.density,
      friction: shape.friction,
      restitution: shape.restitution,
    }),
  );
}

/**
 * Tracks the platform to the motion sample by velocity rather than by teleport,
 * so the solver sees the shove and the stack slides with the floor.
 */
export function drivePlatform(platform: RigidBody, motion: ElevatorMotion, dt: number): void {
  if (dt <= 0) return;
  platform.velocity = vec(
    (motion.platformX - platform.position.x) / dt,
    (motion.platformY - platform.position.y) / dt,
  );
  platform.angularVelocity = (motion.platformAngle - platform.angle) / dt;
}

/** Pushes the wind at every dynamic body, weighted by how much sail it has. */
export function applyWind(world: PhysicsWorld, windX: number, dt: number): void {
  if (windX === 0) return;
  for (const body of world.bodies) {
    if (body.type !== BODY_DYNAMIC) continue;
    const factor = getShape(body.shapeId).windFactor;
    world.applyAcceleration(body, vec(windX * factor, 0), dt);
  }
}

/** Removes and returns every body that has left the shaft. */
export function collectFallen(world: PhysicsWorld): RigidBody[] {
  const lost = world.bodies.filter(
    (body) =>
      body.type === BODY_DYNAMIC &&
      (body.position.y < FALL_LINE_Y || Math.abs(body.position.x) > SIDE_LINE_X),
  );
  for (const body of lost) world.remove(body.id);
  return lost;
}

/** True once nothing on the platform is meaningfully moving any more. */
export function stackAtRest(world: PhysicsWorld): boolean {
  return world.bodies.every(
    (body) =>
      body.type !== BODY_DYNAMIC || isResting(body, REST_LINEAR_EPSILON, REST_ANGULAR_EPSILON),
  );
}

export function bodyViews(world: PhysicsWorld): ElevatorBodyView[] {
  return world.bodies.map((body) => ({
    id: body.id,
    shapeId: body.shapeId,
    ownerId: body.ownerId,
    x: body.position.x,
    y: body.position.y,
    angle: body.angle,
  }));
}

/** Overwrites local transforms from a host snapshot, adding and removing bodies. */
export function applyBodyViews(world: PhysicsWorld, views: ElevatorBodyView[]): void {
  const seen = new Set(views.map((view) => view.id));
  for (const body of [...world.bodies]) {
    if (!seen.has(body.id)) world.remove(body.id);
  }

  for (const view of views) {
    const existing = world.get(view.id);
    if (existing) {
      existing.position = vec(view.x, view.y);
      existing.angle = view.angle;
      existing.velocity = vec(0, 0);
      existing.angularVelocity = 0;
      continue;
    }
    if (view.id === PLATFORM_BODY_ID) continue;
    const body = spawnCargo(
      world,
      getShape(view.shapeId),
      view.id,
      view.ownerId ?? '',
      view.x,
      view.y,
      view.angle,
    );
    body.velocity = vec(0, 0);
  }
}

/** Refreshes the render-facing fields of the state from the live simulation. */
export function syncViews(
  state: ElevatorGameState,
  sim: ElevatorWorld,
  ride: { turbulence: number; ascentProgress: number },
  height: number,
): ElevatorGameState {
  return {
    ...state,
    bodies: bodyViews(sim.world),
    platform: {
      x: sim.platform.position.x,
      y: sim.platform.position.y,
      angle: sim.platform.angle,
    },
    turbulence: ride.turbulence,
    ascentProgress: ride.ascentProgress,
    stackHeight: height,
  };
}
