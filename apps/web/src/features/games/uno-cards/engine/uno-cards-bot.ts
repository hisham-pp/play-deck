import {
  CARD_COLOR_RED,
  CARD_COLOR_WILD,
  CARD_TYPE_DRAW2,
  CARD_TYPE_SKIP,
  CARD_TYPE_WILD,
  CARD_TYPE_WILD_DRAW4,
  STANDARD_COLORS,
  type Card,
  type CardColor,
  type UnoGameState,
} from '../types/uno-cards.types';

export function getMostPrevalentColor(hand: Card[]): CardColor {
  const counts: Record<CardColor, number> = {
    red: 0,
    blue: 0,
    green: 0,
    yellow: 0,
    wild: 0,
  };

  hand.forEach((c) => {
    if (c.color !== CARD_COLOR_WILD) {
      counts[c.color]++;
    }
  });

  let best: CardColor = CARD_COLOR_RED;
  let max = -1;

  STANDARD_COLORS.forEach((col) => {
    if (counts[col] > max) {
      max = counts[col];
      best = col;
    }
  });

  return best;
}

export function isWildCard(card: Card): boolean {
  return card.type === CARD_TYPE_WILD || card.type === CARD_TYPE_WILD_DRAW4;
}

function selectOptimalCard(playable: Card[]): Card {
  const nonWilds = playable.filter((c) => !isWildCard(c));
  if (nonWilds.length > 0) {
    const actionCard = nonWilds.find(
      (c) => c.type === CARD_TYPE_DRAW2 || c.type === CARD_TYPE_SKIP,
    );
    return actionCard ?? nonWilds[0];
  }
  return playable[0];
}

export interface BotAction {
  action: 'play' | 'draw' | 'pass';
  cardId?: string;
  chosenColor?: CardColor;
}

/**
 * Intelligent AI Bot turn solver.
 */
export function getBotAction(
  state: UnoGameState,
  botId: string,
  _difficulty: 'easy' | 'medium' | 'hard' = 'medium',
  isCardPlayableFn: (card: Card, topDiscard: Card, activeColor: CardColor) => boolean,
): BotAction {
  const bot = state.players.find((p) => p.id === botId);
  if (!bot) return { action: 'draw' };

  // If pending wild choice, pick bot's most prevalent color
  if (state.pendingWildPlayerId === botId) {
    return { action: 'play', chosenColor: getMostPrevalentColor(bot.hand) };
  }

  const topDiscard = state.discardPile[state.discardPile.length - 1];
  const playable = bot.hand.filter((card) => isCardPlayableFn(card, topDiscard, state.activeColor));

  // If already drawn this turn, either play the playable card or pass
  if (state.hasDrawnThisTurn) {
    if (playable.length > 0) {
      const card = playable[0];
      const chosenColor = isWildCard(card) ? getMostPrevalentColor(bot.hand) : undefined;
      return { action: 'play', cardId: card.id, chosenColor };
    }
    return { action: 'pass' };
  }

  // Choose optimal playable card
  if (playable.length > 0) {
    const chosenCard = selectOptimalCard(playable);
    const chosenColor = isWildCard(chosenCard) ? getMostPrevalentColor(bot.hand) : undefined;
    return { action: 'play', cardId: chosenCard.id, chosenColor };
  }

  // Must draw
  return { action: 'draw' };
}
