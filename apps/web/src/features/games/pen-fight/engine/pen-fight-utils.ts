import type { AIDifficulty, FlickInput, PenFightOutcome } from '../types/pen-fight.types';
import {
  AI_ACCURACY,
  AI_POWER_RANGE,
  FALL_GRACE_FRAMES,
  FALL_THRESHOLD_Y,
  GRAB_RADIUS,
  MAX_DRAG_DISTANCE,
  SETTLE_ANGULAR_EPSILON,
  SETTLE_FRAMES_REQUIRED,
  SETTLE_LINEAR_EPSILON,
} from './pen-fight-constants';

export interface Vec3Like {
  x: number;
  y: number;
  z: number;
}

/** Converts a raw screen/world drag into a normalized flick direction + power (0..1). */
export function computeFlickFromDrag(startPoint: Vec3Like, endPoint: Vec3Like): FlickInput {
  const dx = startPoint.x - endPoint.x;
  const dz = startPoint.z - endPoint.z;
  const distance = Math.min(Math.hypot(dx, dz), MAX_DRAG_DISTANCE);
  const power = distance / MAX_DRAG_DISTANCE;

  if (distance < 1e-4) {
    return { direction: { x: 0, y: 0, z: 0 }, power: 0 };
  }

  return {
    direction: { x: dx / distance, y: 0, z: dz / distance },
    power,
  };
}

/** Produces a believable-but-imperfect AI flick aimed at the opponent's current position. */
export function computeAIFlick(
  ownPosition: Vec3Like,
  opponentPosition: Vec3Like,
  difficulty: AIDifficulty,
  rng: () => number = Math.random,
): FlickInput {
  const dx = opponentPosition.x - ownPosition.x;
  const dz = opponentPosition.z - ownPosition.z;
  const distance = Math.hypot(dx, dz) || 1;

  const accuracy = AI_ACCURACY[difficulty];
  const jitterMagnitude = (1 - accuracy) * 0.9;
  const jitterX = (rng() - 0.5) * jitterMagnitude;
  const jitterZ = (rng() - 0.5) * jitterMagnitude * 0.4;

  const rawX = dx / distance + jitterX;
  const rawZ = dz / distance + jitterZ;
  const rawDistance = Math.hypot(rawX, rawZ) || 1;

  const [minPower, maxPower] = AI_POWER_RANGE[difficulty];
  const power = minPower + rng() * (maxPower - minPower);

  return {
    direction: { x: rawX / rawDistance, y: 0, z: rawZ / rawDistance },
    power,
  };
}

/**
 * The Y-axis spin added to a flick, as a factor in [-0.5, 0.5].
 *
 * This MUST stay a pure function of the flick itself — online play replays the same flick on
 * both devices and any divergence here (a `Math.random()`, a timestamp, a device-specific
 * value) makes the two simulations drift apart within a single round. Plain arithmetic only:
 * no transcendental functions, whose last bits are not guaranteed identical across engines.
 */
export function computeFlickSpin(direction: Vec3Like, power: number): number {
  return clamp(direction.x * 0.6 + (power - 0.5) * 0.2, -0.5, 0.5);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function speedOf(v: Vec3Like): number {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

export function isWithinGrabRange(anchor: Vec3Like, point: Vec3Like): boolean {
  return Math.hypot(anchor.x - point.x, anchor.z - point.z) <= GRAB_RADIUS;
}

export interface AimPreview {
  start: Vec3Like;
  end: Vec3Like;
  color: string;
}

/** Where the aim arrow should point, given the current pull-back drag. Null while the drag is negligible. */
export function computeAimPreview(
  anchor: Vec3Like,
  current: Vec3Like,
  color: string,
): AimPreview | null {
  const flick = computeFlickFromDrag(anchor, current);
  if (flick.power < 0.01) return null;

  const length = flick.power * MAX_DRAG_DISTANCE * 1.15;
  return {
    start: anchor,
    end: {
      x: anchor.x + flick.direction.x * length,
      y: anchor.y,
      z: anchor.z + flick.direction.z * length,
    },
    color,
  };
}

function isPairSettled(linVel: Vec3Like, angVel: Vec3Like): boolean {
  return speedOf(linVel) < SETTLE_LINEAR_EPSILON && speedOf(angVel) < SETTLE_ANGULAR_EPSILON;
}

export interface RoundFrameInput {
  p1Y: number;
  p2Y: number;
  p1Fallen: boolean;
  p2Fallen: boolean;
  p1LinVel: Vec3Like;
  p1AngVel: Vec3Like;
  p2LinVel: Vec3Like;
  p2AngVel: Vec3Like;
  settleFrames: number;
  fallGraceFrames: number;
}

export interface RoundFrameResult {
  p1Fallen: boolean;
  p2Fallen: boolean;
  settleFrames: number;
  fallGraceFrames: number;
  resolved: boolean;
  outcome: PenFightOutcome;
}

function resolveFallenFrame(
  p1Fallen: boolean,
  p2Fallen: boolean,
  fallGraceFrames: number,
): RoundFrameResult {
  const resolved = fallGraceFrames > FALL_GRACE_FRAMES;
  const bothFell = p1Fallen && p2Fallen;
  return {
    p1Fallen,
    p2Fallen,
    settleFrames: 0,
    fallGraceFrames,
    resolved,
    outcome: resolved ? (bothFell ? 'draw' : p1Fallen ? 'p2' : 'p1') : null,
  };
}

/**
 * Pure per-frame evaluation of the physics settle-state: whether a pen has fallen off the
 * table, or both pens have come to rest. Kept side-effect free so it stays easy to reason about.
 */
export function evaluateRoundFrame(input: RoundFrameInput): RoundFrameResult {
  const p1Fallen = input.p1Fallen || input.p1Y < FALL_THRESHOLD_Y;
  const p2Fallen = input.p2Fallen || input.p2Y < FALL_THRESHOLD_Y;

  if (p1Fallen || p2Fallen) {
    return resolveFallenFrame(p1Fallen, p2Fallen, input.fallGraceFrames + 1);
  }

  const settled =
    isPairSettled(input.p1LinVel, input.p1AngVel) && isPairSettled(input.p2LinVel, input.p2AngVel);
  const settleFrames = settled ? input.settleFrames + 1 : 0;
  const resolved = settleFrames >= SETTLE_FRAMES_REQUIRED;

  return {
    p1Fallen,
    p2Fallen,
    settleFrames,
    fallGraceFrames: input.fallGraceFrames,
    resolved,
    outcome: null,
  };
}
