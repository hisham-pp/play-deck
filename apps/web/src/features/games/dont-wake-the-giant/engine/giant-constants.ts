/** Tuning for the giant's chamber. Every distance is in map units. */

export const GAME_ID = 'dont-wake-the-giant';
export const GAME_NAME = "Don't Wake the Giant";

export const MAP_WIDTH = 960;
export const MAP_HEIGHT = 600;

/** The catalog sells this as a 3–6 player co-op, and bots fill any empty seat. */
export const MIN_SEATS = 3;
export const MAX_SEATS = 6;

export const THIEF_RADIUS = 13;
/** Units per second, per gait. Louder is always faster — that is the whole bargain. */
export const TIPTOE_SPEED = 92;
export const WALK_SPEED = 168;
export const RUN_SPEED = 268;
/** Fraction of remaining velocity kept each 16ms, so steering has weight. */
export const THIEF_DAMPING = 0.82;

export const COUNTDOWN_MS = 3200;
export const HEIST_MS = 150_000;
export const ESCAPE_MS = 45_000;

export const NOISE_MAX = 100;
/** The room settles on its own, which is what makes waiting a real tactic. */
export const NOISE_DECAY_PER_SEC = 4.5;

/** Noise per second of movement, before carry weight and damping. */
/**
 * Tuned so that a full crew of six all walking at once sits almost exactly on
 * the decay rate: moving together is sustainable, and it is the mistakes on top
 * of it — running, barging, grabbing the loud things at once — that fill the meter.
 */
export const GAIT_NOISE_PER_SEC: Record<'tiptoe' | 'walk' | 'run', number> = {
  tiptoe: 0.08,
  walk: 0.7,
  run: 3,
};

export const NOISE_BUMP = 4.5;
export const NOISE_COLLIDE = 5.5;
export const NOISE_STRUCK = 12;

export const BUMP_COOLDOWN_MS = 600;
export const COLLIDE_COOLDOWN_MS = 700;
export const STRUCK_COOLDOWN_MS = 900;
export const COLLECT_COOLDOWN_MS = 350;

/** Each held item makes you louder and slower, so a full pack is a liability. */
export const CARRY_NOISE_PER_ITEM = 0.28;
export const CARRY_SLOW_PER_ITEM = 0.035;
export const CARRY_SLOW_FLOOR = 0.6;

export const QUIET_ZONE_FACTOR = 0.3;
export const MUFFLE_FACTOR = 0.25;
export const MUFFLE_MS = 8000;
export const LULLABY_RELIEF = 22;

export const MOOD_STIR_AT = 50;
export const MOOD_RESTLESS_AT = 75;

export const INTERACT_RANGE = 40;

export const FOOTFALL_INTERVAL_MS = 280;
export const RIPPLE_LIFE_MS = 900;
export const MAX_RIPPLES = 60;

/** Radians per second an arm drifts to its new rest angle while the giant stirs. */
export const LIMB_DRIFT_PER_SEC = 0.22;
/** Radians per second an arm sweeps once the giant turns restless. */
export const LIMB_SWEEP_PER_SEC = 0.62;

export const TREASURE_VALUE = { trinket: 10, goblet: 25, relic: 60 } as const;
export const TREASURE_NOISE = { trinket: 2.5, goblet: 5, relic: 9 } as const;
export const TREASURE_RADIUS = 11;

/** Bots re-plan on this cadence rather than every frame, so they read as human. */
export const BOT_DECISION_MS = 340;

export const SEAT_COLORS = [
  '#f59e0b',
  '#38bdf8',
  '#4ade80',
  '#f472b6',
  '#a78bfa',
  '#fb7185',
] as const;

export const PHASE_COUNTDOWN = 'countdown';
export const PHASE_HEIST = 'heist';
export const PHASE_ESCAPE = 'escape';
export const PHASE_ESCAPED = 'escaped';
export const PHASE_WOKEN = 'woken';

export const MOOD_ASLEEP = 'asleep';
export const MOOD_STIRRING = 'stirring';
export const MOOD_RESTLESS = 'restless';
export const MOOD_AWAKE = 'awake';
