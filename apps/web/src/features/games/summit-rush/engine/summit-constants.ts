import type { Vec2 } from './summit-types';

/** Fixed physics step (seconds). Stiff springs need a small step. */
export const PHYSICS_DT = 1 / 240;
export const MAX_STEPS_PER_FRAME = 16;

export const GRAVITY = 13;

// ── Chassis ──────────────────────────────────────────────
export const CHASSIS_MASS = 160;
export const CHASSIS_INERTIA = 240;
export const CHASSIS_LINEAR_DRAG = 0.04;
export const AIR_ANGULAR_DAMPING = 0.35;
export const MAX_ANGULAR_VELOCITY = 7.5;
export const AIR_CONTROL_TORQUE = 950;
/** Extra pitch damping while wheels touch the ground (keeps landings calm). */
export const GROUND_ANGULAR_DAMPING = 2.2;
export const HULL_RESTITUTION = 0.15;
export const HULL_FRICTION = 0.45;

/** Hull collision samples in chassis-local space. */
export const HULL_POINTS: readonly Vec2[] = [
  { x: -1.35, y: -0.1 },
  { x: 1.45, y: -0.1 },
  { x: -1.45, y: 0.4 },
  { x: 1.55, y: 0.28 },
  { x: -0.66, y: 1.1 },
  { x: 0.34, y: 1.1 },
  { x: 0, y: -0.15 },
];

/** Driver's helmet — touching the ground ends the run. */
export const HEAD_OFFSET: Vec2 = { x: -0.15, y: 1.12 };
export const HEAD_RADIUS = 0.26;

// ── Wheels ───────────────────────────────────────────────
export const WHEEL_MASS = 12;
export const WHEEL_RADIUS = 0.44;
export const WHEEL_INERTIA = 0.5 * WHEEL_MASS * WHEEL_RADIUS * WHEEL_RADIUS * 2.2;
export const REAR_MOUNT: Vec2 = { x: -1.02, y: -0.05 };
export const FRONT_MOUNT: Vec2 = { x: 1.08, y: -0.05 };
export const REAR_DRIVE_SHARE = 0.6;
export const LATERAL_STIFFNESS = 90000;
export const LATERAL_DAMPING = 1400;
export const BUMP_STOP_STIFFNESS = 70000;
export const WHEEL_RESTITUTION = 0.08;
export const WHEEL_SPIN_DRAG = 0.25;
export const ROLLING_RESISTANCE = 0.6;
/** Share of drive torque fed back into the chassis (wheelies). */
export const DRIVE_REACTION_SHARE = 0.85;

// ── Base vehicle spec (upgrade level 0) ──────────────────
export const BASE_DRIVE_TORQUE = 1000;
export const BASE_MAX_SPIN = 36; // rad/s → ~16 m/s
export const BASE_REVERSE_SPIN = 12;
export const BASE_BRAKE_TORQUE = 1300;
export const BASE_SPRING_K = 8200;
export const BASE_SPRING_DAMPING = 700;
export const BASE_SUSPENSION_REST = 0.56;
export const BASE_SUSPENSION_MIN = 0.2;
export const BASE_SUSPENSION_MAX = 0.66;
export const BASE_GRIP = 1.05;
export const BASE_FUEL_CAPACITY = 100;

// ── Fuel ─────────────────────────────────────────────────
export const FUEL_IDLE_DRAIN = 1.6;
export const FUEL_THROTTLE_DRAIN = 3.4;
export const LOW_FUEL_RATIO = 0.25;
export const FUEL_SPACING_START = 105;
export const FUEL_SPACING_END = 175;

// ── Crash / rollover detection ───────────────────────────
export const FLIP_CRASH_TIME = 1.1;
export const STALL_CRASH_TIME = 2.2;
export const OUT_OF_FUEL_STALL_TIME = 2.2;
export const CRASH_LINGER_TIME = 1.3;
export const GAP_FALL_DEPTH = 3.2;
export const AIRBORNE_GRACE = 0.14;

// ── Scoring ──────────────────────────────────────────────
export const POINTS_PER_METER = 10;
export const POINTS_PER_COIN = 5;
export const FLIP_POINTS = 500;
export const FLIP_COINS = 20;
export const MIN_AIR_TIME_BONUS = 1;
export const AIR_POINTS_PER_SECOND = 120;
export const LONG_JUMP_MIN = 14;
export const LONG_JUMP_POINTS_PER_METER = 12;

// ── Terrain ──────────────────────────────────────────────
export const TERRAIN_STEP = 0.5;
export const TERRAIN_AHEAD = 90;
export const TERRAIN_BEHIND = 40;
export const PIT_DEPTH = 16;
export const DIFFICULTY_RAMP_DISTANCE = 2500;
export const START_FLAT_LENGTH = 26;

// ── Collectibles ─────────────────────────────────────────
export const PICKUP_RADIUS = 1.05;
export const COIN_VALUE = 5;
export const GEM_VALUE = 25;

// ── Camera ───────────────────────────────────────────────
export const VIEW_HEIGHT_METERS = 15;
export const MIN_ZOOM = 0.72;
export const CAMERA_FOLLOW = 5;
export const MAX_PARTICLES = 320;

export function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function rotate(v: Vec2, angle: number): Vec2 {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return { x: v.x * c - v.y * s, y: v.x * s + v.y * c };
}

/** World position of a chassis-local point. */
export function toWorld(origin: Vec2, angle: number, local: Vec2): Vec2 {
  const r = rotate(local, angle);
  return { x: origin.x + r.x, y: origin.y + r.y };
}

/** Wraps an angle into (-π, π]. */
export function wrapAngle(angle: number): number {
  const twoPi = Math.PI * 2;
  let a = angle % twoPi;
  if (a > Math.PI) a -= twoPi;
  if (a <= -Math.PI) a += twoPi;
  return a;
}
