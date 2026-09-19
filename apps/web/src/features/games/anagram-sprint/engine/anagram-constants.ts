import type {
  AnagramCategory,
  AnagramDifficulty,
  AnagramMode,
  AnagramRules,
  AnagramTeam,
} from '../types/anagram-sprint.types';

export const GAME_ID = 'anagram-sprint';
export const GAME_NAME = 'Anagram Sprint';
export const CHANNEL_NAMESPACE = 'anagram-sprint';
export const DEFAULT_AVATAR = '🔤';

export const MODE_SOLO: AnagramMode = 'solo';
export const MODE_CLASSIC: AnagramMode = 'classic';
export const MODE_SURVIVAL: AnagramMode = 'survival';
export const MODE_BLITZ: AnagramMode = 'blitz';
export const MODE_TEAM: AnagramMode = 'team';

export const STATUS_SETUP = 'setup';
export const STATUS_COUNTDOWN = 'countdown';
export const STATUS_PLAYING = 'playing';
export const STATUS_ROUND_SUMMARY = 'round-summary';
export const STATUS_FINISHED = 'finished';

export const TEAM_A: AnagramTeam = 'a';
export const TEAM_B: AnagramTeam = 'b';

export const TEAM_LABELS: Record<AnagramTeam, string> = {
  [TEAM_A]: 'Team Amber',
  [TEAM_B]: 'Team Cobalt',
};

export const DIFFICULTY_EASY: AnagramDifficulty = 'easy';
export const DIFFICULTY_MEDIUM: AnagramDifficulty = 'medium';
export const DIFFICULTY_HARD: AnagramDifficulty = 'hard';

export const MIN_SEATS = 2;
export const MAX_SEATS = 8;

/** Seconds on the clock at each difficulty, before the mode's adjustment. */
export const SECONDS_BY_DIFFICULTY: Record<AnagramDifficulty, number> = {
  [DIFFICULTY_EASY]: 30,
  [DIFFICULTY_MEDIUM]: 38,
  [DIFFICULTY_HARD]: 48,
};

/** Blitz runs the same words on a short fuse. */
export const BLITZ_SECONDS_SCALE = 0.55;
export const MIN_ROUND_SECONDS = 8;

export const BASE_POINTS: Record<AnagramDifficulty, number> = {
  [DIFFICULTY_EASY]: 50,
  [DIFFICULTY_MEDIUM]: 75,
  [DIFFICULTY_HARD]: 100,
};

/** Share of the base awarded by finishing 1st, 2nd, 3rd, and 4th-or-later. */
export const PLACEMENT_MULTIPLIERS = [1, 0.8, 0.65, 0.5];

export const MAX_SPEED_BONUS = 50;
export const STREAK_BONUS_PER_STEP = 10;
export const MAX_STREAK_STEPS = 5;

export const DEFAULT_MAX_ATTEMPTS = 4;
export const DEFAULT_LIVES = 3;
export const DEFAULT_TOTAL_ROUNDS = 10;
export const BLITZ_TOTAL_ROUNDS = 15;
export const SURVIVAL_TOTAL_ROUNDS = 25;

export const COUNTDOWN_SECONDS = 3;
/** How long the round recap stays up before the next word is dealt. */
export const ROUND_SUMMARY_MS = 4000;

export const CATEGORY_LABELS: Record<AnagramCategory, string> = {
  common: 'Common',
  advanced: 'Advanced',
  animals: 'Animals',
  food: 'Food & Drink',
  science: 'Science',
  travel: 'Travel',
  sports: 'Sports',
};

export const MODE_LABELS: Record<AnagramMode, string> = {
  solo: 'Solo',
  classic: 'Classic',
  survival: 'Survival',
  blitz: 'Blitz',
  team: 'Team',
};

export const MODE_BLURBS: Record<AnagramMode, string> = {
  solo: 'One seat, ten words, the clock.',
  classic: 'A fixed run of words — highest score takes it.',
  survival: 'Miss a word and lose a life. Last seat standing wins.',
  blitz: 'Fifteen words on a short fuse.',
  team: 'Two sides, scores pooled, one winner.',
};

export function roundsForMode(mode: AnagramMode): number {
  if (mode === MODE_BLITZ) return BLITZ_TOTAL_ROUNDS;
  if (mode === MODE_SURVIVAL) return SURVIVAL_TOTAL_ROUNDS;
  return DEFAULT_TOTAL_ROUNDS;
}

export const DEFAULT_RULES: AnagramRules = {
  mode: MODE_SOLO,
  category: null,
  totalRounds: DEFAULT_TOTAL_ROUNDS,
  startingSeconds: SECONDS_BY_DIFFICULTY[DIFFICULTY_EASY],
  maxAttempts: DEFAULT_MAX_ATTEMPTS,
  lives: DEFAULT_LIVES,
  hintsEnabled: true,
};
