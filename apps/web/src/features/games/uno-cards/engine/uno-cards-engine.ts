/**
 * UNO-Style Color & Number Shedding Card Game Engine
 * Pure TypeScript implementation of an original shedding card game.
 * Features 4 colors, number cards (0-9), action cards (Skip, Reverse, Draw Two),
 * Wild and Wild Draw Four cards, turn cycle with directional order,
 * color-blind symbols, and tactical AI bots.
 */

import {
  CARD_COLOR_WILD,
  CARD_TYPE_NUMBER,
  CARD_TYPE_WILD,
  CARD_TYPE_WILD_DRAW4,
  COLOR_NAMES,
  GAME_STATUS_PLAYING,
  STANDARD_COLORS,
  type Card,
  type CardColor,
  type UnoGameState,
  type UnoPlayer,
} from '../types/uno-cards.types';
import { getBotAction as solveBotAction } from './uno-cards-bot';
import { createStandardDeck, replenishDeckIfNeeded, shuffleCards } from './uno-cards-deck';
import {
  applyCardEffect,
  calculateHandScore,
  drawCards,
  getNextPlayerIndex,
  playCard as executePlayCard,
} from './uno-cards-play';

export * from '../types/uno-cards.types';
export {
  calculateHandScore,
  createStandardDeck,
  drawCards,
  getNextPlayerIndex,
  replenishDeckIfNeeded,
  shuffleCards,
};

const DEFAULT_BOT_NAMES = ['You (P1)', 'NovaBot', 'PulseBot', 'EchoBot'];

/**
 * Creates and initializes a new Uno-style game.
 */
export function createInitialUnoState(options?: {
  playerCount?: number;
  playerNames?: string[];
  targetWinningScore?: number;
}): UnoGameState {
  const count = options?.playerCount ?? 4;
  const rawDeck = shuffleCards(createStandardDeck());
  const playerNames = options?.playerNames ?? DEFAULT_BOT_NAMES;

  const players: UnoPlayer[] = [];
  for (let i = 0; i < count; i++) {
    players.push({
      id: `player-${i + 1}`,
      name: playerNames[i] ?? `Player ${i + 1}`,
      isBot: i !== 0,
      hand: [],
      hasCalledLastCard: false,
      score: 0,
    });
  }

  // Deal 7 cards to each player
  for (let c = 0; c < 7; c++) {
    for (const player of players) {
      const card = rawDeck.pop();
      if (card) player.hand.push(card);
    }
  }

  // Initial discard card must be a non-wild number card for clean round start
  let topDiscardIndex = rawDeck.findIndex((card) => card.type === CARD_TYPE_NUMBER);
  if (topDiscardIndex === -1) topDiscardIndex = 0;
  const topDiscard = rawDeck.splice(topDiscardIndex, 1)[0];

  return {
    players,
    deck: rawDeck,
    discardPile: [topDiscard],
    activeColor: topDiscard.color,
    currentTurnIndex: 0,
    direction: 1,
    status: GAME_STATUS_PLAYING,
    winnerId: null,
    lastActionMessage: `Match started! Top card is ${COLOR_NAMES[topDiscard.color]} ${topDiscard.symbol}.`,
    pendingWildPlayerId: null,
    hasDrawnThisTurn: false,
    targetWinningScore: options?.targetWinningScore ?? 250,
  };
}

/**
 * Checks whether a card is currently legal to play onto the discard pile.
 */
export function isCardPlayable(card: Card, topDiscard: Card, activeColor: CardColor): boolean {
  if (
    card.color === CARD_COLOR_WILD ||
    card.type === CARD_TYPE_WILD ||
    card.type === CARD_TYPE_WILD_DRAW4
  ) {
    return true;
  }

  if (card.color === activeColor) {
    return true;
  }

  if (
    card.type === CARD_TYPE_NUMBER &&
    topDiscard.type === CARD_TYPE_NUMBER &&
    card.value !== undefined &&
    card.value === topDiscard.value
  ) {
    return true;
  }

  if (card.type !== CARD_TYPE_NUMBER && card.type === topDiscard.type) {
    return true;
  }

  return false;
}

/**
 * Executes a card play from the active player's hand.
 */
export function playCard(
  state: UnoGameState,
  playerId: string,
  cardId: string,
  chosenWildColor?: CardColor,
): { success: boolean; message: string } {
  return executePlayCard(state, playerId, cardId, isCardPlayable, chosenWildColor);
}

/**
 * Allows the active player to choose color after playing a Wild.
 */
export function chooseWildColor(
  state: UnoGameState,
  playerId: string,
  chosenColor: CardColor,
): boolean {
  if (state.pendingWildPlayerId !== playerId) return false;
  if (!(STANDARD_COLORS as readonly string[]).includes(chosenColor)) return false;

  const activePlayer = state.players[state.currentTurnIndex];
  const topDiscard = state.discardPile[state.discardPile.length - 1];

  state.activeColor = chosenColor;
  state.pendingWildPlayerId = null;

  applyCardEffect(state, activePlayer, topDiscard, chosenColor);
  return true;
}

/**
 * Active player draws 1 card from deck.
 */
export function drawCardFromDeck(state: UnoGameState, playerId: string): Card | null {
  if (state.status !== GAME_STATUS_PLAYING) return null;

  const activePlayer = state.players[state.currentTurnIndex];
  if (activePlayer.id !== playerId || state.pendingWildPlayerId) return null;

  const drawn = drawCards(state, activePlayer, 1);
  if (drawn.length === 0) return null;

  state.hasDrawnThisTurn = true;
  state.lastActionMessage = `${activePlayer.name} drew a card.`;
  return drawn[0];
}

/**
 * Passes turn to the next player (valid after drawing a card).
 */
export function passTurn(state: UnoGameState, playerId: string): boolean {
  if (state.status !== GAME_STATUS_PLAYING) return false;

  const activePlayer = state.players[state.currentTurnIndex];
  if (activePlayer.id !== playerId || !state.hasDrawnThisTurn || state.pendingWildPlayerId) {
    return false;
  }

  state.hasDrawnThisTurn = false;
  state.currentTurnIndex = getNextPlayerIndex(
    state.currentTurnIndex,
    state.players.length,
    state.direction,
    1,
  );
  state.lastActionMessage = `${activePlayer.name} passed their turn.`;
  return true;
}

/**
 * Calls "LAST CARD!" for a player when holding 1 or 2 cards.
 */
export function callLastCard(state: UnoGameState, playerId: string): boolean {
  const player = state.players.find((p) => p.id === playerId);
  if (!player) return false;

  player.hasCalledLastCard = true;
  state.lastActionMessage = `${player.name} announced: "LAST CARD!"`;
  return true;
}

/**
 * Intelligent AI Bot turn solver wrapper.
 */
export function getBotAction(
  state: UnoGameState,
  botId: string,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium',
) {
  return solveBotAction(state, botId, difficulty, isCardPlayable);
}
