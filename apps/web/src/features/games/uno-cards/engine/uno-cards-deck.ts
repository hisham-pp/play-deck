import {
  CARD_COLOR_WILD,
  CARD_TYPE_DRAW2,
  CARD_TYPE_NUMBER,
  CARD_TYPE_REVERSE,
  CARD_TYPE_SKIP,
  CARD_TYPE_WILD,
  CARD_TYPE_WILD_DRAW4,
  STANDARD_COLORS,
  type Card,
  type CardColor,
  type UnoGameState,
} from '../types/uno-cards.types';

const ACTION_CARDS_CONFIG = [
  { type: CARD_TYPE_SKIP, symbol: '⊘' },
  { type: CARD_TYPE_REVERSE, symbol: '⇄' },
  { type: CARD_TYPE_DRAW2, symbol: '+2' },
] as const;

/**
 * Generates a full standard 108-card shedding deck:
 * - 4 Colors: Red, Blue, Green, Yellow
 *   - Each color has one '0' and two of each '1'-'9' (19 number cards)
 *   - Each color has two 'Skip', two 'Reverse', two 'Draw Two' (6 action cards)
 *   - Total per color: 25 cards (100 color cards)
 * - 4 Wild cards
 * - 4 Wild Draw Four cards (8 wild cards total)
 */
export function createStandardDeck(): Card[] {
  const deck: Card[] = [];

  STANDARD_COLORS.forEach((color) => {
    // Number 0 (1 per color)
    deck.push({
      id: `${color}-0-0`,
      color,
      type: CARD_TYPE_NUMBER,
      value: 0,
      symbol: '0',
    });

    // Numbers 1-9 (2 per color)
    for (let num = 1; num <= 9; num++) {
      deck.push({
        id: `${color}-${num}-1`,
        color,
        type: CARD_TYPE_NUMBER,
        value: num,
        symbol: String(num),
      });
      deck.push({
        id: `${color}-${num}-2`,
        color,
        type: CARD_TYPE_NUMBER,
        value: num,
        symbol: String(num),
      });
    }

    // Action cards (2 each per color)
    for (let copy = 1; copy <= 2; copy++) {
      ACTION_CARDS_CONFIG.forEach(({ type, symbol }) => {
        deck.push({
          id: `${color}-${type}-${copy}`,
          color,
          type,
          symbol,
        });
      });
    }
  });

  // Wild Cards (4)
  for (let i = 1; i <= 4; i++) {
    deck.push({
      id: `wild-${i}`,
      color: CARD_COLOR_WILD,
      type: CARD_TYPE_WILD,
      symbol: '★',
    });
  }

  // Wild Draw Four Cards (4)
  for (let i = 1; i <= 4; i++) {
    deck.push({
      id: `wild-draw4-${i}`,
      color: CARD_COLOR_WILD,
      type: CARD_TYPE_WILD_DRAW4,
      symbol: '+4',
    });
  }

  return deck;
}

/**
 * Fisher-Yates array shuffle.
 */
export function shuffleCards<T>(items: T[]): T[] {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = temp;
  }
  return shuffled;
}

/**
 * Reshuffles discard pile back into draw deck if draw deck is depleted.
 */
export function replenishDeckIfNeeded(state: UnoGameState): void {
  if (state.deck.length > 3) return;

  const top = state.discardPile.pop();
  if (!top) return;

  const cardsToShuffle = state.discardPile.map((c) => ({
    ...c,
    // Reset wild cards back to wild color
    color:
      c.type === CARD_TYPE_WILD || c.type === CARD_TYPE_WILD_DRAW4
        ? (CARD_COLOR_WILD as CardColor)
        : c.color,
  }));

  state.deck = shuffleCards(cardsToShuffle);
  state.discardPile = [top];
}
