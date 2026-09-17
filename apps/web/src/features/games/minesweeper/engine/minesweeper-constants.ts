import type { BoardDimensions, MinesweeperDifficulty } from '../types/minesweeper.types';

export const DIFFICULTY_BEGINNER: MinesweeperDifficulty = 'beginner';
export const DIFFICULTY_INTERMEDIATE: MinesweeperDifficulty = 'intermediate';
export const DIFFICULTY_EXPERT: MinesweeperDifficulty = 'expert';
export const DIFFICULTY_CUSTOM: MinesweeperDifficulty = 'custom';

export const STATUS_IDLE = 'idle';
export const STATUS_PLAYING = 'playing';
export const STATUS_WON = 'won';
export const STATUS_LOST = 'lost';

export const PRESET_CONFIGS: Record<Exclude<MinesweeperDifficulty, 'custom'>, BoardDimensions> = {
  [DIFFICULTY_BEGINNER]: {
    rows: 9,
    cols: 9,
    mines: 10,
  },
  [DIFFICULTY_INTERMEDIATE]: {
    rows: 16,
    cols: 16,
    mines: 40,
  },
  [DIFFICULTY_EXPERT]: {
    rows: 16,
    cols: 30,
    mines: 99,
  },
};

export const MIN_ROWS = 2;
export const MAX_ROWS = 30;
export const MIN_COLS = 2;
export const MAX_COLS = 30;
export const MIN_MINES = 1;

export const DEFAULT_DIFFICULTY: MinesweeperDifficulty = DIFFICULTY_BEGINNER;

export function clampDimensions(dims: BoardDimensions): BoardDimensions {
  const rows = Math.max(MIN_ROWS, Math.min(MAX_ROWS, Math.round(dims.rows)));
  const cols = Math.max(MIN_COLS, Math.min(MAX_COLS, Math.round(dims.cols)));
  const maxMines = Math.max(1, rows * cols - 9);
  const mines = Math.max(MIN_MINES, Math.min(maxMines, Math.round(dims.mines)));
  return { rows, cols, mines };
}
