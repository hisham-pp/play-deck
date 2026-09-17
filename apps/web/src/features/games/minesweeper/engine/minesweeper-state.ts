import type {
  BoardDimensions,
  MinesweeperCell,
  MinesweeperDifficulty,
  MinesweeperState,
} from '../types/minesweeper.types';
import { toRowCol } from './minesweeper-board';
import {
  clampDimensions,
  DEFAULT_DIFFICULTY,
  DIFFICULTY_CUSTOM,
  PRESET_CONFIGS,
  STATUS_IDLE,
} from './minesweeper-constants';

export function resolveDimensions(
  difficulty: MinesweeperDifficulty,
  customConfig?: BoardDimensions,
): BoardDimensions {
  if (difficulty === DIFFICULTY_CUSTOM && customConfig) {
    return clampDimensions(customConfig);
  }
  if (difficulty === DIFFICULTY_CUSTOM) {
    return PRESET_CONFIGS[DEFAULT_DIFFICULTY as keyof typeof PRESET_CONFIGS];
  }
  return PRESET_CONFIGS[difficulty as keyof typeof PRESET_CONFIGS];
}

export function createInitialMinesweeperState(
  difficulty: MinesweeperDifficulty = DEFAULT_DIFFICULTY,
  bestTimeMs: number | null = null,
  customConfig?: BoardDimensions,
): MinesweeperState {
  const { rows, cols, mines } = resolveDimensions(difficulty, customConfig);
  const total = rows * cols;
  const cells: MinesweeperCell[] = new Array(total);

  for (let i = 0; i < total; i++) {
    const { row, col } = toRowCol(i, cols);
    cells[i] = {
      id: i,
      row,
      col,
      isMine: false,
      isRevealed: false,
      isFlagged: false,
      adjacentMines: 0,
    };
  }

  return {
    rows,
    cols,
    mines,
    difficulty,
    status: STATUS_IDLE,
    cells,
    revealedCount: 0,
    flagCount: 0,
    elapsedMs: 0,
    startedAt: null,
    bestTimeMs,
    selectedCellIndex: 0,
    firstClick: true,
  };
}
