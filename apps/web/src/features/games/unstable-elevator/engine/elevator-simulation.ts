import type { ElevatorFloorPlan } from '../types/unstable-elevator.types';
import { GRAVITY, PHYSICS_STEP } from './elevator-constants';
import { sampleMotion, type ElevatorMotion } from './elevator-motion';
import type { LostCargo } from './elevator-progress';
import { applyWind, collectFallen, drivePlatform, type ElevatorWorld } from './elevator-world';
import { vec } from './physics/vector';

export interface StepResult {
  motion: ElevatorMotion;
  /** Cargo that left the shaft during this step. */
  lost: LostCargo[];
}

export interface StepOptions {
  sim: ElevatorWorld;
  plan: ElevatorFloorPlan;
  clockSeconds: number;
  /** 0–1 through the ascent, or `null` while the lift is docked. */
  ascentProgress: number | null;
}

/**
 * One fixed physics step of the ride. The lift's own acceleration is folded
 * into gravity rather than moving the world, which is what makes a sudden stop
 * lift the whole stack off the platform.
 */
export function stepElevator({ sim, plan, clockSeconds, ascentProgress }: StepOptions): StepResult {
  const motion = sampleMotion({ plan, clockSeconds, ascentProgress });

  sim.world.gravity = vec(0, -(GRAVITY + motion.frameAccelY));
  drivePlatform(sim.platform, motion, PHYSICS_STEP);
  applyWind(sim.world, motion.windX, PHYSICS_STEP);
  sim.world.step(PHYSICS_STEP);

  const lost = collectFallen(sim.world).map((body) => ({
    bodyId: body.id,
    shapeId: body.shapeId,
    ownerId: body.ownerId ?? '',
  }));

  return { motion, lost };
}
