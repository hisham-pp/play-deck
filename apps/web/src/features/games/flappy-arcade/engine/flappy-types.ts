export type GameStatus = 'idle' | 'playing' | 'paused' | 'game-over';

export interface BirdState {
  x: number;
  y: number;
  vy: number;
  rotation: number; // in radians
  radius: number; // collision circle radius
  flapCooldown: number; // seconds remaining before next flap
}

export interface ObstaclePipe {
  id: number;
  x: number;
  width: number;
  topHeight: number;
  bottomY: number; // canvas height - bottomHeight
  gap: number;
  passed: boolean;
  pulsePhase: number;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

export interface DifficultyConfig {
  speed: number; // pixels per second
  gapSize: number; // height of gap in pixels
  spawnDistance: number; // horizontal distance between pipe spawns
  scoreMultiplier: number;
}

export interface FlappyEngineConfig {
  worldWidth: number;
  worldHeight: number;
  groundHeight: number;
  ceilingHeight: number;
  gravity: number; // px/s^2
  flapImpulse: number; // px/s upward
  maxFallSpeed: number;
  pipeWidth: number;
  baseSpeed: number;
  maxSpeed: number;
  baseGap: number;
  minGap: number;
}

export interface FlappyGameState {
  status: GameStatus;
  score: number;
  highScore: number;
  bird: BirdState;
  pipes: ObstaclePipe[];
  particles: Particle[];
  difficulty: DifficultyConfig;
  screenShake: number; // screen shake intensity in pixels
  timeAlive: number; // elapsed seconds
  lastPipeId: number;
  distanceTraveled: number;
}

export interface FlappyInput {
  flap: boolean;
}

export interface FlappyStats {
  bestScore: number;
  gamesPlayed: number;
  totalScore: number;
  pipesCleared: number;
  lastPlayedAt: string;
}
