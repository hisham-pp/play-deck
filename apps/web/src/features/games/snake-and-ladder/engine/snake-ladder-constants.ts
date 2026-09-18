import type {
  SnakeLadderColor,
  SnakeLadderJump,
  SnakeLadderRuleSettings,
} from '../types/snake-and-ladder.types';

export const BOARD_COLUMNS = 10;
export const BOARD_ROWS = 10;
export const FINAL_SQUARE = BOARD_COLUMNS * BOARD_ROWS;
/** Off-board pocket every token starts in. */
export const START_SQUARE = 0;

export const DICE_MIN = 1;
export const DICE_MAX = 6;

export const MIN_SEATS = 2;
export const MAX_SEATS = 4;

export const SEAT_COLORS: SnakeLadderColor[] = ['red', 'green', 'yellow', 'blue'];

export const STATUS_WAITING = 'waiting';
export const STATUS_PLAYING = 'playing';
export const STATUS_PAUSED = 'paused';
export const STATUS_COMPLETED = 'completed';

/**
 * The classic board. Ladder tails and snake heads are unique squares, and no
 * ladder lands on a snake head — `board-layout.test.ts` holds that line so the
 * board can never trap a token in a chain.
 */
export const LADDERS: Readonly<Record<number, number>> = {
  1: 38,
  4: 14,
  9: 31,
  21: 42,
  28: 84,
  36: 44,
  51: 67,
  71: 91,
  80: 100,
};

export const SNAKES: Readonly<Record<number, number>> = {
  16: 6,
  47: 26,
  49: 11,
  56: 53,
  62: 19,
  64: 60,
  87: 24,
  93: 73,
  95: 75,
  98: 78,
};

export const ALL_JUMPS: readonly SnakeLadderJump[] = [
  ...Object.entries(LADDERS).map(([from, to]) => ({
    kind: 'ladder' as const,
    from: Number(from),
    to,
  })),
  ...Object.entries(SNAKES).map(([from, to]) => ({
    kind: 'snake' as const,
    from: Number(from),
    to,
  })),
];

export const DEFAULT_RULE_SETTINGS: SnakeLadderRuleSettings = {
  requireSixToStart: false,
  requireExactRollToFinish: true,
  sixGrantsExtraTurn: true,
  maxConsecutiveSixes: 3,
  endOnFirstFinisher: false,
};
