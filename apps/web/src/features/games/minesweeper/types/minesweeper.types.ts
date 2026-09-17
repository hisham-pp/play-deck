export type MinesweeperDifficulty = 'beginner' | 'intermediate' | 'expert' | 'custom';

export type MinesweeperGameStatus = 'idle' | 'playing' | 'won' | 'lost';

export interface BoardDimensions {
  rows: number;
  cols: number;
  mines: number;
}

export interface CellPosition {
  row: number;
  col: number;
}

export interface MinesweeperCell {
  id: number;
  row: number;
  col: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  adjacentMines: number;
  isTriggeredMine?: boolean;
  isFalseFlag?: boolean;
}

export interface MinesweeperState {
  rows: number;
  cols: number;
  mines: number;
  difficulty: MinesweeperDifficulty;
  status: MinesweeperGameStatus;
  cells: MinesweeperCell[];
  revealedCount: number;
  flagCount: number;
  elapsedMs: number;
  startedAt: number | null;
  bestTimeMs: number | null;
  selectedCellIndex: number;
  firstClick: boolean;
}

export type MinesweeperAction =
  | { type: 'REVEAL_CELL'; index: number }
  | { type: 'TOGGLE_FLAG'; index: number }
  | { type: 'CHORD_CELL'; index: number }
  | { type: 'SELECT_CELL'; index: number }
  | { type: 'MOVE_SELECTION'; rowDelta: number; colDelta: number }
  | { type: 'TICK'; deltaMs: number }
  | { type: 'NEW_GAME'; difficulty?: MinesweeperDifficulty; customConfig?: BoardDimensions }
  | { type: 'RESET_GAME' }
  | { type: 'SET_BEST_TIME'; bestTimeMs: number | null };

export interface MinesweeperDifficultyStats {
  played: number;
  won: number;
  bestTimeMs: number | null;
  currentStreak: number;
  bestStreak: number;
}

export interface MinesweeperStats {
  gamesPlayed: number;
  gamesWon: number;
  totalTimeMs: number;
  byDifficulty: Record<MinesweeperDifficulty, MinesweeperDifficultyStats>;
  lastDifficulty: MinesweeperDifficulty;
  lastPlayedAt: string;
}

export interface MinesweeperRunResult {
  isNewBestTime: boolean;
  stats: MinesweeperStats;
}
