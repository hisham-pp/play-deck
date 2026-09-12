import type { AIDifficulty, PenFightMode } from '../types/pen-fight.types';

export const MODE_AI: PenFightMode = 'ai';
export const MODE_LOCAL_2P: PenFightMode = 'local2p';
export const MODE_ONLINE: PenFightMode = 'online';

export const SPEED_NORMAL = 'normal' as const;
export const SPEED_SLOW = 'slow' as const;

export const SPEED_PHYSICS_CONFIG = {
  normal: {
    linearDamping: 0.45,
    angularDamping: 0.55,
    impulseMultiplier: 1.35,
  },
  slow: {
    linearDamping: 0.9,
    angularDamping: 1.0,
    impulseMultiplier: 0.95,
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

export const MAX_FLICK_IMPULSE = 0.024;
export const MIN_FLICK_IMPULSE = 0.005;
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
