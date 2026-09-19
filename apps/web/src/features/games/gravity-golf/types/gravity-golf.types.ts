export type GravityObjectType =
  'attractor' | 'repeller' | 'directional' | 'orbit-ring' | 'gravity-wall';

export interface Vector2D {
  x: number;
  y: number;
}

export interface GravityObject {
  id: string;
  type: GravityObjectType;
  position: Vector2D;
  radius: number;
  strength: number;
  /** For directional fields: unit direction of the thrust/push vector */
  direction?: Vector2D;
  /** For gravity walls: length and orientation angle in radians */
  length?: number;
  angle?: number;
  /** For multiplayer tracking */
  ownerId?: string;
}

export interface AsteroidHazard {
  id: string;
  position: Vector2D;
  radius: number;
}

export interface WallSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  restitution?: number;
}

export interface CosmicCup {
  position: Vector2D;
  radius: number;
  captureRadius: number;
  captureSpeed: number;
}

export interface HoleDefinition {
  id: string;
  number: number;
  name: string;
  subtitle: string;
  par: number;
  ballSpawn: Vector2D;
  initialVelocity?: Vector2D;
  cup: CosmicCup;
  fixedObjects: GravityObject[];
  hazards: AsteroidHazard[];
  walls: WallSegment[];
  allowedItems: Record<GravityObjectType, number>;
}

export type BallFlightStatus = 'idle' | 'in_flight' | 'sunk' | 'out_of_bounds' | 'absorbed';

export interface BallState {
  position: Vector2D;
  velocity: Vector2D;
  radius: number;
  status: BallFlightStatus;
  trail: Vector2D[];
  flightTicks: number;
}

export type GameMode = 'solo' | 'pass-and-play' | 'multiplayer';

export interface GolfPlayer {
  id: string;
  name: string;
  avatar: string;
  seatIndex: number;
  isHost?: boolean;
}

export interface HoleScore {
  holeNumber: number;
  strokes: number; // number of gravity objects used
  par: number;
  status: 'completed' | 'skipped' | 'forfeited';
  scoreDifference: number; // strokes - par (e.g. -2 for eagle, 0 for par, +1 for bogey)
}

export interface PlayerScoreSummary {
  player: GolfPlayer;
  scores: Record<number, HoleScore>;
  totalStrokes: number;
  totalParDifference: number;
}
