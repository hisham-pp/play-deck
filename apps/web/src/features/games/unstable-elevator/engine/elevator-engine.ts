import type {
  ElevatorFloorPlan,
  ElevatorGameState,
  ElevatorSeat,
} from '../types/unstable-elevator.types';

import {
  CLAW_RANGE,
  COLLAPSE_MS,
  COUNTDOWN_MS,
  DEFAULT_SLIPS,
  MAX_STEPS_PER_FRAME,
  PHASE_ASCENDING,
  PHASE_COLLAPSE,
  PHASE_COUNTDOWN,
  PHASE_IDLE,
  PHASE_PLACING,
  PHASE_SCORES,
  PHASE_SETTLING,
  PHYSICS_STEP,
  PLACING_MS,
  SETTLE_MAX_MS,
} from './elevator-constants';
import { resetEventIds } from './elevator-events';
import { buildFloorPlan } from './elevator-floors';
import { sampleMotion, type ElevatorMotion } from './elevator-motion';
import { getShape } from './elevator-objects';
import {
  clampClawX,
  dropPosition,
  isClearToDrop,
  normalizeClawAngle,
  stackHeight,
  surfaceProfile,
} from './elevator-placement';
import {
  applyCollapse,
  applyFloorClear,
  applyFloorStart,
  applyLosses,
  applyPlacement,
} from './elevator-progress';
import { stepElevator } from './elevator-simulation';
import { mergeSnapshot, toSnapshot, type ElevatorSnapshot } from './elevator-snapshot';
import { createInitialState, hudSignature } from './elevator-state';
import {
  applyBodyViews,
  bodyViews,
  createElevatorWorld,
  spawnCargo,
  stackAtRest,
  syncViews,
  type ElevatorWorld,
} from './elevator-world';
import { vec } from './physics/vector';

export interface ElevatorEngineOptions {
  seats: ElevatorSeat[];
  seed: string;
  slips?: number;
  placingMs?: number;
}

const STEP_MS = PHYSICS_STEP * 1000;
/** Rail offsets the claw tries in turn when a timed-out drop is blocked. */
const AUTO_DROP_OFFSETS = [-0.6, 0.6, -1.2, 1.2, -1.8, 1.8, -2.4, 2.4];

type Listener = (state: ElevatorGameState) => void;

/**
 * Owns one run: the physics world, the floor-by-floor phase machine and the
 * score sheet. It is plain TypeScript — React drives it with `update(dtMs)`
 * and reads `getState()`, and the multiplayer host mirrors it with snapshots.
 */
export class ElevatorEngine {
  private state: ElevatorGameState;
  private sim: ElevatorWorld;
  private plan: ElevatorFloorPlan;
  private motion: ElevatorMotion;

  private readonly seed: string;
  private readonly placingMs: number;
  private clockSeconds = 0;
  private phaseElapsedMs = 0;
  private accumulatorMs = 0;
  private cargoCounter = 0;
  private listeners = new Set<Listener>();
  private hudKey = '';

  constructor(options: ElevatorEngineOptions) {
    this.seed = options.seed;
    this.placingMs = options.placingMs ?? PLACING_MS;
    this.sim = createElevatorWorld();
    this.plan = buildFloorPlan(1, options.seed);
    this.motion = this.sampleNow(null);
    this.state = createInitialState({
      seats: options.seats,
      slips: options.slips ?? DEFAULT_SLIPS,
      platformY: this.motion.platformY,
      bodies: bodyViews(this.sim.world),
    });
  }

