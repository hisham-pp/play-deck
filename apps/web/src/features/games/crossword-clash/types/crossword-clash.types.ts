export type CrosswordTheme = 'science' | 'geography' | 'general' | 'sports' | 'pop-culture';
export type CrosswordDifficulty = 'easy' | 'medium' | 'hard';
export type CrosswordDirection = 'across' | 'down';
export type CrosswordMode = 'solo' | 'race' | 'turn-based' | 'team';
export type CrosswordStatus = 'lobby' | 'countdown' | 'playing' | 'completed';

export const DIR_ACROSS: CrosswordDirection = 'across';
export const DIR_DOWN: CrosswordDirection = 'down';

export const THEME_SCIENCE: CrosswordTheme = 'science';
export const THEME_GEOGRAPHY: CrosswordTheme = 'geography';
export const THEME_GENERAL: CrosswordTheme = 'general';
export const THEME_SPORTS: CrosswordTheme = 'sports';
export const THEME_POP_CULTURE: CrosswordTheme = 'pop-culture';

export const DIFF_EASY: CrosswordDifficulty = 'easy';
export const DIFF_MEDIUM: CrosswordDifficulty = 'medium';
export const DIFF_HARD: CrosswordDifficulty = 'hard';

export const WORD_IRON = 'IRON';
export const WORD_TEN = 'TEN';
export const WORD_HASH = 'HASH';
export const WORD_QUANTUM = 'QUANTUM';
export const WORD_ACTRESS = 'ACTRESS';
export const WORD_THEATRE = 'THEATRE';
export const WORD_MYSTERY = 'MYSTERY';
export const WORD_ATOMICS = 'ATOMICS';
export const WORD_TRIBUTE = 'TRIBUTE';
export const WORD_MASTERS = 'MASTERS';

export interface RawCrosswordClue {
  id: string;
  number: number;
  direction: CrosswordDirection;
  row: number;
  col: number;
  answer: string;
  text: string;
}

export interface CrosswordPuzzleDefinition {
  id: string;
  title: string;
  theme: CrosswordTheme;
  difficulty: CrosswordDifficulty;
  rows: number;
  cols: number;
  clues: RawCrosswordClue[];
}

export function createClue(
  id: string,
  num: number,
  dir: CrosswordDirection,
  r: number,
  c: number,
  ans: string,
  text: string,
): RawCrosswordClue {
  return { id, number: num, direction: dir, row: r, col: c, answer: ans, text };
}
