/** Domain model for Shadow Tag. Pure data — no React, no canvas, no network. */

export interface Vec2 {
  x: number;
  y: number;
}

export type ShadowTagPhase = 'countdown' | 'playing' | 'round-over';

export type SeatType = 'human' | 'bot';

export interface ShadowTagSeat {
  id: string;
  displayName: string;
  avatar: string;
  type: SeatType;
  seatIndex: number;
  /** Hex tint used for this player's shadow and HUD row. */
  color: string;
}

export interface ShadowTagRunner {
  id: string;
  pos: Vec2;
  vel: Vec2;
  /** Radians; kept so the renderer can face the silhouette. */
  facing: number;
  sneaking: boolean;
  /** Milliseconds of movement since the last footstep was dropped. */
  strideMs: number;
  /** Elapsed-ms stamp before which this runner cannot be tagged. */
  immuneUntilMs: number;
  /** Elapsed-ms stamp before which this runner cannot touch a light again. */
  interactReadyAtMs: number;
  score: number;
  tags: number;
  timesTagged: number;
  /** Total ms spent as "it" — the stat the scoreboard shames you with. */
  itMs: number;
  /** Ms since this runner last held the mark. */
  evasionMs: number;
  /** Longest such stretch this round. */
  bestEvasionMs: number;
  connected: boolean;
}

export interface LightSource {
  id: string;
  /** Elliptical patrol path the lamp drifts along. */
  orbit: { cx: number; cy: number; rx: number; ry: number };
  angle: number;
  /** Radians per second. The sign is the travel direction and flips on redirect. */
  speed: number;
  pos: Vec2;
  /** 0 when fully covered, 1 when burning clean. */
  intensity: number;
  /** Elapsed-ms stamp until which the lamp stays covered. */
  blockedUntilMs: number;
  /** How far the lamp throws usable light, in arena units. */
  reach: number;
  hue: number;
}

/** Axis-aligned pillar. Blocks movement and cuts light. */
export interface Obstacle {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Scenery that rattles when someone brushes past — a clue, not a wall. */
export interface Prop {
  id: string;
  pos: Vec2;
  radius: number;
  disturbedUntilMs: number;
  seed: number;
}

export interface ArenaDefinition {
  id: string;
  name: string;
  width: number;
  height: number;
  obstacles: Obstacle[];
  props: Prop[];
  lights: LightSource[];
  spawns: Vec2[];
}

/** One lamp's projection of one runner, ready to draw and to test tags against. */
export interface ShadowCast {
  playerId: string;
  lightId: string;
  from: Vec2;
  to: Vec2;
  nearRadius: number;
  farRadius: number;
  /** 0..1 — how readable this shadow is right now. */
  opacity: number;
}

export interface Footstep {
  id: number;
  pos: Vec2;
  bornAtMs: number;
  seed: number;
}

export interface TagEvent {
  taggerId: string;
  victimId: string;
  atMs: number;
  /** Where the contact happened, for the ripple the renderer draws. */
  at: Vec2;
}

export interface ShadowTagInput {
  moveX: number;
  moveY: number;
  sneak: boolean;
  /** Cover the nearest lamp. */
  block: boolean;
  /** Reverse the nearest lamp's patrol. */
  redirect: boolean;
}

export interface ShadowTagWorld {
  phase: ShadowTagPhase;
  arena: ArenaDefinition;
  /** Milliseconds since the round clock started, countdown included. */
  elapsedMs: number;
  roundMs: number;
  countdownMs: number;
  itId: string;
  players: ShadowTagRunner[];
  lights: LightSource[];
  props: Prop[];
  footsteps: Footstep[];
  lastTag: TagEvent | null;
  nextFootstepId: number;
}

export interface ShadowTagStanding {
  seat: ShadowTagSeat;
  runner: ShadowTagRunner;
  rank: number;
}

/** Everything the React layer needs each tick. Projected from the world, never owned. */
export interface ShadowTagHud {
  phase: ShadowTagPhase;
  /** Seconds left on the pre-round countdown, 0 once play is open. */
  countdown: number;
  secondsLeft: number;
  itId: string;
  itName: string;
  isLocalIt: boolean;
  standings: ShadowTagStanding[];
  /** How brightly the local runner is lit right now, 0..1. */
  exposure: number;
  /** Seconds until the local runner may touch a lamp again. */
  lightCooldown: number;
  sneaking: boolean;
  immune: boolean;
  /** Latest screen-reader announcement. */
  announcement: string;
}

export interface ShadowTagStats {
  roundsPlayed: number;
  wins: number;
  tagsMade: number;
  timesTagged: number;
  /** Longest single stretch, in seconds, spent free of the "it" mark. */
  longestEvasionSec: number;
  lastPlayedAt: string;
}
