export type PongMode = 'single-player' | 'local-2p';

export type PongDifficulty = 'easy' | 'medium' | 'hard';

export type PongGameStatus = 'ready' | 'playing' | 'paused' | 'game-over';

export type PongSide = 'left' | 'right';

export interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
  vy: number;
  score: number;
}

export interface Ball {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  speed: number;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface TrailPoint {
  x: number;
  y: number;
  alpha: number;
}

export interface PongConfig {
  mode: PongMode;
  difficulty: PongDifficulty;
  winningScore: number;
  paddleSpeed: number;
  soundEnabled: boolean;
}

export interface PaddleInput {
  up: boolean;
  down: boolean;
  targetY?: number | null;
}

export interface PongInputs {
  player1: PaddleInput;
  player2: PaddleInput;
}

export type PongEventType =
  'paddle-hit' | 'wall-hit' | 'point-scored' | 'game-won' | 'serve-launched';

export interface PongEvent {
  type: PongEventType;
  side?: PongSide;
  scorer?: PongSide;
  winner?: PongSide;
  ballSpeed?: number;
  rally?: number;
}

export interface PongState {
  status: PongGameStatus;
  player1: Paddle;
  player2: Paddle;
  ball: Ball;
  servePending: boolean;
  serverSide: PongSide;
  serveCountdown: number; // in seconds
  rally: number;
  highestRallyInGame: number;
  winner: PongSide | null;
  config: PongConfig;
}

export interface PongStats {
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  highestRally: number;
  totalPointsScored: number;
  vsAiWins: Record<PongDifficulty, number>;
  lastPlayedAt: string;
}
