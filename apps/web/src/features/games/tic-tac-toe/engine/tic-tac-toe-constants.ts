import type {
  AIDifficulty,
  GameMode,
  PlayerMark,
  TicTacToeGameStatus,
  WinningLine,
} from '../types/tic-tac-toe.types';

export const BOARD_SIZE = 9;
export const GRID_DIMENSION = 3;

export const MARK_X: PlayerMark = 'X';
export const MARK_O: PlayerMark = 'O';

export const STATUS_IDLE: TicTacToeGameStatus = 'idle';
export const STATUS_PLAYING: TicTacToeGameStatus = 'playing';
export const STATUS_WON: TicTacToeGameStatus = 'won';
export const STATUS_DRAW: TicTacToeGameStatus = 'draw';

export const MODE_SINGLE: GameMode = 'single';
export const MODE_LOCAL_2P: GameMode = 'local2p';
export const MODE_MULTIPLAYER: GameMode = 'multiplayer';

export const DIFFICULTY_EASY: AIDifficulty = 'easy';
export const DIFFICULTY_MEDIUM: AIDifficulty = 'medium';
export const DIFFICULTY_HARD: AIDifficulty = 'hard';

export const WINNING_COMBINATIONS: WinningLine[] = [
  // Rows
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  // Columns
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  // Diagonals
  [0, 4, 8],
  [2, 4, 6],
];

export const CORNER_INDICES = [0, 2, 6, 8] as const;
export const CENTER_INDEX = 4;
export const EDGE_INDICES = [1, 3, 5, 7] as const;

export const DEFAULT_AI_THINKING_MS = 300;
