import { paletteAt } from './biomes';
import { addPopup, spawnLandingPuff } from './particles';
import {
  AIR_POINTS_PER_SECOND,
  AIRBORNE_GRACE,
  CRASH_LINGER_TIME,
  FLIP_COINS,
  FLIP_CRASH_TIME,
  FLIP_POINTS,
  FUEL_IDLE_DRAIN,
  FUEL_THROTTLE_DRAIN,
  GAP_FALL_DEPTH,
  LONG_JUMP_MIN,
  LONG_JUMP_POINTS_PER_METER,
  LOW_FUEL_RATIO,
  MIN_AIR_TIME_BONUS,
  OUT_OF_FUEL_STALL_TIME,
  POINTS_PER_COIN,
  POINTS_PER_METER,
  STALL_CRASH_TIME,
  wrapAngle,
} from './summit-constants';
import type { CrashReason, World } from './summit-types';
import type { StepContact } from './vehicle-physics';

const TWO_PI = Math.PI * 2;
const HARD_LANDING = 7;

function flipLabel(count: number, backwards: boolean): string {
  const name = backwards ? 'BACKFLIP' : 'FRONTFLIP';
  if (count === 1) return name;
  if (count === 2) return `DOUBLE ${name}`;
  return `${count}x ${name}`;
}

function award(world: World, label: string, points: number, coins: number, color: string): void {
  world.stats.stuntScore += points;
  world.stats.coins += coins;
  world.events.push({ type: 'stunt', label, points, coins });
  addPopup(world, coins > 0 ? `${label}  +${points}  ●${coins}` : `${label}  +${points}`, color);
}

function awardLanding(world: World): void {
  const { air, vehicle, stats } = world;
  const upright = Math.abs(wrapAngle(vehicle.angle)) < 1.2;
  if (world.status !== 'running' || !upright) return;

  const flips = Math.floor((Math.abs(air.rotation) + 0.6) / TWO_PI);
  if (flips > 0) {
    stats.flips += flips;
    award(
      world,
      flipLabel(flips, air.rotation > 0),
      FLIP_POINTS * flips,
      FLIP_COINS * flips,
      '#f472b6',
    );
  }
  if (air.airTime >= MIN_AIR_TIME_BONUS) {
    stats.bestAirTime = Math.max(stats.bestAirTime, air.airTime);
    const points = Math.round(air.airTime * AIR_POINTS_PER_SECOND);
    award(
      world,
      `AIR TIME ${air.airTime.toFixed(1)}s`,
      points,
      Math.floor(air.airTime * 3),
      '#38bdf8',
    );
  }
  const jump = vehicle.pos.x - air.takeoffX;
  if (jump >= LONG_JUMP_MIN) {
    stats.longestJump = Math.max(stats.longestJump, jump);
    const points = Math.round(jump * LONG_JUMP_POINTS_PER_METER);
    award(world, `LONG JUMP ${Math.round(jump)}m`, points, Math.floor(jump / 4), '#facc15');
  }
}

/** Tracks airborne time, rotation and landings. Call once per physics step. */
export function updateAirState(world: World, contact: StepContact, dt: number): void {
  const { air, vehicle } = world;
  const grounded = contact.wheelsGrounded > 0 || vehicle.hullContact;
  if (!grounded) {
    air.airTime += dt;
    air.rotation += vehicle.angVel * dt;
    if (!air.airborne && air.airTime > AIRBORNE_GRACE) {
      air.airborne = true;
      air.takeoffX = vehicle.pos.x - vehicle.vel.x * air.airTime;
    }
    return;
  }

  if (air.airborne) {
    awardLanding(world);
    if (contact.impact > 2) {
      world.events.push({ type: 'land', impact: contact.impact });
      vehicle.squash = Math.min(1, contact.impact / 14);
      spawnLandingPuff(world, vehicle.pos, contact.impact, paletteAt(world.stats.distance).dust);
    }
    if (contact.impact > HARD_LANDING) world.camera.shake = Math.min(1, contact.impact / 18);
  }
  air.airborne = false;
  air.airTime = 0;
  air.rotation = 0;
}

export function triggerCrash(world: World, reason: CrashReason): void {
  if (world.status !== 'running') return;
  world.status = 'crashing';
  world.crashReason = reason;
  world.crashTimer = reason === 'fuel' ? 0.5 : CRASH_LINGER_TIME;
  if (reason !== 'fuel') world.camera.shake = 1;
  world.events.push({ type: 'crash', reason });
}

/** Rollover, helmet, gap and fuel-stall detection. */
export function detectCrash(world: World, contact: StepContact, dt: number): void {
  const { vehicle } = world;
  if (contact.headHit) return triggerCrash(world, 'head');

  const up = Math.cos(vehicle.angle);
  const speed = Math.hypot(vehicle.vel.x, vehicle.vel.y);
  // Only time spent resting on the roof or side counts — mid-air flips are free.
  const onRoof = up < -0.2 && vehicle.hullContact;
  const onSide = Math.abs(up) < 0.35 && vehicle.hullContact && speed < 1.2;
  if (onRoof) world.flipTimer += dt;
  else if (onSide) world.flipTimer += dt * (FLIP_CRASH_TIME / STALL_CRASH_TIME);
  else if (contact.wheelsGrounded > 0) world.flipTimer = Math.max(0, world.flipTimer - dt * 2);
  if (world.flipTimer > FLIP_CRASH_TIME) return triggerCrash(world, 'flipped');

  for (const gap of world.terrain.gaps) {
    if (
      vehicle.pos.x > gap.startX &&
      vehicle.pos.x < gap.endX &&
      vehicle.pos.y < gap.rimY - GAP_FALL_DEPTH
    ) {
      return triggerCrash(world, 'gap');
    }
  }

  // Out of fuel: keep coasting while it still gains ground, then call it.
  const progressing = vehicle.pos.x - world.startX > world.stats.distance;
  world.stallTimer = world.fuel <= 0 && !progressing ? world.stallTimer + dt : 0;
  if (world.stallTimer > OUT_OF_FUEL_STALL_TIME) triggerCrash(world, 'fuel');
}

export function drainFuel(world: World, dt: number): void {
  if (world.fuel <= 0) return;
  const rate = FUEL_IDLE_DRAIN + (world.input.gas ? FUEL_THROTTLE_DRAIN : 0);
  world.fuel = Math.max(0, world.fuel - rate * dt);
  const capacity = world.vehicle.spec.fuelCapacity;
  if (!world.lowFuelWarned && world.fuel < capacity * LOW_FUEL_RATIO) {
    world.lowFuelWarned = true;
    world.events.push({ type: 'low-fuel' });
  }
}

export function runScore(world: World): number {
  const { stats } = world;
  return (
    Math.floor(stats.distance) * POINTS_PER_METER + stats.coins * POINTS_PER_COIN + stats.stuntScore
  );
}
