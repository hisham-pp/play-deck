/** Domain model for Don't Wake the Giant. Pure data — no React, no canvas, no network. */

export interface Vec2 {
  x: number;
  y: number;
}

/** Axis-aligned scenery. Blocks movement and rattles when brushed. */
export interface Obstacle {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type GiantPhase = 'countdown' | 'heist' | 'escape' | 'escaped' | 'woken';

/** How close the giant is to opening its eyes. Driven entirely by the noise meter. */
export type GiantMood = 'asleep' | 'stirring' | 'restless' | 'awake';

/** How loudly a thief is moving. The single biggest lever a player holds. */
export type Gait = 'tiptoe' | 'walk' | 'run';

export type SeatType = 'human' | 'bot';

export interface GiantSeat {
  id: string;
  displayName: string;
  avatar: string;
  type: SeatType;
  seatIndex: number;
  /** Hex tint used for this thief's marker and scoreboard row. */
  color: string;
}

export interface Thief {
  id: string;
  pos: Vec2;
  vel: Vec2;
  /** Radians; kept so the renderer can face the sprite. */
  facing: number;
  gait: Gait;
  /** Milliseconds of movement since the last footfall ripple. */
  strideMs: number;
  /** Value of loot held but not yet carried out of the door. */
  carried: number;
  carriedCount: number;
  banked: number;
  /** Total noise this thief has personally put into the shared meter. */
  noiseMade: number;
  /** Elapsed-ms stamp until which this thief's noise is damped by a charm. */
  muffledUntilMs: number;
  /** Debounce stamps, so sliding along a wall is one bump rather than sixty. */
  bumpReadyAtMs: number;
  struckReadyAtMs: number;
  collectReadyAtMs: number;
  escaped: boolean;
  connected: boolean;
}

export type TreasureTier = 'trinket' | 'goblet' | 'relic';

export interface Treasure {
  id: string;
  pos: Vec2;
  tier: TreasureTier;
  value: number;
  /** Noise added to the shared meter the moment it is lifted. */
  noise: number;
  takenBy: string | null;
}

export type CharmKind = 'lullaby' | 'muffle';

/** A one-use pickup: `lullaby` settles the whole room, `muffle` quiets one thief. */
export interface Charm {
  id: string;
  pos: Vec2;
  kind: CharmKind;
  usedBy: string | null;
}

/** Moss, rugs and rubble. Noise made inside one barely carries. */
export interface QuietZone {
  pos: Vec2;
  radius: number;
}

/**
 * One of the giant's arms, modelled as a capsule swung from a shoulder. It
 * blocks movement at every mood, and sweeps — becoming a hazard — once the
 * giant turns restless.
 */
export interface Limb {
  id: string;
  pivot: Vec2;
  length: number;
  radius: number;
  angle: number;
  /** Where the limb is drifting to while the giant stirs. */
  targetAngle: number;
  /** Ends of the arc the limb sweeps between once restless. */
  sweepFrom: number;
  sweepTo: number;
  /** Travel direction along that arc: +1 or -1. */
  dir: number;
}

export interface GiantBody {
  head: { pos: Vec2; radius: number };
  torso: Obstacle;
  limbs: Limb[];
  /** Drives the breathing animation and the low rumble of the chest. */
  breathMs: number;
}

export interface MapDefinition {
  id: string;
  name: string;
  width: number;
  height: number;
  obstacles: Obstacle[];
  quietZones: QuietZone[];
  spawns: Vec2[];
  /** The doorway loot has to be carried through before it counts. */
  exit: Obstacle;
  giant: GiantBody;
  treasures: Treasure[];
  charms: Charm[];
}

/** A drawn noise event. Purely cosmetic, but it is how players learn the rules. */
export interface Ripple {
  id: number;
  pos: Vec2;
  bornAtMs: number;
  /** 0..1 — how much noise this event was worth. */
  strength: number;
}

export type NoiseSource = 'step' | 'collect' | 'bump' | 'collide' | 'struck' | 'charm';

export interface NoiseEvent {
  source: NoiseSource;
  thiefId: string;
  amount: number;
  at: Vec2;
  atMs: number;
}

export interface GiantInput {
  moveX: number;
  moveY: number;
  run: boolean;
  tiptoe: boolean;
  /** Lift the nearest treasure, or spend the nearest charm. */
  interact: boolean;
}

export interface GiantWorld {
  phase: GiantPhase;
  mood: GiantMood;
  map: MapDefinition;
  /** Milliseconds since the round clock started, countdown included. */
  elapsedMs: number;
  countdownMs: number;
  heistMs: number;
  escapeMs: number;
  /** Elapsed-ms stamp at which the escape phase opened, or 0 while looting. */
  escapeStartedMs: number;
  /** The shared meter, 0..100. At 100 the giant wakes and everybody loses. */
  noise: number;
  peakNoise: number;
  thieves: Thief[];
  treasures: Treasure[];
  charms: Charm[];
  giant: GiantBody;
  ripples: Ripple[];
  nextRippleId: number;
  lastEvent: NoiseEvent | null;
  bankedTotal: number;
}

export interface GiantStanding {
  seat: GiantSeat;
  thief: Thief;
  rank: number;
}

/** Everything the React layer needs each tick. Projected from the world, never owned. */
export interface GiantHud {
  phase: GiantPhase;
  mood: GiantMood;
  /** Seconds left on the pre-round countdown, 0 once the heist is open. */
  countdown: number;
  secondsLeft: number;
  /** The shared meter as a whole percentage. */
  noisePercent: number;
  bankedTotal: number;
  treasuresLeft: number;
  carried: number;
  carriedCount: number;
  standings: GiantStanding[];
  gait: Gait;
  /** True while the local thief stands on moss, rug or rubble. */
  quiet: boolean;
  muffled: boolean;
  /** Prompt for whatever is in reach, or empty when nothing is. */
  prompt: string;
  /** Latest screen-reader announcement. */
  announcement: string;
}

export interface GiantStats {
  heists: number;
  escapes: number;
  wakeUps: number;
  bestHaul: number;
  totalBanked: number;
  lastPlayedAt: string;
}
