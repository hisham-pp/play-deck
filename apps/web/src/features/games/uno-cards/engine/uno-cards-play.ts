import {
  CARD_TYPE_DRAW2,
  CARD_TYPE_REVERSE,
  CARD_TYPE_SKIP,
  CARD_TYPE_WILD,
  CARD_TYPE_WILD_DRAW4,
  COLOR_NAMES,
  GAME_STATUS_GAME_OVER,
  GAME_STATUS_PLAYING,
  GAME_STATUS_ROUND_OVER,
  STANDARD_COLORS,
  type Card,
  type CardColor,
  type UnoGameState,
  type UnoPlayer,
} from '../types/uno-cards.types';
import { replenishDeckIfNeeded } from './uno-cards-deck';

/**
 * Computes official point value for an opponent's hand:
 * - Number cards: Face value (0-9)
 * - Action cards (Skip, Reverse, Draw 2): 20 points each
 * - Wild / Wild Draw 4: 50 points each
 */
export function calculateHandScore(hand: Card[]): number {
  return hand.reduce((total, card) => {
    if (card.type === 'number') {
      return total + (card.value ?? 0);
    }
    if (card.type === CARD_TYPE_WILD || card.type === CARD_TYPE_WILD_DRAW4) {
      return total + 50;
    }
    return total + 20;
  }, 0);
}

/**
 * Advances turn index considering direction and count.
 */
export function getNextPlayerIndex(
  currentIndex: number,
  playerCount: number,
  direction: 1 | -1,
  steps = 1,
): number {
  let next = (currentIndex + direction * steps) % playerCount;
  if (next < 0) next += playerCount;
  return next;
}

/**
 * Draws cards from deck to a player's hand.
 */
export function drawCards(state: UnoGameState, player: UnoPlayer, count: number): Card[] {
  const drawn: Card[] = [];
  for (let i = 0; i < count; i++) {
    replenishDeckIfNeeded(state);
    const card = state.deck.pop();
    if (card) {
      player.hand.push(card);
      drawn.push(card);
    }
  }
  if (player.hand.length > 1) {
    player.hasCalledLastCard = false;
  }
  return drawn;
}

function handleRoundOver(
  state: UnoGameState,
  activePlayer: UnoPlayer,
): { success: boolean; message: string } {
  state.status = GAME_STATUS_ROUND_OVER;
  state.winnerId = activePlayer.id;

  let roundPoints = 0;
  for (const p of state.players) {
    if (p.id !== activePlayer.id) {
      roundPoints += calculateHandScore(p.hand);
    }
  }
  activePlayer.score += roundPoints;

  if (activePlayer.score >= state.targetWinningScore) {
    state.status = GAME_STATUS_GAME_OVER;
    state.lastActionMessage = `${activePlayer.name} shed their final card and won the match with ${activePlayer.score} points!`;
  } else {
    state.lastActionMessage = `${activePlayer.name} won the round (+${roundPoints} pts)! Current score: ${activePlayer.score}.`;
  }

  return { success: true, message: state.lastActionMessage };
}

function handleDrawVictim(
  state: UnoGameState,
  activePlayer: UnoPlayer,
  count: number,
  chosenColor?: CardColor,
): string {
  const victimIndex = getNextPlayerIndex(
    state.currentTurnIndex,
    state.players.length,
    state.direction,
    1,
  );
  const victim = state.players[victimIndex];
  drawCards(state, victim, count);
  state.currentTurnIndex = getNextPlayerIndex(
    state.currentTurnIndex,
    state.players.length,
    state.direction,
    2,
  );

  if (count === 4) {
    return `${activePlayer.name} set color to ${COLOR_NAMES[chosenColor ?? state.activeColor]}! ${victim.name} drew 4 cards and lost their turn!`;
  }
  return `${activePlayer.name} played ${COLOR_NAMES[state.activeColor]} +2. ${victim.name} drew 2 cards and lost their turn!`;
}

/**
 * Resolves special card actions (Skip, Reverse, Draw2, WildDraw4) and advances turn.
 */
