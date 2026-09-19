import type {
  HangmanCategory,
  HangmanDifficulty,
  HangmanMode,
  HangmanRules,
  HangmanStatus,
} from '../types/hangman-duel.types';

export const STATUS_SETUP: HangmanStatus = 'setup';
export const STATUS_WORD_SELECT: HangmanStatus = 'word-select';
export const STATUS_COUNTDOWN: HangmanStatus = 'countdown';
export const STATUS_GUESSING: HangmanStatus = 'guessing';
export const STATUS_PAUSED: HangmanStatus = 'paused';
export const STATUS_ROUND_OVER: HangmanStatus = 'round-over';
export const STATUS_FINISHED: HangmanStatus = 'finished';

export const MODE_CLASSIC: HangmanMode = 'classic';
export const MODE_SPEED: HangmanMode = 'speed';
export const MODE_BATTLE: HangmanMode = 'battle';
export const MODE_SOLO: HangmanMode = 'solo';

export const DIFFICULTY_EASY: HangmanDifficulty = 'easy';
export const DIFFICULTY_MEDIUM: HangmanDifficulty = 'medium';
export const DIFFICULTY_HARD: HangmanDifficulty = 'hard';

/** Classic, speed and solo all guess against this one board. */
export const SHARED_BOARD_ID = 'shared';

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 6;

export const MIN_WORD_LENGTH = 3;
export const MAX_WORD_LENGTH = 18;

export const DEFAULT_ALLOWED_MISSES = 6;
export const MIN_ALLOWED_MISSES = 4;
export const MAX_ALLOWED_MISSES = 8;

export const DEFAULT_TOTAL_ROUNDS = 4;
export const MIN_TOTAL_ROUNDS = 1;
export const MAX_TOTAL_ROUNDS = 12;

export const DEFAULT_TURN_SECONDS = 12;
export const MIN_TURN_SECONDS = 5;
export const MAX_TURN_SECONDS = 30;

export const COUNTDOWN_SECONDS = 3;

/** Points a guesser earns for a letter that appears in the word. */
export const POINTS_PER_CORRECT_LETTER = 3;
/** Each repeat of that letter beyond the first is worth this much again. */
export const POINTS_PER_EXTRA_OCCURRENCE = 1;
export const PENALTY_WRONG_LETTER = 1;
export const PENALTY_WRONG_SOLVE = 2;
export const POINTS_FOR_SOLVE = 15;
/** Every miss still unused when the word falls is worth this to the solver. */
export const POINTS_PER_SPARE_MISS = 2;
/** Answering inside this fraction of the speed clock earns the bonus. */
export const SPEED_BONUS_THRESHOLD = 0.4;
export const SPEED_BONUS_POINTS = 1;
/** The setter's reward for a word that survives the round. */
export const SETTER_DEFENCE_POINTS = 10;
export const SETTER_POINTS_PER_HIDDEN_LETTER = 2;

export const ALPHABET = 'abcdefghijklmnopqrstuvwxyz';
/** Letters that make a word meaningfully harder to crack. */
export const RARE_LETTERS = 'jkqvxzw';

export const MODE_LABELS: Record<HangmanMode, string> = {
  classic: 'Classic',
  speed: 'Speed',
  battle: 'Battle',
  solo: 'Solo',
};

export const MODE_DESCRIPTIONS: Record<HangmanMode, string> = {
  classic: 'One setter, everyone else guesses in turn against a shared board.',
  speed: 'Classic with a clock. Let it run out and the guess counts as a miss.',
  battle: 'Same word, a board each. Misses only cost the guesser who made them.',
  solo: 'One player against a random word from the bank. No setter.',
};

export const CATEGORY_LABELS: Record<HangmanCategory, string> = {
  animals: 'Animals',
  movies: 'Movies',
  food: 'Food',
  places: 'Places',
  professions: 'Professions',
  objects: 'Objects',
};

export const DIFFICULTY_LABELS: Record<HangmanDifficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

export const DIFFICULTY_DESCRIPTIONS: Record<HangmanDifficulty, string> = {
  easy: 'Short, common words with friendly letters.',
  medium: 'Longer words and the odd awkward letter.',
  hard: 'Long words packed with rare letters.',
};

export const REJECTION_MESSAGES: Record<string, string> = {
  'not-a-letter': 'Guess a single letter from A to Z.',
  'already-guessed': 'That letter has already been called.',
  'too-short': `Secret words need at least ${MIN_WORD_LENGTH} letters.`,
  'too-long': `Secret words can be at most ${MAX_WORD_LENGTH} letters.`,
  'letters-only': 'Letters only — no spaces, digits or punctuation.',
  'wrong-length': 'That solve has to be the same length as the word.',
  'not-your-turn': 'Wait for your turn.',
};

export const DEFAULT_RULES: HangmanRules = {
  mode: MODE_CLASSIC,
  category: null,
  difficulty: null,
  allowedMisses: DEFAULT_ALLOWED_MISSES,
  totalRounds: DEFAULT_TOTAL_ROUNDS,
  turnSeconds: DEFAULT_TURN_SECONDS,
  showCategory: true,
  revealFirstLetter: false,
};
