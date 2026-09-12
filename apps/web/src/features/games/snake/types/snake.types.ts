export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface Coordinate {
  x: number;
  y: number;
}

export type SnakeGameStatus = 'idle' | 'countdown' | 'playing' | 'paused' | 'game-over';

export interface SnakeState {
  status: SnakeGameStatus;
  snake: Coordinate[];
  direction: Direction;
  pendingDirections: Direction[];
  food: Coordinate;
  score: number;
  highScore: number;
  speedMs: number;
  countdown: number;
  isNewHighScore: boolean;
  gridSize: number;
}

export type SnakeAction =
  | { type: 'START' }
  | { type: 'COUNTDOWN_TICK' }
  | { type: 'TICK' }
  | { type: 'CHANGE_DIRECTION'; direction: Direction }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'RESTART' }
  | { type: 'SET_HIGH_SCORE'; highScore: number };

export interface SnakeStats {
  highScore: number;
  gamesPlayed: number;
  totalFoodEaten: number;
  lastPlayedAt: string;
}
