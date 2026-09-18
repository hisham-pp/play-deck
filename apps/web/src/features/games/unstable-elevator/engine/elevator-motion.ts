import type { ElevatorFloorPlan } from '../types/unstable-elevator.types';
import { GRAVITY, PLATFORM_CENTRE_Y } from './elevator-constants';

/** Where the platform should be, and what the ride is doing to the cargo. */
export interface ElevatorMotion {
  platformX: number;
  platformY: number;
  platformAngle: number;
  /**
   * The lift's own upward acceleration. It adds to gravity while the lift
   * speeds up and cancels it during a sudden stop, which is what throws a
   * stack off the platform rather than merely shaking it.
   */
  frameAccelY: number;
  windX: number;
  /** 0–1 summary of how rough the ride is, for shake, audio and the HUD. */
  turbulence: number;
}

/** How much of a floor's sway survives while the lift is docked. */
const IDLE_SCALE = 0.18;
/** Share of the ascent spent speeding up, and again slowing down. */
const RAMP_FRACTION = 0.16;
const CRUISE_ACCEL = 2.4;
/** A sudden stop never fully inverts gravity — the stack lifts, it does not fly. */
const STOP_ACCEL = GRAVITY * 0.92;
const STOP_WIDTH = 0.045;
const TILT_FREQUENCY = 0.42;
const BOUNCE_FREQUENCY = 2.6;

function gustEnvelope(seconds: number, period: number): number {
  const phase = (seconds % period) / period;
  // A gust builds, peaks and dies rather than blowing at a constant strength.
  return Math.sin(phase * Math.PI) ** 2 * Math.sin(seconds * 3.1);
}

/** Acceleration from the ascent profile alone, ignoring the scripted stops. */
function ascentAccel(progress: number): number {
  if (progress < RAMP_FRACTION) return CRUISE_ACCEL;
  if (progress > 1 - RAMP_FRACTION) return -CRUISE_ACCEL;
  return 0;
}

/** Sharp deceleration pulses at the floor plan's scripted stop points. */
function stopAccel(progress: number, stopPoints: number[]): number {
  let total = 0;
  for (const point of stopPoints) {
    const distance = (progress - point) / STOP_WIDTH;
    if (Math.abs(distance) > 3) continue;
    total -= STOP_ACCEL * Math.exp(-distance * distance);
  }
  return total;
}

interface SampleOptions {
  plan: ElevatorFloorPlan;
  /** Seconds since the run began; keeps the sway continuous across phases. */
  clockSeconds: number;
  /** 0–1 through the ascent, or `null` while the lift is docked. */
  ascentProgress: number | null;
}

export function sampleMotion({
  plan,
  clockSeconds,
  ascentProgress,
}: SampleOptions): ElevatorMotion {
  const moving = ascentProgress !== null;
  const scale = moving ? 1 : IDLE_SCALE;

  const swayPhase = clockSeconds * plan.swayFrequency * Math.PI * 2;
  const platformX = Math.sin(swayPhase) * plan.swayAmplitude * scale;

  const tiltPhase = clockSeconds * TILT_FREQUENCY * Math.PI * 2;
  const platformAngle = Math.sin(tiltPhase + 1.1) * plan.tiltAmplitude * scale;

  const bouncePhase = clockSeconds * BOUNCE_FREQUENCY * Math.PI * 2;
  const bounce = moving ? Math.sin(bouncePhase) * plan.bounceAmplitude : 0;

  const frameAccelY = moving
    ? ascentAccel(ascentProgress) + stopAccel(ascentProgress, plan.stopPoints)
    : 0;

  const windX = moving ? gustEnvelope(clockSeconds, plan.windPeriod) * plan.windStrength : 0;

  const turbulence = Math.min(
    1,
    Math.abs(frameAccelY) / GRAVITY +
      Math.abs(windX) / 8 +
      Math.abs(platformAngle) * 3 +
      Math.abs(bounce) * 2,
  );

  return {
    platformX,
    platformY: PLATFORM_CENTRE_Y + bounce,
    platformAngle,
    frameAccelY,
    windX,
    turbulence,
  };
}
