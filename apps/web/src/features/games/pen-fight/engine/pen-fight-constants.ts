import type { AIDifficulty, PenFightMode } from '../types/pen-fight.types';

export const MODE_AI: PenFightMode = 'ai';
export const MODE_LOCAL_2P: PenFightMode = 'local2p';
export const MODE_ONLINE: PenFightMode = 'online';

export const SPEED_NORMAL = 'normal' as const;
export const SPEED_SLOW = 'slow' as const;

/**
 * Per-speed tuning. Damping is kept light: pens should stop because of table friction (a
 * constant, snappy deceleration), not because of air drag (a slow exponential fade that feels
 * floaty). `speedMultiplier` scales the launch velocity of a flick.
 */
export const SPEED_PHYSICS_CONFIG = {
  normal: {
    linearDamping: 0.08,
    angularDamping: 0.7,
    speedMultiplier: 1,
  },
  slow: {
    linearDamping: 0.6,
    angularDamping: 1.2,
    speedMultiplier: 0.8,
  },
};

export const DIFFICULTY_ROOKIE: AIDifficulty = 'rookie';
export const DIFFICULTY_PRO: AIDifficulty = 'pro';
export const DIFFICULTY_LEGEND: AIDifficulty = 'legend';

export const PLAYER_ONE = 'p1' as const;
export const PLAYER_TWO = 'p2' as const;

export const MAX_ROUNDS = 3;
export const ROUNDS_TO_WIN = 2;

export const DEFAULT_PLAYER_ONE_COLOR = '#3b82f6';
export const DEFAULT_PLAYER_TWO_COLOR = '#ef4444';

// Arena / physics tuning shared between the reducer and the 3D scene.
export const TABLE_WIDTH = 2.0;
export const TABLE_DEPTH = 3.2;
export const TABLE_HEIGHT = 0.22;
export const TABLE_SURFACE_Y = TABLE_HEIGHT / 2;

export const PEN_LENGTH = 0.78;
export const PEN_RADIUS = 0.045;
export const PEN_START_Z = TABLE_DEPTH / 2 - 0.5;
export const PEN_START_Y = TABLE_SURFACE_Y + PEN_RADIUS + 0.01;

/** A real ballpoint pen is ~14 cm long; the arena models it at PEN_LENGTH world units. */
const REAL_PEN_LENGTH_M = 0.14;
/**
 * Gravity scaled to the arena. The scene is several times larger than a real desk, so real-world
 * 9.81 makes everything drift and fall in slow motion. Scaling it by the same factor restores
 * the quick, snappy feel of flicking an actual pen across a table.
 */
export const WORLD_GRAVITY = -9.81 * (PEN_LENGTH / REAL_PEN_LENGTH_M);

/** Launch speed (world units/s) of a flick at 0% and 100% power, before the speed multiplier. */
export const MIN_FLICK_SPEED = 1.2;
export const MAX_FLICK_SPEED = 7.8;
/** Peak yaw spin (rad/s) a flick can add; scaled by `computeFlickSpin` and power. */
export const MAX_FLICK_SPIN = 9;

// Contact materials: plastic pens slide on a varnished tabletop and clack off each other.
export const PEN_FRICTION = 0.28;
export const PEN_RESTITUTION = 0.38;
export const TABLE_FRICTION = 0.34;
export const TABLE_RESTITUTION = 0.05;
export const MAX_DRAG_DISTANCE = 1.6;
export const GRAB_RADIUS = 0.75;
export const MIN_POWER_THRESHOLD = 0.06;

export const FALL_THRESHOLD_Y = TABLE_SURFACE_Y - 1.1;
export const SETTLE_LINEAR_EPSILON = 0.035;
export const SETTLE_ANGULAR_EPSILON = 0.06;
export const SETTLE_FRAMES_REQUIRED = 24;
export const FALL_GRACE_FRAMES = 14;

export const AI_THINK_DELAY_MS: Record<AIDifficulty, number> = {
  rookie: 950,
  pro: 700,
  legend: 480,
};

export const AI_ACCURACY: Record<AIDifficulty, number> = {
  rookie: 0.55,
  pro: 0.78,
  legend: 0.95,
};

export const AI_POWER_RANGE: Record<AIDifficulty, [number, number]> = {
  rookie: [0.35, 0.7],
  pro: [0.45, 0.8],
  legend: [0.55, 0.9],
};

// --- Online sync ---
/**
 * Fixed physics step shared by every client so simulations advance identically. 120 Hz keeps
 * the small, fast pens stable under the arena-scaled gravity (at 60 Hz a resting pen jitters).
 */
export const PHYSICS_TIME_STEP = 1 / 120;
export const PHYSICS_SOLVER_ITERATIONS = 8;
/** How often the authority client broadcasts pen transforms while pens are in motion. */
export const PEN_SYNC_INTERVAL_MS = 50;
/** Extra frames of snapshots sent after motion stops, so resting poses match exactly. */
export const PEN_SYNC_TRAILING_FRAMES = 20;
