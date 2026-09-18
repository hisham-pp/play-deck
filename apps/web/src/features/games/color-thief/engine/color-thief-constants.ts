import type {
  ColorThiefAbility,
  ColorThiefAbilityId,
  ColorThiefColor,
  ColorThiefRuleSettings,
} from '../types/color-thief.types';

export const MIN_SEATS = 2;
export const MAX_SEATS = 6;

export const SEAT_COLORS: ColorThiefColor[] = [
  'red',
  'blue',
  'green',
  'yellow',
  'purple',
  'orange',
];

export const BOARD_SIZES = [8, 10, 12] as const;
export const ROUND_OPTIONS = [8, 12, 16] as const;

export const STATUS_WAITING = 'waiting';
export const STATUS_PLAYING = 'playing';
export const STATUS_PAUSED = 'paused';
export const STATUS_COMPLETED = 'completed';

export const PAINT_PER_TURN = 5;

/** Paint to flip a tile nobody owns. */
export const COST_NEUTRAL = 1;
/** Paint to flip a tile an opponent already holds. */
export const COST_OPPONENT = 2;
/** Surcharge for landing away from your own paint — the "isolated capture". */
export const COST_ISOLATED = 2;
/** Each defender past the first adds this much to an opponent tile's price. */
export const COST_PER_DEFENDER = 1;
export const MAX_DEFENCE_SURCHARGE = 3;

/** Rounds a Freeze keeps its tiles out of play. */
export const FREEZE_ROUNDS = 2;
/** Tiles a single Bleed can flood at once. */
export const BLEED_LIMIT = 4;
/** Paint a blockaded seat keeps, as a fraction of the usual allowance. */
export const BLOCKADE_PAINT_FACTOR = 0.4;

export const DEFAULT_RULE_SETTINGS: ColorThiefRuleSettings = {
  columns: 10,
  rows: 10,
  paintPerTurn: PAINT_PER_TURN,
  totalRounds: 12,
};

/**
 * One ability per seat colour, hidden from the table until its owner fires it.
 * Green's growth is passive: it creeps on its owner's turn start rather than
 * being aimed, which is why `kind` exists at all.
 */
export const ABILITIES: Record<ColorThiefAbilityId, ColorThiefAbility> = {
  bleed: {
    id: 'bleed',
    color: 'red',
    name: 'Bleed',
    description: `Floods up to ${BLEED_LIMIT} neutral tiles touching your territory in one stroke.`,
    kind: 'active',
    paintCost: 3,
    cooldownRounds: 2,
    targetKind: 'none',
  },
  freeze: {
    id: 'freeze',
    color: 'blue',
    name: 'Freeze',
    description: `Soaks an enemy tile and its touching allies — frozen tiles score nothing and cannot be claimed for ${FREEZE_ROUNDS} rounds.`,
    kind: 'active',
    paintCost: 3,
    cooldownRounds: 2,
    targetKind: 'enemy-tile',
  },
  bloom: {
    id: 'bloom',
    color: 'green',
    name: 'Bloom',
    description:
      'Passive. One neutral tile touching your territory turns green at the start of every turn you take.',
    kind: 'passive',
    paintCost: 0,
    cooldownRounds: 0,
    targetKind: 'none',
  },
  swap: {
    id: 'swap',
    color: 'yellow',
    name: 'Swap',
    description:
      'Trades one of your tiles for any enemy tile anywhere on the grid. It changes no counts, only position — which is why it is cheap.',
    kind: 'active',
    paintCost: 2,
    cooldownRounds: 2,
    targetKind: 'own-and-enemy',
  },
  blockade: {
    id: 'blockade',
    color: 'purple',
    name: 'Blockade',
    description:
      'Dries up an opponent: pick any tile they hold and their next turn runs on a fraction of the usual paint.',
    kind: 'active',
    paintCost: 3,
    cooldownRounds: 3,
    targetKind: 'enemy-tile',
  },
  splash: {
    id: 'splash',
    color: 'orange',
    name: 'Splash',
    description:
      'Hurls paint at any tile and the four around it, ignoring adjacency and defenders alike.',
    kind: 'active',
    paintCost: 4,
    cooldownRounds: 3,
    targetKind: 'any-tile',
  },
};

/** Seat colour decides the ability, so the colour someone picks is the strategy. */
export const ABILITY_BY_COLOR: Record<ColorThiefColor, ColorThiefAbilityId> = {
  red: 'bleed',
  blue: 'freeze',
  green: 'bloom',
  yellow: 'swap',
  purple: 'blockade',
  orange: 'splash',
};
