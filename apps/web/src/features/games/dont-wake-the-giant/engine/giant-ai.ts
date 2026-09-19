import type { GiantBody, GiantMood, Limb, Thief, Vec2 } from '../types/giant.types';
import { distanceToSegment, limbTip, wrapAngle } from './geometry';
import {
  LIMB_DRIFT_PER_SEC,
  LIMB_SWEEP_PER_SEC,
  MOOD_ASLEEP,
  MOOD_RESTLESS,
  MOOD_STIRRING,
  THIEF_RADIUS,
} from './giant-constants';

/** The capsule a limb occupies right now: shoulder to fingertip. */
export function limbSegment(limb: Limb): { a: Vec2; b: Vec2 } {
  return { a: limb.pivot, b: limbTip(limb.pivot, limb.angle, limb.length) };
}

/** Where an arm lies when the giant is undisturbed. */
function restAngle(limb: Limb): number {
  return (limb.sweepFrom + limb.sweepTo) / 2;
}

/**
 * A stirring giant shifts its arms to the far end of their arc, which closes
 * some routes and opens others. The new angle is derived from the limb's own
 * blueprint rather than drawn at random, so every client agrees on the layout
 * without the host having to describe it.
 */
function retarget(limb: Limb, mood: GiantMood): number {
  if (mood === MOOD_ASLEEP) return restAngle(limb);
  return limb.dir > 0 ? limb.sweepTo : limb.sweepFrom;
}

function driftToward(limb: Limb, target: number, dtSec: number): void {
  const delta = wrapAngle(target - limb.angle);
  const step = LIMB_DRIFT_PER_SEC * dtSec;
  limb.angle += Math.abs(delta) <= step ? delta : Math.sign(delta) * step;
}

/** A restless arm sweeps its full arc, turning round at each end. */
function sweep(limb: Limb, dtSec: number): void {
  limb.angle += limb.dir * LIMB_SWEEP_PER_SEC * dtSec;
  if (limb.angle >= limb.sweepTo) {
    limb.angle = limb.sweepTo;
    limb.dir = -1;
  } else if (limb.angle <= limb.sweepFrom) {
    limb.angle = limb.sweepFrom;
    limb.dir = 1;
  }
}

/**
 * Advances the sleeping body. The mood comes straight from the noise meter, so
 * the giant is never making decisions of its own — it is only ever reacting to
 * how loud the room has been.
 */
export function updateGiant(giant: GiantBody, mood: GiantMood, dtSec: number): void {
  giant.breathMs += dtSec * 1000;

  for (const limb of giant.limbs) {
    if (mood === MOOD_RESTLESS) {
      sweep(limb, dtSec);
      continue;
    }
    limb.targetAngle = retarget(limb, mood);
    driftToward(limb, limb.targetAngle, dtSec);
  }
}

/** True once the arms are actually moving fast enough to knock somebody over. */
export function limbsAreHazardous(mood: GiantMood): boolean {
  return mood === MOOD_RESTLESS;
}

/** The limb currently overlapping this thief, if any. */
export function limbTouching(giant: GiantBody, pos: Vec2, radius = THIEF_RADIUS): Limb | null {
  for (const limb of giant.limbs) {
    const { a, b } = limbSegment(limb);
    if (distanceToSegment(a, b, pos) <= limb.radius + radius) return limb;
  }
  return null;
}

/** A restless sweep catching a thief: the loudest thing that can happen. */
export function limbStrikes(giant: GiantBody, mood: GiantMood, thief: Thief): boolean {
  if (!limbsAreHazardous(mood)) return false;
  return limbTouching(giant, thief.pos) !== null;
}

/** 0..1 breathing curve, shared by the renderer and the chest-rumble audio cue. */
export function breathPhase(giant: GiantBody, mood: GiantMood): number {
  const period = mood === MOOD_ASLEEP ? 4200 : mood === MOOD_STIRRING ? 3000 : 1900;
  return (Math.sin((giant.breathMs / period) * Math.PI * 2) + 1) / 2;
}
