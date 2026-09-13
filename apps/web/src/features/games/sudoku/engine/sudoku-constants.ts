import type { SudokuDifficulty } from '../types/sudoku.types';

export const BOX_SIZE = 3;
export const GRID_SIZE = BOX_SIZE * BOX_SIZE;
export const CELL_COUNT = GRID_SIZE * GRID_SIZE;
export const EMPTY_CELL = 0;

export const DIGITS: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export const STATUS_IDLE = 'idle' as const;
export const STATUS_PLAYING = 'playing' as const;
export const STATUS_PAUSED = 'paused' as const;
export const STATUS_COMPLETED = 'completed' as const;
export const STATUS_FAILED = 'failed' as const;

export interface DifficultyConfig {
  id: SudokuDifficulty;
  label: string;
  blurb: string;
  /** Clues left on the board. Lower means harder. */
  targetClues: number;
  maxMistakes: number;
  hints: number;
  /** Rotationally symmetric digging produces the classic newspaper look. */
  symmetric: boolean;
  accent: string;
}

/** Ordered easiest to hardest — the UI renders the ladder in this order. */
export const DIFFICULTY_ORDER: SudokuDifficulty[] = [
  'starter',
  'easy',
  'medium',
  'hard',
  'expert',
  'master',
  'insane',
];

export const DEFAULT_DIFFICULTY: SudokuDifficulty = 'medium';

export const DIFFICULTY_CONFIG: Record<SudokuDifficulty, DifficultyConfig> = {
  starter: {
    id: 'starter',
    label: 'Starter',
    blurb: 'Learning the grid. Plenty of clues and a generous mistake budget.',
    targetClues: 50,
    maxMistakes: 6,
    hints: 5,
    symmetric: true,
    accent: 'emerald',
  },
  easy: {
    id: 'easy',
    label: 'Easy',
    blurb: 'A relaxed solve. Singles carry you most of the way.',
    targetClues: 44,
    maxMistakes: 5,
    hints: 4,
    symmetric: true,
    accent: 'teal',
  },
  medium: {
    id: 'medium',
    label: 'Medium',
    blurb: 'The daily driver. Some scanning, some pencil marks.',
    targetClues: 36,
    maxMistakes: 4,
    hints: 3,
    symmetric: true,
    accent: 'sky',
  },
  hard: {
    id: 'hard',
    label: 'Hard',
    blurb: 'Candidates matter now. Expect a few dead ends.',
    targetClues: 31,
    maxMistakes: 3,
    hints: 2,
    symmetric: true,
    accent: 'amber',
  },
  expert: {
    id: 'expert',
    label: 'Expert',
    blurb: 'Sparse clues, long chains, no room to drift.',
    targetClues: 28,
    maxMistakes: 3,
    hints: 1,
    symmetric: true,
    accent: 'orange',
  },
  master: {
    id: 'master',
    label: 'Master',
    blurb: 'Minimal scaffolding. Every placement has to be earned.',
    targetClues: 25,
    maxMistakes: 2,
    hints: 1,
    symmetric: false,
    accent: 'rose',
  },
  insane: {
    id: 'insane',
    label: 'Insane',
    blurb: 'Near-minimal grid, one life, zero hints. Good luck.',
    targetClues: 23,
    maxMistakes: 1,
    hints: 0,
    symmetric: false,
    accent: 'fuchsia',
  },
};

export function getDifficultyConfig(difficulty: SudokuDifficulty): DifficultyConfig {
  return DIFFICULTY_CONFIG[difficulty] ?? DIFFICULTY_CONFIG[DEFAULT_DIFFICULTY];
}

export function isSudokuDifficulty(value: unknown): value is SudokuDifficulty {
  return typeof value === 'string' && value in DIFFICULTY_CONFIG;
}
