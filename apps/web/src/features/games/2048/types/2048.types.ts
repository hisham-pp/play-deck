export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface TileItem {
  id: string;
  value: number;
  row: number;
  col: number;
  isNew?: boolean;
  isMerged?: boolean;
}

export type GridState = number[][];

export type Game2048Status = 'playing' | 'won' | 'over';

export interface UndoStep {
  grid: GridState;
  tiles: TileItem[];
  score: number;
  highestTile: number;
}

export interface Game2048State {
  grid: GridState;
  tiles: TileItem[];
  score: number;
  bestScore: number;
  status: Game2048Status;
  hasWon: boolean;
  isKeepGoing: boolean;
  moveCount: number;
  highestTile: number;
  undoStack: UndoStep[];
  lastScoreGain: number;
}

export interface Game2048Stats {
  gamesPlayed: number;
  gamesWon: number;
  bestScore: number;
  highestTile: number;
  totalMoves: number;
  lastPlayedAt: string;
}

export type Game2048Action =
  | { type: 'MOVE'; direction: Direction }
  | { type: 'RESTART' }
  | { type: 'UNDO' }
  | { type: 'CONTINUE' }
  | { type: 'SET_BEST_SCORE'; bestScore: number };