export function applyCardEffect(
  state: UnoGameState,
  activePlayer: UnoPlayer,
  card: Card,
  chosenColor?: CardColor,
): { success: boolean; message: string } {
  let message = `${activePlayer.name} played ${COLOR_NAMES[state.activeColor]} ${card.symbol}.`;
  const playerCount = state.players.length;

  if (card.type === CARD_TYPE_SKIP) {
    const skippedIndex = getNextPlayerIndex(
      state.currentTurnIndex,
      playerCount,
      state.direction,
      1,
    );
    const skippedPlayer = state.players[skippedIndex];
    message += ` ${skippedPlayer.name} was skipped!`;
    state.currentTurnIndex = getNextPlayerIndex(
      state.currentTurnIndex,
      playerCount,
      state.direction,
      2,
    );
  } else if (card.type === CARD_TYPE_REVERSE) {
    if (playerCount === 2) {
      message += ` Reversed! Turn stays with ${activePlayer.name}.`;
    } else {
      state.direction = (state.direction * -1) as 1 | -1;
      message += ` Turn direction reversed!`;
      state.currentTurnIndex = getNextPlayerIndex(
        state.currentTurnIndex,
        playerCount,
        state.direction,
        1,
      );
    }
  } else if (card.type === CARD_TYPE_DRAW2) {
    message = handleDrawVictim(state, activePlayer, 2);
  } else if (card.type === CARD_TYPE_WILD_DRAW4) {
    message = handleDrawVictim(state, activePlayer, 4, chosenColor);
  } else if (card.type === CARD_TYPE_WILD) {
    message = `${activePlayer.name} set color to ${COLOR_NAMES[chosenColor ?? state.activeColor]}.`;
    state.currentTurnIndex = getNextPlayerIndex(
      state.currentTurnIndex,
      playerCount,
      state.direction,
      1,
    );
  } else {
    state.currentTurnIndex = getNextPlayerIndex(
      state.currentTurnIndex,
      playerCount,
      state.direction,
      1,
    );
  }

  state.lastActionMessage = message;
  return { success: true, message };
}

/**
 * Executes a card play from the active player's hand.
 */
export function playCard(
  state: UnoGameState,
  playerId: string,
  cardId: string,
  isCardPlayableFn: (card: Card, topDiscard: Card, activeColor: CardColor) => boolean,
  chosenWildColor?: CardColor,
): { success: boolean; message: string } {
  if (state.status !== GAME_STATUS_PLAYING) {
    return { success: false, message: 'Game is not in active playing state.' };
  }

  const activePlayer = state.players[state.currentTurnIndex];
  if (activePlayer.id !== playerId) {
    return { success: false, message: "It is not this player's turn." };
  }

  if (state.pendingWildPlayerId) {
    return { success: false, message: 'Must choose a color for the wild card first.' };
  }

  const cardIndex = activePlayer.hand.findIndex((c) => c.id === cardId);
  if (cardIndex === -1) {
    return { success: false, message: 'Card not found in player hand.' };
  }

  const card = activePlayer.hand[cardIndex];
  const topDiscard = state.discardPile[state.discardPile.length - 1];

  if (!isCardPlayableFn(card, topDiscard, state.activeColor)) {
    return { success: false, message: 'Card cannot be played on the discard pile.' };
  }

  activePlayer.hand.splice(cardIndex, 1);
  state.discardPile.push(card);
  state.hasDrawnThisTurn = false;

  if (activePlayer.hand.length === 0) {
    return handleRoundOver(state, activePlayer);
  }

  if (card.type === CARD_TYPE_WILD || card.type === CARD_TYPE_WILD_DRAW4) {
    if (chosenWildColor && (STANDARD_COLORS as readonly string[]).includes(chosenWildColor)) {
      state.activeColor = chosenWildColor;
      return applyCardEffect(state, activePlayer, card, chosenWildColor);
    }
    state.pendingWildPlayerId = activePlayer.id;
    state.lastActionMessage = `${activePlayer.name} played a Wild card! Choosing color...`;
    return { success: true, message: state.lastActionMessage };
  }

  state.activeColor = card.color;
  return applyCardEffect(state, activePlayer, card);
}
