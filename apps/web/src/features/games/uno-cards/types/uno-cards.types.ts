/**
 * UNO Cards Game Types and Constants
 */

export const CARD_COLOR_RED = 'red' as const;
export const CARD_COLOR_BLUE = 'blue' as const;
export const CARD_COLOR_GREEN = 'green' as const;
export const CARD_COLOR_YELLOW = 'yellow' as const;
export const CARD_COLOR_WILD = 'wild' as const;

export type CardColor =
  | typeof CARD_COLOR_RED
  | typeof CARD_COLOR_BLUE
  | typeof CARD_COLOR_GREEN
  | typeof CARD_COLOR_YELLOW
  | typeof CARD_COLOR_WILD;

export const STANDARD_COLORS: readonly CardColor[] = [
  CARD_COLOR_RED,
  CARD_COLOR_BLUE,
  CARD_COLOR_GREEN,
  CARD_COLOR_YELLOW,
] as const;

export const CARD_TYPE_NUMBER = 'number' as const;
export const CARD_TYPE_SKIP = 'skip' as const;
export const CARD_TYPE_REVERSE = 'reverse' as const;
export const CARD_TYPE_DRAW2 = 'draw2' as const;
export const CARD_TYPE_WILD = 'wild' as const;
export const CARD_TYPE_WILD_DRAW4 = 'wild_draw4' as const;

export type CardType =
  | typeof CARD_TYPE_NUMBER
  | typeof CARD_TYPE_SKIP
  | typeof CARD_TYPE_REVERSE
  | typeof CARD_TYPE_DRAW2
  | typeof CARD_TYPE_WILD
  | typeof CARD_TYPE_WILD_DRAW4;

export const GAME_STATUS_PLAYING = 'playing' as const;
export const GAME_STATUS_ROUND_OVER = 'round_over' as const;
export const GAME_STATUS_GAME_OVER = 'game_over' as const;

export type UnoGameStatus =
  typeof GAME_STATUS_PLAYING | typeof GAME_STATUS_ROUND_OVER | typeof GAME_STATUS_GAME_OVER;

export interface Card {
  id: string;
  color: CardColor;
  type: CardType;
  value?: number; // 0-9 for numbers
  symbol: string;
}

export interface UnoPlayer {
  id: string;
  name: string;
  isBot: boolean;
  hand: Card[];
  hasCalledLastCard: boolean;
  score: number;
}

export interface UnoGameState {
  players: UnoPlayer[];
  deck: Card[];
  discardPile: Card[];
  activeColor: CardColor; // The currently required color (never 'wild')
  currentTurnIndex: number;
  direction: 1 | -1; // 1 = clockwise, -1 = counter-clockwise
  status: UnoGameStatus;
  winnerId: string | null;
  lastActionMessage: string;
  pendingWildPlayerId: string | null; // Awaiting color choice
  hasDrawnThisTurn: boolean;
  targetWinningScore: number;
}

export const COLOR_SYMBOLS: Record<CardColor, string> = {
  [CARD_COLOR_RED]: '◆', // Diamond
  [CARD_COLOR_BLUE]: '●', // Circle
  [CARD_COLOR_GREEN]: '▲', // Triangle
  [CARD_COLOR_YELLOW]: '★', // Star
  [CARD_COLOR_WILD]: '✦', // Rainbow Sparkle
};

export const COLOR_NAMES: Record<CardColor, string> = {
  [CARD_COLOR_RED]: 'Crimson Red',
  [CARD_COLOR_BLUE]: 'Cobalt Blue',
  [CARD_COLOR_GREEN]: 'Emerald Green',
  [CARD_COLOR_YELLOW]: 'Amber Gold',
  [CARD_COLOR_WILD]: 'Wild Rainbow',
};
