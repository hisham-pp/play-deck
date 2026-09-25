import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  calculateHandScore,
  chooseWildColor,
  createInitialUnoState,
  createStandardDeck,
  drawCardFromDeck,
  getBotAction,
  isCardPlayable,
  passTurn,
  playCard,
  type Card,
  type UnoGameState,
} from './uno-cards-engine';

describe('Uno Cards Engine', () => {
  describe('Deck Generation & Deal', () => {
    it('generates a standard 108-card deck', () => {
      const deck = createStandardDeck();
      assert.equal(deck.length, 108);

      const redCards = deck.filter((c) => c.color === 'red');
      const wildCards = deck.filter((c) => c.color === 'wild');
      assert.equal(redCards.length, 25);
      assert.equal(wildCards.length, 8); // 4 Wild + 4 Wild Draw 4
    });

    it('initializes game with 4 players and 7 cards each', () => {
      const state = createInitialUnoState({ playerCount: 4 });
      assert.equal(state.players.length, 4);
      state.players.forEach((p) => {
        assert.equal(p.hand.length, 7);
      });
      assert.equal(state.discardPile.length, 1);
      assert.notEqual(state.discardPile[0].color, 'wild');
      assert.equal(state.activeColor, state.discardPile[0].color);
      assert.equal(state.currentTurnIndex, 0);
      assert.equal(state.direction, 1);
    });
  });

  describe('Card Playability Rules', () => {
    it('allows playing a card that matches the active color', () => {
      const topDiscard: Card = { id: 'top', color: 'red', type: 'number', value: 3, symbol: '3' };
      const card: Card = { id: 'c1', color: 'red', type: 'number', value: 7, symbol: '7' };
      assert.equal(isCardPlayable(card, topDiscard, 'red'), true);
    });

    it('allows playing a card that matches the number value', () => {
      const topDiscard: Card = { id: 'top', color: 'red', type: 'number', value: 5, symbol: '5' };
      const card: Card = { id: 'c2', color: 'blue', type: 'number', value: 5, symbol: '5' };
      assert.equal(isCardPlayable(card, topDiscard, 'red'), true);
    });

    it('allows playing wild cards anytime', () => {
      const topDiscard: Card = { id: 'top', color: 'green', type: 'number', value: 2, symbol: '2' };
      const wild: Card = { id: 'w1', color: 'wild', type: 'wild', symbol: '★' };
      const wild4: Card = { id: 'w2', color: 'wild', type: 'wild_draw4', symbol: '+4' };
      assert.equal(isCardPlayable(wild, topDiscard, 'green'), true);
      assert.equal(isCardPlayable(wild4, topDiscard, 'green'), true);
    });

    it('rejects playing non-matching cards', () => {
      const topDiscard: Card = {
        id: 'top',
        color: 'yellow',
        type: 'number',
        value: 1,
        symbol: '1',
      };
      const card: Card = { id: 'bad', color: 'blue', type: 'number', value: 8, symbol: '8' };
      assert.equal(isCardPlayable(card, topDiscard, 'yellow'), false);
    });
  });

  describe('Turn Execution & Action Cards', () => {
    function setupPredictableMatch(): UnoGameState {
      const state = createInitialUnoState({ playerCount: 4, targetWinningScore: 1000 });
      state.discardPile = [{ id: 'start', color: 'red', type: 'number', value: 5, symbol: '5' }];
      state.activeColor = 'red';
      state.currentTurnIndex = 0;
      state.direction = 1;
      return state;
    }

    it('advances turn on standard number play', () => {
      const state = setupPredictableMatch();
      const p1 = state.players[0];
      const testCard: Card = { id: 'p1-card', color: 'red', type: 'number', value: 9, symbol: '9' };
      p1.hand = [testCard];

      const res = playCard(state, p1.id, testCard.id);
      assert.equal(res.success, true);
      assert.equal(state.status, 'round_over');
      assert.equal(state.winnerId, p1.id);
    });

    it('skips next player when Skip card is played', () => {
      const state = setupPredictableMatch();
      const p1 = state.players[0];
      const skipCard: Card = { id: 'skip-1', color: 'red', type: 'skip', symbol: '⊘' };
      p1.hand = [skipCard, { id: 'extra', color: 'blue', type: 'number', value: 1, symbol: '1' }];

      const res = playCard(state, p1.id, skipCard.id);
      assert.equal(res.success, true);
      assert.equal(state.currentTurnIndex, 2); // Player 2 (index 1) skipped!
    });

    it('reverses turn direction when Reverse card is played', () => {
      const state = setupPredictableMatch();
      const p1 = state.players[0];
      const revCard: Card = { id: 'rev-1', color: 'red', type: 'reverse', symbol: '⇄' };
      p1.hand = [revCard, { id: 'extra', color: 'blue', type: 'number', value: 1, symbol: '1' }];

      const res = playCard(state, p1.id, revCard.id);
      assert.equal(res.success, true);
      assert.equal(state.direction, -1);
      assert.equal(state.currentTurnIndex, 3); // Reversed from 0 counter-clockwise -> 3
    });

    it('forces victim to draw 2 cards and skips them on Draw Two play', () => {
      const state = setupPredictableMatch();
      const p1 = state.players[0];
      const p2 = state.players[1];
      const p2InitialHandLength = p2.hand.length;

      const draw2Card: Card = { id: 'd2-1', color: 'red', type: 'draw2', symbol: '+2' };
      p1.hand = [draw2Card, { id: 'extra', color: 'blue', type: 'number', value: 1, symbol: '1' }];

      const res = playCard(state, p1.id, draw2Card.id);
      assert.equal(res.success, true);
      assert.equal(p2.hand.length, p2InitialHandLength + 2);
      assert.equal(state.currentTurnIndex, 2); // Player 2 skipped
    });

    it('handles Wild card color choice', () => {
      const state = setupPredictableMatch();
      const p1 = state.players[0];
      const wildCard: Card = { id: 'wild-test', color: 'wild', type: 'wild', symbol: '★' };
      p1.hand = [wildCard, { id: 'extra', color: 'blue', type: 'number', value: 1, symbol: '1' }];

      // Playing without chosen color triggers pending choice
      playCard(state, p1.id, wildCard.id);
      assert.equal(state.pendingWildPlayerId, p1.id);

      // Now pick color Blue
      const chosen = chooseWildColor(state, p1.id, 'blue');
      assert.equal(chosen, true);
      assert.equal(state.activeColor, 'blue');
      assert.equal(state.pendingWildPlayerId, null);
      assert.equal(state.currentTurnIndex, 1);
    });
  });

  describe('Drawing and Passing', () => {
    it('allows player to draw a card and then pass', () => {
      const state = createInitialUnoState({ playerCount: 4 });
      const p1 = state.players[0];
      const initialHand = p1.hand.length;

      const drawn = drawCardFromDeck(state, p1.id);
      assert.ok(drawn);
      assert.equal(p1.hand.length, initialHand + 1);
      assert.equal(state.hasDrawnThisTurn, true);

      const passed = passTurn(state, p1.id);
      assert.equal(passed, true);
      assert.equal(state.currentTurnIndex, 1);
    });

    it('computes correct hand score', () => {
      const hand: Card[] = [
        { id: '1', color: 'red', type: 'number', value: 7, symbol: '7' },
        { id: '2', color: 'blue', type: 'skip', symbol: '⊘' }, // 20 pts
        { id: '3', color: 'wild', type: 'wild', symbol: '★' }, // 50 pts
      ];
      const score = calculateHandScore(hand);
      assert.equal(score, 77); // 7 + 20 + 50
    });
  });

  describe('Bot Automation', () => {
    it('returns a valid bot action (play, draw, or pass)', () => {
      const state = createInitialUnoState({ playerCount: 4 });
      state.currentTurnIndex = 1;
      const bot = state.players[1];

      const action = getBotAction(state, bot.id);
      assert.ok(['play', 'draw', 'pass'].includes(action.action));
      if (action.action === 'play') {
        assert.ok(action.cardId || action.chosenColor);
      }
    });
  });
});
