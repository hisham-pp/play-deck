export type ConnectFourDisc = 'R' | 'Y';

export type ConnectFourCell = ConnectFourDisc | null;

export type GameStatus = 'idle' | 'playing' | 'won' | 'draw';

export type GameMode = 'local-2p' | 'single' | 'multiplayer';

export type AIDifficulty = 'easy' | 'medium' | 'hard';

export type WinDirection = 'horizontal' | 'vertical' | 'diagonal-asc' | 'diagonal-desc';

export interface ConnectFourWinResult {
  winner: ConnectFourDisc;
  direction: WinDirection;
  winningCells: number[]; // Flat indices of the 4 winning cells
}

export interface ConnectFourMove {
  column: number;
  row: number;
  player: ConnectFourDisc;
  timestamp: number;
}

export interface ConnectFourScores {
  R: number;
  Y: number;
  ties: number;
}

export interface ConnectFourState {
  board: ConnectFourCell[]; // 42 elements (6 rows x 7 cols, row 0 top, row 5 bottom)
  turn: ConnectFourDisc;
  startingPlayer: ConnectFourDisc;
  status: GameStatus;
  winner: ConnectFourDisc | null;
  winningCells: number[] | null;
  mode: GameMode;
  aiDifficulty: AIDifficulty;
  humanPlayerDisc: ConnectFourDisc;
  scores: ConnectFourScores;
  round: number;
  moveHistory: ConnectFourMove[];
  lastMove: { column: number; row: number } | null;
  isAiThinking: boolean;
}

export type ConnectFourAction =
  | { type: 'DROP_PIECE'; column: number; player?: ConnectFourDisc }
  | { type: 'SET_MODE'; mode: GameMode }
  | { type: 'SET_DIFFICULTY'; difficulty: AIDifficulty }
  | { type: 'SET_HUMAN_DISC'; disc: ConnectFourDisc }
  | { type: 'RESET_ROUND' }
  | { type: 'RESET_MATCH' }
  | { type: 'SET_AI_THINKING'; thinking: boolean };

export interface ConnectFourStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  vsAiEasyWins: number;
  vsAiMediumWins: number;
  vsAiHardWins: number;
  currentStreak: number;
  bestStreak: number;
  lastPlayedAt: string;
}
