/**
 * Summit Rush domain types. World units are meters, y points up, angles are
 * radians (counter-clockwise positive). Nothing here depends on React or DOM.
 */

export interface Vec2 {
  x: number;
  y: number;
}

export type UpgradeId = 'engine' | 'suspension' | 'tires' | 'fuel';

export type UpgradeLevels = Record<UpgradeId, number>;

/** Tunable vehicle parameters, derived from upgrade levels. */
export interface VehicleSpec {
  driveTorque: number;
  maxWheelSpin: number;
  reverseSpin: number;
  brakeTorque: number;
  springK: number;
  springDamping: number;
  suspensionRest: number;
  suspensionMin: number;
  suspensionMax: number;
  grip: number;
  fuelCapacity: number;
}

export interface Wheel {
  pos: Vec2;
  vel: Vec2;
  /** Local mount point on the chassis. */
  mount: Vec2;
  radius: number;
  /** Rolling rate in rad/s, positive = rolling forward. */
  spin: number;
  /** Visual rotation angle. */
  angle: number;
  grounded: boolean;
  contactPoint: Vec2;
  contactNormal: Vec2;
  slip: number;
  /** Normal impulse accumulated this step (drives traction). */
  normalImpulse: number;
}

export interface Vehicle {
  pos: Vec2;
  vel: Vec2;
  angle: number;
  angVel: number;
  wheels: [Wheel, Wheel];
  spec: VehicleSpec;
  /** True if any hull point touched the ground this step. */
  hullContact: boolean;
  /** Squash factor for the landing animation (0..1). */
  squash: number;
}

export type TerrainFeatureKind =
  'flat' | 'hills' | 'steep' | 'valley' | 'downhill' | 'bumps' | 'jump' | 'gap';

export interface Terrain {
  /** Polyline with non-decreasing x. */
  points: Vec2[];
  seed: number;
  rngState: number;
  cursor: Vec2;
  /** X coordinate of the next fuel can to be placed. */
  nextFuelX: number;
  /** Gap rims used for fall detection and warning signs. */
  gaps: GapInfo[];
}

export interface GapInfo {
  startX: number;
  endX: number;
  rimY: number;
}

export type CollectibleKind = 'coin' | 'gem' | 'fuel';

export interface Collectible {
  id: number;
  kind: CollectibleKind;
  pos: Vec2;
  value: number;
  collected: boolean;
}

export interface Particle {
  pos: Vec2;
  vel: Vec2;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  gravity: number;
}

export interface Popup {
  text: string;
  life: number;
  color: string;
}

export type CrashReason = 'head' | 'flipped' | 'fuel' | 'gap';

export type WorldStatus = 'running' | 'crashing' | 'ended';

export interface RunStats {
  distance: number;
  coins: number;
  stuntScore: number;
  flips: number;
  bestAirTime: number;
  longestJump: number;
}

export interface AirState {
  airborne: boolean;
  airTime: number;
  groundTime: number;
  rotation: number;
  takeoffX: number;
}

export interface Camera {
  x: number;
  y: number;
  zoom: number;
  shake: number;
}

export interface ControlInput {
  gas: boolean;
  brake: boolean;
}

export type WorldEvent =
  | { type: 'coin'; value: number }
  | { type: 'fuel' }
  | { type: 'land'; impact: number }
  | { type: 'stunt'; label: string; points: number; coins: number }
  | { type: 'crash'; reason: CrashReason }
  | { type: 'low-fuel' };

export interface World {
  time: number;
  status: WorldStatus;
  crashReason: CrashReason | null;
  crashTimer: number;
  vehicle: Vehicle;
  terrain: Terrain;
  collectibles: Collectible[];
  nextCollectibleId: number;
  particles: Particle[];
  popups: Popup[];
  camera: Camera;
  fuel: number;
  startX: number;
  stats: RunStats;
  air: AirState;
  /** Seconds the vehicle has spent upside-down / stalled. */
  flipTimer: number;
  stallTimer: number;
  lowFuelWarned: boolean;
  events: WorldEvent[];
  input: ControlInput;
  /** Leftover frame time not yet consumed by fixed physics steps. */
  accumulator: number;
  lastFeature: TerrainFeatureKind | null;
  lastSpeed: number;
}

export interface SummitProgress {
  coins: number;
  bestDistance: number;
  bestScore: number;
  totalRuns: number;
  totalDistance: number;
  upgrades: UpgradeLevels;
}

export interface RunResult {
  distance: number;
  coins: number;
  score: number;
  flips: number;
  bestAirTime: number;
  longestJump: number;
  reason: CrashReason;
  isNewBest: boolean;
}
