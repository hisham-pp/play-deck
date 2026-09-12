export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

export type RotationState = 0 | 1 | 2 | 3;

export type TetrisCell = TetrominoType | null;

export type TetrisBoard = TetrisCell[][];

export interface GridCoordinate {
  row: number;
  col: number;
}

export interface ActivePiece {
  type: TetrominoType;
  rotation: RotationState;
  row: number;
  col: number;
}

export type TetrisGameStatus = 'idle' | 'countdown' | 'playing' | 'paused' | 'game-over';

export interface TetrisState {
  status: TetrisGameStatus;
  board: TetrisBoard;
  active: ActivePiece | null;
  holdType: TetrominoType | null;
  canHold: boolean;
  queue: TetrominoType[];
  bag: TetrominoType[];
  score: number;
  highScore: number;
  isNewHighScore: boolean;
  level: number;
  linesCleared: number;
  gravityMs: number;
  lockDelayMs: number;
  lockResets: number;
  countdown: number;
  lastClearedLines: number[];
  lastClearWasTetris: boolean;
}

export type TetrisAction =
  | { type: 'START' }
  | { type: 'COUNTDOWN_TICK' }
  | { type: 'TICK' }
  | { type: 'MOVE_LEFT' }
  | { type: 'MOVE_RIGHT' }
  | { type: 'SOFT_DROP' }
  | { type: 'HARD_DROP' }
  | { type: 'ROTATE_CW' }
  | { type: 'ROTATE_CCW' }
  | { type: 'HOLD' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'RESTART' }
  | { type: 'SET_HIGH_SCORE'; highScore: number };

export interface TetrisStats {
  highScore: number;
  gamesPlayed: number;
  totalLinesCleared: number;
  lastPlayedAt: string;
}

export type TetrisSfxEvent =
  | 'move'
  | 'rotate'
  | 'soft-drop'
  | 'hard-drop'
  | 'lock'
  | 'hold'
  | 'clear-single'
  | 'clear-double'
  | 'clear-triple'
  | 'clear-tetris'
  | 'level-up'
  | 'pause'
  | 'game-over'
  | 'start';
