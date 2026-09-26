import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { RunicMemoryAi } from './runic-memory-ai';
import {
  MODE_PASS_AND_PLAY,
  MODE_SOLO,
  PLAYER_1,
  PLAYER_2,
  STATUS_COMPLETED,
  STATUS_IDLE,
  STATUS_PLAYING,
} from './runic-memory-constants';
import { createRunicDeck } from './runic-memory-deck';
import { RunicMemoryEngine } from './runic-memory-engine';

describe('Runic Memory Engine Tests', () => {
  describe('1. Deck Creation & Deterministic Seeding', () => {
    it('creates correct number of cards for Novice grid (12 cards = 6 pairs)', () => {
      const deck = createRunicDeck('novice', 12345);
      assert.equal(deck.length, 12);

      const runeCounts = new Map<string, number>();
      deck.forEach((card) => {
        runeCounts.set(card.runeId, (runeCounts.get(card.runeId) || 0) + 1);
      });

      assert.equal(runeCounts.size, 6);
      for (const [, count] of runeCounts.entries()) {
        assert.equal(count, 2);
      }
    });

    it('generates identical card distribution for the same seed', () => {
      const deckA = createRunicDeck('apprentice', 999);
      const deckB = createRunicDeck('apprentice', 999);
      assert.equal(deckA.length, deckB.length);

      for (let i = 0; i < deckA.length; i++) {
        assert.equal(deckA[i].runeId, deckB[i].runeId);
      }
    });

    it('generates different card distributions for different seeds', () => {
      const deckA = createRunicDeck('apprentice', 111);
      const deckB = createRunicDeck('apprentice', 222);

      const isIdentical = deckA.every((c, i) => c.runeId === deckB[i].runeId);
      assert.equal(isIdentical, false);
    });
  });

  describe('2. Initial State & Card Flipping', () => {
    it('initializes in IDLE state with 0 moves, matches, and scores', () => {
      const engine = new RunicMemoryEngine({ mode: MODE_SOLO, difficulty: 'novice', seed: 42 });
      const state = engine.getState();

      assert.equal(state.status, STATUS_IDLE);
      assert.equal(state.moves, 0);
      assert.equal(state.matches, 0);
      assert.equal(state.scores.P1, 0);
      assert.equal(state.turn, PLAYER_1);
      assert.equal(state.board.length, 12);
      engine.destroy();
    });

    it('starts playing on first card flip', () => {
      const engine = new RunicMemoryEngine({ mode: MODE_SOLO, difficulty: 'novice', seed: 42 });
      const success = engine.flipCard(0);

      assert.equal(success, true);
      const state = engine.getState();
      assert.equal(state.status, STATUS_PLAYING);
      assert.equal(state.selectedIndices.length, 1);
      assert.equal(state.selectedIndices[0], 0);
      assert.equal(state.board[0].isFlipped, true);
      engine.destroy();
    });

    it('rejects flipping an already flipped card or invalid index', () => {
      const engine = new RunicMemoryEngine({ mode: MODE_SOLO, difficulty: 'novice', seed: 42 });
      assert.equal(engine.flipCard(0), true);
      assert.equal(engine.flipCard(0), false); // already flipped
      assert.equal(engine.flipCard(-1), false); // out of bounds
      assert.equal(engine.flipCard(99), false); // out of bounds
      engine.destroy();
    });
  });

  describe('3. Matching & Scoring Logic', () => {
    it('detects a match, locks cards in matched state, and awards points', () => {
      const engine = new RunicMemoryEngine({ mode: MODE_SOLO, difficulty: 'novice', seed: 42 });
      const board = engine.getState().board;

      // Find two cards with the same rune
      const firstCard = board[0];
      const matchingIndex = board.findIndex((c, idx) => idx !== 0 && c.runeId === firstCard.runeId);
      assert.ok(matchingIndex > 0);

      engine.flipCard(0);
      const successSecond = engine.flipCard(matchingIndex);
      assert.equal(successSecond, true);

      const state = engine.getState();
      assert.equal(state.matches, 1);
      assert.equal(state.moves, 1);
      assert.equal(state.combo, 1);
      assert.equal(state.scores.P1, 100);
      assert.equal(state.board[0].isMatched, true);
      assert.equal(state.board[matchingIndex].isMatched, true);
      assert.equal(state.selectedIndices.length, 0); // Reset for next turn
      engine.destroy();
    });

    it('handles a mismatch, resets combo, and flips back', () => {
      const engine = new RunicMemoryEngine({
        mode: MODE_PASS_AND_PLAY,
        difficulty: 'novice',
        seed: 42,
      });
      const board = engine.getState().board;

      // Find two cards with DIFFERENT runes
      const firstCard = board[0];
      const nonMatchingIndex = board.findIndex(
        (c, idx) => idx !== 0 && c.runeId !== firstCard.runeId,
      );
      assert.ok(nonMatchingIndex > 0);

      engine.flipCard(0);
      engine.flipCard(nonMatchingIndex);

      let state = engine.getState();
      assert.equal(state.matches, 0);
      assert.equal(state.moves, 1);
      assert.equal(state.combo, 0);
      assert.equal(state.status, 'checking');

      // Resolve mismatch
      engine.resolveMismatch(0, nonMatchingIndex);
      state = engine.getState();
      assert.equal(state.board[0].isFlipped, false);
      assert.equal(state.board[nonMatchingIndex].isFlipped, false);
      assert.equal(state.turn, PLAYER_2); // Turn switched to Player 2!
      engine.destroy();
    });
  });

  describe('4. Full Game Solitaire Clearance & Win', () => {
    it('completes the game when all pairs are matched', () => {
      const engine = new RunicMemoryEngine({ mode: MODE_SOLO, difficulty: 'novice', seed: 42 });
      const board = engine.getState().board;

      // Group all indices by runeId
      const runeMap = new Map<string, number[]>();
      board.forEach((c) => {
        const list = runeMap.get(c.runeId) || [];
        list.push(c.index);
        runeMap.set(c.runeId, list);
      });

      // Flip each pair sequentially
      for (const [, indices] of runeMap.entries()) {
        engine.flipCard(indices[0]);
        engine.flipCard(indices[1]);
      }

      const finalState = engine.getState();
      assert.equal(finalState.matches, 6);
      assert.equal(finalState.status, STATUS_COMPLETED);
      assert.equal(finalState.winner, PLAYER_1);
      assert.ok(finalState.scores.P1 > 0);
      engine.destroy();
    });
  });

  describe('5. Cognitive AI Memory Unit Tests', () => {
    it('remembers cards with high retention in hard difficulty', () => {
      const originalRandom = Math.random;
      Math.random = () => 0.5;
      try {
        const ai = new RunicMemoryAi('hard');
        const deck = createRunicDeck('novice', 100);

        // AI observes both matching cards
        const targetRune = deck[0].runeId;
        const pair = deck.filter((c) => c.runeId === targetRune);

        ai.observeCard(pair[0]);
        ai.observeCard(pair[1]);

        // Should pick the first card of known pair
        const firstPick = ai.chooseCard(deck, []);
        assert.ok(firstPick === pair[0].index || firstPick === pair[1].index);

        // Once first card is flipped, pick the second matching card
        const secondPick = ai.chooseCard(deck, [firstPick]);
        const expectedOther = firstPick === pair[0].index ? pair[1].index : pair[0].index;
        assert.equal(secondPick, expectedOther);
      } finally {
        Math.random = originalRandom;
      }
    });
  });
});
