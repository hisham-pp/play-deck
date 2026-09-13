export type SudokuDifficulty =
  'starter' | 'easy' | 'medium' | 'hard' | 'expert' | 'master' | 'insane';

export type SudokuStatus = 'idle' | 'playing' | 'paused' | 'completed' | 'failed';

/** A single board cell. `value` of 0 means empty; candidates are sorted ascending. */
export interface SudokuCellState {
  value: number;
  given: boolean;
  candidates: number[];
}

export interface SudokuPuzzle {
  difficulty: SudokuDifficulty;
  givens: number[];
  solution: number[];
  clueCount: number;
}

/** Undo entry: the cell snapshot taken before a mutation. */
export interface SudokuMove {
  index: number;
  previous: SudokuCellState;
}

export type SudokuEventType =
  'placed' | 'mistake' | 'cleared' | 'note' | 'hint' | 'undo' | 'locked' | 'completed' | 'failed';

export interface SudokuEvent {
  id: number;
  type: SudokuEventType;
  index: number;
  digit: number;
}

export interface SudokuState {
  status: SudokuStatus;
  difficulty: SudokuDifficulty;
  puzzle: SudokuPuzzle;
  cells: SudokuCellState[];
  selectedIndex: number;
  noteMode: boolean;
  /** Indices that duplicate a digit within their row, column or box. */
  conflicts: number[];
  /** Indices holding a digit that contradicts the unique solution. */
  errors: number[];
  mistakes: number;
  maxMistakes: number;
  hintsRemaining: number;
  elapsedMs: number;
  bestTimeMs: number | null;
  isNewBestTime: boolean;
  history: SudokuMove[];
  lastEvent: SudokuEvent | null;
}

export type SudokuAction =
  | { type: 'NEW_PUZZLE'; difficulty?: SudokuDifficulty }
  | { type: 'RESET' }
  | { type: 'SELECT_CELL'; index: number }
  | { type: 'MOVE_SELECTION'; rowDelta: number; colDelta: number }
  | { type: 'SET_DIGIT'; digit: number }
  | { type: 'TOGGLE_CANDIDATE'; digit: number }
  | { type: 'CLEAR_CELL' }
  | { type: 'TOGGLE_NOTE_MODE' }
  | { type: 'AUTO_FILL_CANDIDATES' }
  | { type: 'UNDO' }
  | { type: 'HINT' }
  | { type: 'TICK'; deltaMs: number }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'SET_BEST_TIME'; bestTimeMs: number | null };

export interface SudokuStats {
  bestTimes: Partial<Record<SudokuDifficulty, number>>;
  gamesPlayed: number;
  gamesCompleted: number;
  totalTimeMs: number;
  lastDifficulty: SudokuDifficulty | null;
  lastPlayedAt: string;
}
