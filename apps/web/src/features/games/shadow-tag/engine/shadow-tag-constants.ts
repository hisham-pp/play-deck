/** Tuning for the Shadow Tag arena. Every distance is in arena units. */

export const GAME_ID = 'shadow-tag';
export const GAME_NAME = 'Shadow Tag';

export const ARENA_WIDTH = 960;
export const ARENA_HEIGHT = 600;

export const MIN_SEATS = 2;
export const MAX_SEATS = 6;

export const PLAYER_RADIUS = 13;
/** Units per second at a normal jog. */
export const PLAYER_SPEED = 205;
export const SNEAK_SPEED_FACTOR = 0.46;
/** Fraction of remaining velocity kept each 16ms — keeps steering weighty, not icy. */
export const PLAYER_DAMPING = 0.82;

export const COUNTDOWN_MS = 3200;
export const ROUND_MS = 120_000;

/** A fresh tag cannot be reversed inside this window, so nobody ping-pongs the mark. */
export const TAG_GRACE_MS = 2200;
/** How far past their own outline "it" can reach to make contact. */
export const TAG_REACH = 6;

export const SURVIVAL_POINTS_PER_SEC = 10;
export const TAG_POINTS = 60;

/**
 * Shadow geometry. A runner is modelled as a post of `CASTER_HEIGHT` under a
 * lamp of `LIGHT_HEIGHT`, so the projection stretches as the lamp gets closer
 * to the ground plane — the classic long-shadow look.
 */
export const LIGHT_HEIGHT = 1;
export const CASTER_HEIGHT = 0.42;
export const SHADOW_MIN_LENGTH = 22;
export const SHADOW_MAX_LENGTH = 190;
/** Half-width the shadow gains per unit of length. */
export const SHADOW_SPREAD = 0.12;
/** Below this the shadow is too faint to draw, or to tag through. */
export const SHADOW_MIN_OPACITY = 0.08;

export const LIGHT_INTERACT_RANGE = 74;
export const LIGHT_BLOCK_MS = 4200;
export const LIGHT_INTERACT_COOLDOWN_MS = 5200;
/** Seconds-to-full for a lamp fading out and back in. */
export const LIGHT_FADE_PER_SEC = 3.2;

export const FOOTSTEP_INTERVAL_MS = 240;
export const FOOTSTEP_LIFE_MS = 1500;
export const MAX_FOOTSTEPS = 90;

export const PROP_DISTURB_RANGE = 34;
export const PROP_DISTURB_MS = 1400;

/** Bots re-plan on this cadence rather than every frame, so they read as human. */
export const BOT_DECISION_MS = 320;
export const BOT_WANDER_MS = 1800;

export const SEAT_COLORS = [
  '#f59e0b',
  '#38bdf8',
  '#f472b6',
  '#4ade80',
  '#a78bfa',
  '#fb7185',
] as const;

export const PHASE_COUNTDOWN = 'countdown';
export const PHASE_PLAYING = 'playing';
export const PHASE_ROUND_OVER = 'round-over';
