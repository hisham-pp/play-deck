export interface Vector2D {
  x: number;
  y: number;
}

export interface WallSegment {
  p1: Vector2D;
  p2: Vector2D;
  restitution?: number;
  color?: string;
}

export interface Bumper {
  x: number;
  y: number;
  radius: number;
  impulse: number;
  activeUntil?: number;
}

export interface Rotator {
  x: number;
  y: number;
  length: number;
  width: number;
  angle: number;
  speed: number; // radians per second
}

export interface RectZone {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CircleZone {
  x: number;
  y: number;
  radius: number;
}

export interface Portal {
  entry: Vector2D;
  exit: Vector2D;
  radius: number;
  color?: string;
}

export interface Booster {
  x: number;
  y: number;
  width: number;
  height: number;
  direction: Vector2D; // normalized
  force: number;
}

export interface HoleDefinition {
  id: number;
  name: string;
  par: number;
  tee: Vector2D;
  cup: { x: number; y: number; radius: number };
  walls: WallSegment[];
  sandTraps: (RectZone | CircleZone)[];
  waterHazards: (RectZone | CircleZone)[];
  bumpers: Bumper[];
  rotators: Rotator[];
  boosters: Booster[];
  portals: Portal[];
  decorativeTrees?: Vector2D[];
}

export interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  inHole: boolean;
  inWater: boolean;
  isResting: boolean;
  lastLie: Vector2D;
  trail: Vector2D[];
}

export interface Player {
  id: string;
  name: string;
  color: string;
  isAi?: boolean;
}

export type ScoreClassification =
  | 'ace' // Hole in 1
  | 'albatross' // -3
  | 'eagle' // -2
  | 'birdie' // -1
  | 'par' // 0
  | 'bogey' // +1
  | 'double-bogey' // +2
  | 'over' // +3 or more
  | 'limit'; // Picked up

export interface HoleScore {
  holeNumber: number;
  par: number;
  strokes: number;
  classification: ScoreClassification;
}

export interface PlayerScoreCard {
  player: Player;
  holeScores: HoleScore[];
  totalStrokes: number;
  totalParDiff: number;
  holesInOne: number;
}

export type GameMode = 'solo' | 'vs-ai' | 'pass-and-play';

export type GamePhase = 'aiming' | 'rolling' | 'hazard-reset' | 'hole-clear' | 'course-complete';

export interface ShotPreview {
  origin: Vector2D;
  angle: number;
  power: number; // 0 to 1
  previewPoints: Vector2D[];
}

export interface MiniGolfState {
  currentHoleIndex: number;
  holes: HoleDefinition[];
  players: Player[];
  activePlayerIndex: number;
  phase: GamePhase;
  mode: GameMode;
  ball: Ball;
  scorecards: Record<string, PlayerScoreCard>;
  currentStrokes: number;
  lastScoreClassification?: ScoreClassification;
  rotatorsState: Rotator[];
  isMuted: boolean;
}

export interface MiniGolfStats {
  gamesPlayed: number;
  roundsCompleted: number;
  bestRoundScore: number; // lowest total strokes for 9 holes
  totalStrokes: number;
  holesInOne: number;
  eagles: number;
  birdies: number;
  pars: number;
  lastPlayedAt: string;
}
