import type {
  WordChainCategory,
  WordChainMode,
  WordChainRules,
  WordChainStatus,
  WordChainVariant,
} from '../types/word-chain.types';

export const STATUS_SETUP: WordChainStatus = 'setup';
export const STATUS_COUNTDOWN: WordChainStatus = 'countdown';
export const STATUS_PLAYING: WordChainStatus = 'playing';
export const STATUS_PAUSED: WordChainStatus = 'paused';
export const STATUS_FINISHED: WordChainStatus = 'finished';

export const MODE_CLASSIC: WordChainMode = 'classic';
export const MODE_POINTS: WordChainMode = 'points';
export const MODE_TEAM: WordChainMode = 'team';
export const MODE_SOLO: WordChainMode = 'solo';

export const VARIANT_LAST_LETTER: WordChainVariant = 'last-letter';
export const VARIANT_LAST_TWO_LETTERS: WordChainVariant = 'last-two-letters';
export const VARIANT_CATEGORY_LOCK: WordChainVariant = 'category-lock';
export const VARIANT_ESCALATING_TIMER: WordChainVariant = 'escalating-timer';
export const VARIANT_LENGTH_REQUIREMENT: WordChainVariant = 'length-requirement';

export const TEAM_A = 'a';
export const TEAM_B = 'b';

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 8;
export const MIN_WORD_LENGTH = 3;

export const DEFAULT_LIVES = 3;
export const MIN_LIVES = 1;
export const MAX_LIVES = 5;

export const DEFAULT_TURN_SECONDS = 15;
export const MIN_TURN_SECONDS = 5;
export const MAX_TURN_SECONDS = 30;

/** The escalating variant shaves this much off the clock every full lap. */
export const ESCALATION_STEP_SECONDS = 1;
export const ESCALATION_FLOOR_SECONDS = 4;

export const DEFAULT_TOTAL_ROUNDS = 5;
export const COUNTDOWN_SECONDS = 3;

/** Answering inside this fraction of the clock earns the speed bonus. */
export const SPEED_BONUS_THRESHOLD = 0.4;
export const SPEED_BONUS_POINTS = 3;
/** Every letter beyond the minimum length is worth this much. */
export const POINTS_PER_EXTRA_LETTER = 2;
export const BASE_WORD_POINTS = 5;
export const SURVIVAL_POINTS = 10;

/** The length variant raises the floor by one letter every lap, up to this cap. */
export const LENGTH_REQUIREMENT_CAP = 8;

export const CATEGORY_LABELS: Record<WordChainCategory, string> = {
  animals: 'Animals',
  food: 'Food & Drink',
  places: 'Places',
  objects: 'Objects',
};

export const VARIANT_LABELS: Record<WordChainVariant, string> = {
  'last-letter': 'Last Letter',
  'last-two-letters': 'Last Two Letters',
  'category-lock': 'Category Lock',
  'escalating-timer': 'Escalating Timer',
  'length-requirement': 'Growing Words',
};

export const VARIANT_DESCRIPTIONS: Record<WordChainVariant, string> = {
  'last-letter': 'Each word starts with the final letter of the word before it.',
  'last-two-letters': 'Each word starts with the final two letters of the word before it.',
  'category-lock': 'Every word must also belong to the chosen category.',
  'escalating-timer': 'The clock gets one second shorter after every full lap.',
  'length-requirement': 'The minimum word length grows by one letter every lap.',
};

export const MODE_LABELS: Record<WordChainMode, string> = {
  classic: 'Classic',
  points: 'Points',
  team: 'Team',
  solo: 'Solo',
};

export const MODE_DESCRIPTIONS: Record<WordChainMode, string> = {
  classic: 'Lose a life when the clock runs out. Last player standing wins.',
  points: 'A fixed number of rounds. The highest score at the end wins.',
  team: 'Two teams alternate. A team is out when all of its players are.',
  solo: 'One player against the clock. See how long a chain you can build.',
};

export const DEFAULT_RULES: WordChainRules = {
  mode: MODE_CLASSIC,
  variant: VARIANT_LAST_LETTER,
  category: null,
  lives: DEFAULT_LIVES,
  startingSeconds: DEFAULT_TURN_SECONDS,
  totalRounds: DEFAULT_TOTAL_ROUNDS,
  minWordLength: MIN_WORD_LENGTH,
};

export const REJECTION_MESSAGES: Record<string, string> = {
  'too-short': 'Too short — words need at least {min} letters.',
  'too-short-for-round': 'This lap needs words of at least {min} letters.',
  'wrong-start': 'That word has to start with "{prefix}".',
  repeated: 'That word is already in the chain.',
  'not-a-word': 'That is not in the dictionary.',
  'wrong-category': 'That word is not in the {category} category.',
};