  getState(): ElevatorGameState {
    return this.state;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  start(): void {
    resetEventIds();
    this.setPhase(PHASE_COUNTDOWN, COUNTDOWN_MS);
    this.publish();
  }

  setClaw(x: number, angle: number): void {
    if (this.state.phase !== PHASE_PLACING) return;
    this.state = { ...this.state, clawX: clampClawX(x), clawAngle: normalizeClawAngle(angle) };
  }

  /** True when the claw hangs over a clear patch and may release. */
  canDrop(): boolean {
    const { phase, pendingShapeId, clawX, clawAngle } = this.state;
    if (phase !== PHASE_PLACING || !pendingShapeId) return false;
    return isClearToDrop(this.sim.world, getShape(pendingShapeId), clawX, clawAngle);
  }

  /** Releases the pending object. Returns false when the drop was blocked. */
  drop(seatId: string): boolean {
    const { phase, activeSeatId, pendingShapeId, floor } = this.state;
    if (phase !== PHASE_PLACING || seatId !== activeSeatId || !pendingShapeId) return false;
    if (!this.canDrop()) return false;

    const shape = getShape(pendingShapeId);
    this.cargoCounter += 1;
    const bodyId = `cargo-${floor}-${this.cargoCounter}`;
    const position = dropPosition(this.state.clawX);
    spawnCargo(this.sim.world, shape, bodyId, seatId, position.x, position.y, this.state.clawAngle);

    this.state = applyPlacement(this.state, bodyId, shape, seatId);
    this.setPhase(PHASE_SETTLING, SETTLE_MAX_MS);
    this.publish();
    return true;
  }

  /** Advances the run by `deltaMs` of wall clock. */
  update(deltaMs: number): void {
    if (this.state.phase === PHASE_IDLE || this.state.phase === PHASE_SCORES) return;

    this.accumulatorMs += Math.min(deltaMs, MAX_STEPS_PER_FRAME * STEP_MS);
    while (this.accumulatorMs >= STEP_MS) {
      this.accumulatorMs -= STEP_MS;
      this.phaseElapsedMs += STEP_MS;
      this.clockSeconds += PHYSICS_STEP;
      this.stepSimulation();
      this.advancePhase();
      if (this.state.finished) break;
    }

    const ride = {
      turbulence: this.motion.turbulence,
      ascentProgress: this.ascentProgress() ?? 0,
    };
    this.state = syncViews(this.state, this.sim, ride, stackHeight(this.sim.world));
    this.publish();
  }

  /** Ends the run early, e.g. when the host leaves the room. */
  abandon(): void {
    if (this.state.finished) return;
    this.finish();
  }

  getSnapshot(): ElevatorSnapshot {
    return toSnapshot(this.state);
  }

  /** Height of the tower sampled across the platform, for the bots and the HUD. */
  getSurfaceProfile(columns: number): number[] {
    return surfaceProfile(this.sim.world, CLAW_RANGE, columns);
  }

  /** Guests render from the host's snapshot rather than simulating in parallel. */
  applySnapshot(snapshot: ElevatorSnapshot): void {
    this.plan = buildFloorPlan(Math.max(1, snapshot.floor), this.seed);
    applyBodyViews(this.sim.world, snapshot.bodies);
    this.sim.platform.position = vec(snapshot.platform.x, snapshot.platform.y);
    this.sim.platform.angle = snapshot.platform.angle;
    const height = stackHeight(this.sim.world);
    this.state = mergeSnapshot(this.state, snapshot, this.plan.behaviors, height);
    this.publish();
  }

  /** Notifies React only when something it actually renders has changed. */
  private publish(): void {
    const key = hudSignature(this.state);
    if (key === this.hudKey) return;
    this.hudKey = key;
    for (const listener of this.listeners) listener(this.state);
  }

  private setPhase(phase: ElevatorGameState['phase'], durationMs: number): void {
    this.phaseElapsedMs = 0;
    this.state = { ...this.state, phase, phaseRemainingMs: durationMs };
  }

  private sampleNow(ascentProgress: number | null): ElevatorMotion {
    return sampleMotion({ plan: this.plan, clockSeconds: this.clockSeconds, ascentProgress });
  }

  /** Seats take the claw in turn, one object per floor. */
  private seatForFloor(floor: number): ElevatorSeat | null {
    const { seats } = this.state;
    if (seats.length === 0) return null;
    return seats[(floor - 1) % seats.length];
  }

  private beginFloor(floor: number): void {
    this.plan = buildFloorPlan(floor, this.seed);
    this.state = applyFloorStart(this.state, this.plan, this.seatForFloor(floor));
    this.setPhase(PHASE_PLACING, this.placingMs);
  }

  private ascentProgress(): number | null {
    if (this.state.phase !== PHASE_ASCENDING) return null;
    return Math.min(1, this.phaseElapsedMs / this.plan.ascentMs);
  }

  private stepSimulation(): void {
    const { motion, lost } = stepElevator({
      sim: this.sim,
      plan: this.plan,
      clockSeconds: this.clockSeconds,
      ascentProgress: this.ascentProgress(),
    });
    this.motion = motion;
    if (lost.length === 0) return;

    this.state = applyLosses(this.state, lost);
    if (this.state.slipsRemaining <= 0) this.beginCollapse();
  }

  private beginCollapse(): void {
    this.state = applyCollapse(this.state);
    this.setPhase(PHASE_COLLAPSE, COLLAPSE_MS);
  }

  private advancePhase(): void {
    const remaining = Math.max(0, this.state.phaseRemainingMs - STEP_MS);
    this.state = { ...this.state, phaseRemainingMs: remaining };

    switch (this.state.phase) {
      case PHASE_COUNTDOWN:
        if (remaining <= 0) this.beginFloor(1);
        return;
      case PHASE_PLACING:
        if (remaining <= 0) this.autoDrop();
        return;
      case PHASE_SETTLING:
        if (remaining <= 0 || stackAtRest(this.sim.world)) {
          this.setPhase(PHASE_ASCENDING, this.plan.ascentMs);
        }
        return;
      case PHASE_ASCENDING:
        if (remaining <= 0) this.clearFloor();
        return;
      case PHASE_COLLAPSE:
        if (remaining <= 0) this.finish();
        return;
      default:
    }
  }

  /** The claw lets go on its own when the placing clock runs out. */
  private autoDrop(): void {
    const seatId = this.state.activeSeatId;
    if (!seatId) return;
    if (this.drop(seatId)) return;

    for (const offset of AUTO_DROP_OFFSETS) {
      this.setClaw(this.state.clawX + offset, this.state.clawAngle);
      if (this.drop(seatId)) return;
    }
    this.setPhase(PHASE_SETTLING, SETTLE_MAX_MS);
  }

  private clearFloor(): void {
    this.state = applyFloorClear(this.state, stackHeight(this.sim.world));
    this.beginFloor(this.state.floor + 1);
  }

  private finish(): void {
    this.state = { ...this.state, phase: PHASE_SCORES, phaseRemainingMs: 0, finished: true };
    this.publish();
  }
}
