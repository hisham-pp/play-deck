import type { ElevatorBehavior, ElevatorFloorPlan } from '../types/unstable-elevator.types';
import { shapesForFloor } from './elevator-objects';
import { createRng, type ElevatorRng } from './elevator-rng';

const SWAY: ElevatorBehavior = 'sway';

/** Floor each behaviour is unlocked on, in the order the shaft learns them. */
const BEHAVIOR_UNLOCKS: { behavior: ElevatorBehavior; floor: number }[] = [
  { behavior: SWAY, floor: 1 },
  { behavior: 'tilt', floor: 3 },
  { behavior: 'sudden-stop', floor: 5 },
  { behavior: 'speed-up', floor: 6 },
  { behavior: 'wind', floor: 7 },
  { behavior: 'bounce', floor: 9 },
];

const BASE_ASCENT_MS = 7000;
const MIN_ASCENT_MS = 4200;
/** Difficulty saturates here, so floor 40 is hard rather than impossible. */
const RAMP_CEILING = 18;

function ramp(floor: number): number {
  return Math.min(1, (floor - 1) / RAMP_CEILING);
}

function unlocked(floor: number): ElevatorBehavior[] {
  return BEHAVIOR_UNLOCKS.filter((entry) => entry.floor <= floor).map((entry) => entry.behavior);
}

/**
 * Picks the behaviours for a floor. Everything unlocked is in play, but only a
 * slice fires on any one floor — a run that threw all six at once every time
 * would stop reading as a rising lift and start reading as noise.
 */
function chooseBehaviors(floor: number, rng: ElevatorRng): ElevatorBehavior[] {
  const available = unlocked(floor);
  if (available.length <= 1) return available;

  const wanted = Math.min(available.length, 1 + Math.round(ramp(floor) * 3) + rng.int(0, 1));
  const pool = [...available];
  const chosen: ElevatorBehavior[] = [SWAY];
  pool.splice(pool.indexOf(SWAY), 1);

  while (chosen.length < wanted && pool.length > 0) {
    chosen.push(pool.splice(rng.int(0, pool.length - 1), 1)[0]);
  }
  return chosen;
}

function stopPointsFor(floor: number, rng: ElevatorRng, enabled: boolean): number[] {
  if (!enabled) return [];
  const count = 1 + (rng.chance(ramp(floor) * 0.6) ? 1 : 0);
  const points: number[] = [];
  for (let i = 0; i < count; i += 1) {
    points.push(rng.float(0.25 + i * 0.3, 0.45 + i * 0.3));
  }
  return points.sort((a, b) => a - b);
}

/** The shaft's script for one floor, derived from the match seed alone. */
export function buildFloorPlan(floor: number, seed: string): ElevatorFloorPlan {
  const rng = createRng(`${seed}:floor:${floor}`);
  const intensity = ramp(floor);
  const behaviors = chooseBehaviors(floor, rng);
  const has = (behavior: ElevatorBehavior) => behaviors.includes(behavior);

  const speedFactor = has('speed-up') ? 0.78 : 1;
  const pool = shapesForFloor(floor);

  return {
    floor,
    behaviors,
    ascentMs: Math.max(
      MIN_ASCENT_MS,
      Math.round((BASE_ASCENT_MS - intensity * 1800) * speedFactor),
    ),
    swayAmplitude: has(SWAY) ? 0.16 + intensity * 0.52 : 0,
    swayFrequency: 0.55 + intensity * 0.85 + rng.float(-0.08, 0.08),
    tiltAmplitude: has('tilt') ? 0.035 + intensity * 0.12 : 0,
    windStrength: has('wind') ? 1.6 + intensity * 4.4 : 0,
    windPeriod: rng.float(2.1, 3.4),
    bounceAmplitude: has('bounce') ? 0.08 + intensity * 0.16 : 0,
    stopPoints: stopPointsFor(floor, rng, has('sudden-stop')),
    shapeId: pool[rng.int(0, pool.length - 1)].id,
  };
}

/** Plain-language labels for the HUD's "this floor" chips. */
export const BEHAVIOR_LABELS: Record<ElevatorBehavior, string> = {
  sway: 'Sway',
  tilt: 'Tilt',
  'sudden-stop': 'Sudden stops',
  'speed-up': 'Speed surge',
  wind: 'Wind gusts',
  bounce: 'Bouncy floor',
};
