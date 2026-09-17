export type BallBounceStatus = 'idle' | 'countdown' | 'playing' | 'paused' | 'level-clear' | 'over';

export type PowerUpKind = 'wide' | 'multi' | 'slow' | 'life';

export interface PaddleState {
  /** Center x in world units. */
  x: number;
  y: number;
  width: number;
  height: number;
  /** Horizontal velocity, used for keyboard easing and a touch of spin. */
  vx: number;
}

export interface PlayerState {
  lives: number;
  paddle: PaddleState;
}

export interface TrailPoint {
  x: number;
  y: number;
}

export interface BallState {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  /** A stuck ball rides the paddle until it is served. */
  stuck: boolean;
  trail: TrailPoint[];
}

export interface BlockState {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  hp: number;
  maxHp: number;
  /** 0..1, decays after a hit for a brief flash. */
  flash: number;
}

export interface PowerUpItem {
  id: number;
  kind: PowerUpKind;
  x: number;
  y: number;
  vy: number;
}

export interface PowerUpsState {
  items: PowerUpItem[];
  wideTimer: number;
  slowTimer: number;
}

export interface LevelState {
  number: number;
  /** Ball speed at the start of this level, in world units per second. */
  baseSpeed: number;
  totalBlocks: number;
  /** Seconds left before the ball is served automatically. */
  serveTimer: number;
  /** Seconds left on the level-clear banner. */
  clearTimer: number;
}

export interface ScoreState {
  score: number;
  highScore: number;
  /** High score when this run began, used to detect a new record. */
  startingHighScore: number;
  combo: number;
  bestCombo: number;
  blocksBroken: number;
}

export interface WorldState {
  width: number;
  height: number;
}

export interface BallBounceState {
  status: BallBounceStatus;
  /** Status to return to when resuming from pause. */
  pausedFrom: BallBounceStatus | null;
  world: WorldState;
  /** Seconds left in the pre-play countdown. */
  countdown: number;
  player: PlayerState;
  balls: BallState[];
  blocks: BlockState[];
  powerUps: PowerUpsState;
  level: LevelState;
  score: ScoreState;
  nextId: number;
}

export interface BallBounceInput {
  left: boolean;
  right: boolean;
  /** Target paddle x in world units while dragging/pointing; null for keyboard control. */
  pointerX: number | null;
  /** One-shot request to serve a stuck ball. */
  launch: boolean;
}

export type BallBounceEvent =
  | { type: 'paddle'; x: number; y: number }
  | { type: 'wall'; x: number; y: number }
  | { type: 'block-hit'; x: number; y: number; hp: number }
  | { type: 'block-break'; x: number; y: number; maxHp: number; points: number; combo: number }
  | { type: 'power-up'; x: number; y: number; kind: PowerUpKind }
  | { type: 'ball-lost'; x: number }
  | { type: 'life-lost'; livesLeft: number }
  | { type: 'level-clear'; level: number }
  | { type: 'level-start'; level: number }
  | { type: 'launch' }
  | { type: 'game-over'; score: number };

/** Lightweight snapshot pushed to React for the HUD and overlays. */
export interface BallBounceHud {
  status: BallBounceStatus;
  countdown: number;
  score: number;
  highScore: number;
  level: number;
  lives: number;
  combo: number;
  multiplier: number;
  bestCombo: number;
  blocksBroken: number;
  wideActive: boolean;
  slowActive: boolean;
  isNewHighScore: boolean;
}

export interface BallBounceStats {
  gamesPlayed: number;
  highScore: number;
  highestLevel: number;
  bestCombo: number;
  totalBlocks: number;
  lastPlayedAt: string;
}
