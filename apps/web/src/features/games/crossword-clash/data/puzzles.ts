import type { CrosswordPuzzleDefinition } from '../types/crossword-clash.types';
import { EASY_CROSSWORD_PUZZLES } from './easy-puzzles';
import { HARD_CROSSWORD_PUZZLES } from './hard-puzzles';
import { MEDIUM_CROSSWORD_PUZZLES } from './medium-puzzles';

export { EASY_CROSSWORD_PUZZLES } from './easy-puzzles';
export { MEDIUM_CROSSWORD_PUZZLES } from './medium-puzzles';
export { HARD_CROSSWORD_PUZZLES } from './hard-puzzles';

export const CROSSWORD_PUZZLES: CrosswordPuzzleDefinition[] = [
  ...EASY_CROSSWORD_PUZZLES,
  ...MEDIUM_CROSSWORD_PUZZLES,
  ...HARD_CROSSWORD_PUZZLES,
];
