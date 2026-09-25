/**
 * UNO-Style Color & Number Shedding Card Game Engine
 * Pure TypeScript implementation of an original shedding card game.
 * Features 4 colors, number cards (0-9), action cards (Skip, Reverse, Draw Two),
 * Wild and Wild Draw Four cards, turn cycle with directional order,
 * color-blind symbols, and tactical AI bots.
 */

export type CardColor = 'red' | 'blue' | 'green' | 'yellow' | 'wild';
export type CardType = 'number' | 'skip' | 'reverse' | 'draw2' | 'wild' | 'wild_draw4';

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

export type UnoGameStatus = 'playing' | 'round_over' | 'game_over';

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
  red: '◆', // Diamond
  blue: '●', // Circle
  green: '▲', // Triangle
  yellow: '★', // Star
  wild: '✦', // Rainbow Sparkle
};

export const COLOR_NAMES: Record<CardColor, string> = {
  red: 'Crimson Red',
  blue: 'Cobalt Blue',
  green: 'Emerald Green',
  yellow: 'Amber Gold',
  wild: 'Wild Rainbow',
};

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
  const colors: CardColor[] = ['red', 'blue', 'green', 'yellow'];

  colors.forEach((color) => {
    // Number 0 (1 per color)
    deck.push({
      id: `${color}-0-0`,
      color,
      type: 'number',
      value: 0,
      symbol: '0',
    });

    // Numbers 1-9 (2 per color)
    for (let num = 1; num <= 9; num++) {
      deck.push({
        id: `${color}-${num}-1`,
        color,
        type: 'number',
        value: num,
        symbol: String(num),
      });
      deck.push({
        id: `${color}-${num}-2`,
        color,
        type: 'number',
        value: num,
        symbol: String(num),
      });
    }

    // Action cards (2 each per color)
    for (let copy = 1; copy <= 2; copy++) {
      deck.push({
        id: `${color}-skip-${copy}`,
        color,
        type: 'skip',
        symbol: '⊘',
      });
      deck.push({
        id: `${color}-reverse-${copy}`,
        color,
        type: 'reverse',
        symbol: '⇄',
      });
      deck.push({
        id: `${color}-draw2-${copy}`,
        color,
        type: 'draw2',
        symbol: '+2',
      });
    }
  });

  // Wild Cards (4)
  for (let i = 1; i <= 4; i++) {
    deck.push({
      id: `wild-${i}`,
      color: 'wild',
      type: 'wild',
      symbol: '★',
    });
  }

  // Wild Draw Four Cards (4)
  for (let i = 1; i <= 4; i++) {
    deck.push({
      id: `wild-draw4-${i}`,
      color: 'wild',
      type: 'wild_draw4',
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
 * Creates and initializes a new Uno-style game.
 */
export function createInitialUnoState(options?: {
  playerCount?: number;
  playerNames?: string[];
  targetWinningScore?: number;
}): UnoGameState {
  const count = options?.playerCount ?? 4;
  const rawDeck = shuffleCards(createStandardDeck());

  const playerNames = options?.playerNames ?? ['You (P1)', 'NovaBot', 'PulseBot', 'EchoBot'];

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
  let topDiscardIndex = rawDeck.findIndex((card) => card.type === 'number');
  if (topDiscardIndex === -1) topDiscardIndex = 0;
  const topDiscard = rawDeck.splice(topDiscardIndex, 1)[0];

  return {
    players,
    deck: rawDeck,
    discardPile: [topDiscard],
    activeColor: topDiscard.color,
    currentTurnIndex: 0,
    direction: 1,
    status: 'playing',
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
  // Wild cards can always be played
  if (card.color === 'wild' || card.type === 'wild' || card.type === 'wild_draw4') {
    return true;
  }

  // Matches active color
  if (card.color === activeColor) {
    return true;
  }

  // Matches number value
  if (
    card.type === 'number' &&
    topDiscard.type === 'number' &&
    card.value !== undefined &&
    card.value === topDiscard.value
  ) {
    return true;
  }

  // Matches action type (e.g. Skip on Skip, Reverse on Reverse, Draw2 on Draw2)
  if (card.type !== 'number' && card.type === topDiscard.type) {
    return true;
  }

  return false;
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
 * Reshuffles discard pile back into draw deck if draw deck is depleted.
 */
export function replenishDeckIfNeeded(state: UnoGameState): void {
  if (state.deck.length > 3) return;

  const top = state.discardPile.pop();
  if (!top) return;

  const cardsToShuffle = state.discardPile.map((c) => ({
    ...c,
    // Reset wild cards back to wild color
    color: c.type === 'wild' || c.type === 'wild_draw4' ? ('wild' as CardColor) : c.color,
  }));

  state.deck = shuffleCards(cardsToShuffle);
  state.discardPile = [top];
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
  // If drawing resets 1-card status
  if (player.hand.length > 1) {
    player.hasCalledLastCard = false;
  }
  return drawn;
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
  if (state.status !== 'playing') {
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

  if (!isCardPlayable(card, topDiscard, state.activeColor)) {
    return { success: false, message: 'Card cannot be played on the discard pile.' };
  }

  // Remove card from hand and push to discard
  activePlayer.hand.splice(cardIndex, 1);
  state.discardPile.push(card);
  state.hasDrawnThisTurn = false;

  // Check round win immediately
  if (activePlayer.hand.length === 0) {
    state.status = 'round_over';
    state.winnerId = activePlayer.id;

    // Calculate score from opponent hands
    let roundPoints = 0;
    for (const p of state.players) {
      if (p.id !== activePlayer.id) {
        roundPoints += calculateHandScore(p.hand);
      }
    }
    activePlayer.score += roundPoints;

    if (activePlayer.score >= state.targetWinningScore) {
      state.status = 'game_over';
      state.lastActionMessage = `${activePlayer.name} shed their final card and won the match with ${activePlayer.score} points!`;
    } else {
      state.lastActionMessage = `${activePlayer.name} won the round (+${roundPoints} pts)! Current score: ${activePlayer.score}.`;
    }

    return { success: true, message: state.lastActionMessage };
  }

  // If wild card, requires color choice
  if (card.type === 'wild' || card.type === 'wild_draw4') {
    if (chosenWildColor && ['red', 'blue', 'green', 'yellow'].includes(chosenWildColor)) {
      state.activeColor = chosenWildColor;
      return applyCardEffect(state, activePlayer, card, chosenWildColor);
    } else {
      // Enter pending wild state
      state.pendingWildPlayerId = activePlayer.id;
      state.lastActionMessage = `${activePlayer.name} played a Wild card! Choosing color...`;
      return { success: true, message: state.lastActionMessage };
    }
  }

  state.activeColor = card.color;
  return applyCardEffect(state, activePlayer, card);
}

/**
 * Resolves special card actions (Skip, Reverse, Draw2, WildDraw4) and advances turn.
 */
function applyCardEffect(
  state: UnoGameState,
  activePlayer: UnoPlayer,
  card: Card,
  chosenColor?: CardColor,
): { success: boolean; message: string } {
  let message = `${activePlayer.name} played ${COLOR_NAMES[state.activeColor]} ${card.symbol}.`;
  const playerCount = state.players.length;

  if (card.type === 'skip') {
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
  } else if (card.type === 'reverse') {
    if (playerCount === 2) {
      // In 2-player games, reverse behaves like a Skip
      message += ` Reversed! Turn stays with ${activePlayer.name}.`;
      // currentTurnIndex unchanged
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
  } else if (card.type === 'draw2') {
    const victimIndex = getNextPlayerIndex(state.currentTurnIndex, playerCount, state.direction, 1);
    const victim = state.players[victimIndex];
    drawCards(state, victim, 2);
    message += ` ${victim.name} drew 2 cards and lost their turn!`;
    state.currentTurnIndex = getNextPlayerIndex(
      state.currentTurnIndex,
      playerCount,
      state.direction,
      2,
    );
  } else if (card.type === 'wild_draw4') {
    const victimIndex = getNextPlayerIndex(state.currentTurnIndex, playerCount, state.direction, 1);
    const victim = state.players[victimIndex];
    drawCards(state, victim, 4);
    message = `${activePlayer.name} set color to ${COLOR_NAMES[chosenColor ?? state.activeColor]}! ${victim.name} drew 4 cards and lost their turn!`;
    state.currentTurnIndex = getNextPlayerIndex(
      state.currentTurnIndex,
      playerCount,
      state.direction,
      2,
    );
  } else if (card.type === 'wild') {
    message = `${activePlayer.name} set color to ${COLOR_NAMES[chosenColor ?? state.activeColor]}.`;
    state.currentTurnIndex = getNextPlayerIndex(
      state.currentTurnIndex,
      playerCount,
      state.direction,
      1,
    );
  } else {
    // Normal number card
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
 * Allows the active player to choose color after playing a Wild.
 */
export function chooseWildColor(
  state: UnoGameState,
  playerId: string,
  chosenColor: CardColor,
): boolean {
  if (state.pendingWildPlayerId !== playerId) return false;
  if (!['red', 'blue', 'green', 'yellow'].includes(chosenColor)) return false;

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
  if (state.status !== 'playing') return null;

  const activePlayer = state.players[state.currentTurnIndex];
  if (activePlayer.id !== playerId) return null;
  if (state.pendingWildPlayerId) return null;

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
  if (state.status !== 'playing') return false;

  const activePlayer = state.players[state.currentTurnIndex];
  if (activePlayer.id !== playerId) return false;
  if (!state.hasDrawnThisTurn) return false;
  if (state.pendingWildPlayerId) return false;

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
    if (card.type === 'wild' || card.type === 'wild_draw4') {
      return total + 50;
    }
    return total + 20; // skip, reverse, draw2
  }, 0);
}

/**
 * Intelligent AI Bot turn solver.
 */
export function getBotAction(
  state: UnoGameState,
  botId: string,
  _difficulty: 'easy' | 'medium' | 'hard' = 'medium',
): { action: 'play' | 'draw' | 'pass'; cardId?: string; chosenColor?: CardColor } {
  const bot = state.players.find((p) => p.id === botId);
  if (!bot) return { action: 'draw' };

  // If pending wild choice, pick bot's most prevalent color
  if (state.pendingWildPlayerId === botId) {
    const colorCounts: Record<CardColor, number> = {
      red: 0,
      blue: 0,
      green: 0,
      yellow: 0,
      wild: 0,
    };
    bot.hand.forEach((c) => {
      if (c.color !== 'wild') colorCounts[c.color]++;
    });

    let bestColor: CardColor = 'red';
    let maxCount = -1;
    (['red', 'blue', 'green', 'yellow'] as CardColor[]).forEach((col) => {
      if (colorCounts[col] > maxCount) {
        maxCount = colorCounts[col];
        bestColor = col;
      }
    });

    return { action: 'play', chosenColor: bestColor };
  }

  const topDiscard = state.discardPile[state.discardPile.length - 1];
  const playable = bot.hand.filter((card) => isCardPlayable(card, topDiscard, state.activeColor));

  // If already drawn this turn, either play the playable card or pass
  if (state.hasDrawnThisTurn) {
    if (playable.length > 0) {
      const card = playable[0];
      const chosenColor =
        card.type === 'wild' || card.type === 'wild_draw4'
          ? getMostPrevalentColor(bot.hand)
          : undefined;
      return { action: 'play', cardId: card.id, chosenColor };
    }
    return { action: 'pass' };
  }

  // Choose optimal playable card
  if (playable.length > 0) {
    // Strategy: Prefer matching action cards or highest numbers, save wilds for emergency
    const nonWilds = playable.filter((c) => c.type !== 'wild' && c.type !== 'wild_draw4');
    let chosenCard: Card;

    if (nonWilds.length > 0) {
      // Prioritize Draw 2 or Skip to disrupt next opponent
      const actionCard = nonWilds.find((c) => c.type === 'draw2' || c.type === 'skip');
      chosenCard = actionCard ?? nonWilds[0];
    } else {
      chosenCard = playable[0];
    }

    const chosenColor =
      chosenCard.type === 'wild' || chosenCard.type === 'wild_draw4'
        ? getMostPrevalentColor(bot.hand)
        : undefined;

    return { action: 'play', cardId: chosenCard.id, chosenColor };
  }

  // Must draw
  return { action: 'draw' };
}

function getMostPrevalentColor(hand: Card[]): CardColor {
  const counts: Record<CardColor, number> = { red: 0, blue: 0, green: 0, yellow: 0, wild: 0 };
  hand.forEach((c) => {
    if (c.color !== 'wild') counts[c.color]++;
  });

  let best: CardColor = 'red';
  let max = -1;
  (['red', 'blue', 'green', 'yellow'] as CardColor[]).forEach((col) => {
    if (counts[col] > max) {
      max = counts[col];
      best = col;
    }
  });
  return best;
}
