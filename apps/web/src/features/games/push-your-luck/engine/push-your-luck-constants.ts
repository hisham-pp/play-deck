export const PHASE_LOBBY = 'lobby';
export const PHASE_PLAYING = 'playing';
export const PHASE_GAME_OVER = 'game-over';

export const OUTCOME_SAFE = 'safe';
export const OUTCOME_SAVED = 'saved';
export const OUTCOME_BUST = 'bust';
export const OUTCOME_BANKED = 'banked';

export const KIND_POINTS = 'points';
export const KIND_MULTIPLIER = 'multiplier';
export const KIND_STEAL = 'steal';
export const KIND_INSURANCE = 'insurance';
export const KIND_BUST = 'bust';

export const SEAT_HUMAN = 'human';
export const SEAT_BOT = 'bot';

export const NERVE_CAUTIOUS = 'cautious';
export const NERVE_BALANCED = 'balanced';
export const NERVE_RECKLESS = 'reckless';

export const MIN_SEATS = 2;
export const MAX_SEATS = 8;
export const DEFAULT_HUMAN_SEATS = 1;
export const DEFAULT_BOT_SEATS = 2;

export const TARGET_SCORE_OPTIONS = [60, 100, 150];
export const DEFAULT_TARGET_SCORE = 100;

/** The opening draw of every turn is free — tension has to be earned. */
export const FREE_DRAWS = 1;
export const BUST_CHANCE_BASE = 0.06;
export const BUST_CHANCE_STEP = 0.1;
export const BUST_CHANCE_MAX = 0.72;

export const INSURANCE_MAX = 2;

export const POINTS_MIN = 2;
export const POINTS_SPREAD = 5;
export const POINTS_DRAW_BONUS_CAP = 5;

export const MULTIPLIER_TRIPLE_CHANCE = 0.3;
export const MULTIPLIER_DOUBLE = 2;
export const MULTIPLIER_TRIPLE = 3;

export const STEAL_MIN = 4;
export const STEAL_SPREAD = 7;

export const WEIGHT_POINTS = 70;
export const WEIGHT_MULTIPLIER = 8;
export const WEIGHT_STEAL = 12;
export const WEIGHT_INSURANCE = 10;

export const BOT_DRAW_DELAY_MS = 1000;
export const TURN_HANDOFF_MS = 1700;

export const DEFAULT_AVATARS = ['🎲', '🃏', '🎯', '💎', '🔥', '⚡', '🍀', '🎰'];
export const BOT_NAMES = [
  'Deck Ace',
  'Deck Nerve',
  'Deck Bluff',
  'Deck Chip',
  'Deck Risk',
  'Deck Edge',
  'Deck Tilt',
];
