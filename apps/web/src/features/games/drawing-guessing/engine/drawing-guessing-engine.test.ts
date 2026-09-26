import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  addStroke,
  clearCanvas,
  createInitialDrawingState,
  getEditDistance,
  getMaskedWord,
  getThreeWordOptions,
  nextRound,
  selectSecretWord,
  stepDrawingTimer,
  submitGuess,
  undoLastStroke,
  type DrawingStroke,
} from './drawing-guessing-engine';

describe('Drawing & Guessing Engine', () => {
  describe('State Initialization', () => {
    it('initializes with default players, rounds, and phase', () => {
      const state = createInitialDrawingState();
      assert.equal(state.players.length, 4);
      assert.equal(state.players[0].isBot, false);
      assert.equal(state.players[1].isBot, true);
      assert.equal(state.currentRound, 1);
      assert.equal(state.maxRounds, 3);
      assert.equal(state.roundDuration, 60);
      assert.equal(state.timerSeconds, 60);
      assert.equal(state.phase, 'selecting_word');
      assert.equal(state.strokes.length, 0);
      assert.equal(state.winnerId, null);
    });

    it('generates 3 word options across difficulty tiers', () => {
      const options = getThreeWordOptions();
      assert.equal(options.length, 3);
      assert.equal(options[0].difficulty, 'easy');
      assert.equal(options[1].difficulty, 'medium');
      assert.equal(options[2].difficulty, 'hard');
    });
  });

  describe('Word Selection & Drawing Phase', () => {
    it('sets secret word and transitions to drawing phase', () => {
      const state = createInitialDrawingState();
      selectSecretWord(state, 'rocket');
      assert.equal(state.secretWord, 'ROCKET');
      assert.equal(state.phase, 'drawing');
      assert.equal(state.timerSeconds, 60);
      assert.equal(state.revealedIndices.length, 0);
    });

    it('manages canvas strokes: add, undo, clear', () => {
      const state = createInitialDrawingState();
      selectSecretWord(state, 'CAT');

      const stroke1: DrawingStroke = {
        id: 's1',
        color: '#000000',
        size: 4,
        points: [
          { x: 10, y: 10 },
          { x: 20, y: 20 },
        ],
      };
      const stroke2: DrawingStroke = {
        id: 's2',
        color: '#ff0000',
        size: 6,
        points: [{ x: 30, y: 30 }],
      };

      addStroke(state, stroke1);
      addStroke(state, stroke2);
      assert.equal(state.strokes.length, 2);

      undoLastStroke(state);
      assert.equal(state.strokes.length, 1);
      assert.equal(state.strokes[0].id, 's1');

      clearCanvas(state);
      assert.equal(state.strokes.length, 0);
    });
  });

  describe('Levenshtein Distance & Guess Validation', () => {
    it('calculates edit distances correctly', () => {
      assert.equal(getEditDistance('CAT', 'CAT'), 0);
      assert.equal(getEditDistance('CAT', 'CAR'), 1);
      assert.equal(getEditDistance('CAT', 'BAT'), 1);
      assert.equal(getEditDistance('CAT', 'DOG'), 3);
      assert.equal(getEditDistance('ROBOT', 'ROBOTS'), 1);
    });

    it('prevents drawer from guessing their own secret word', () => {
      const state = createInitialDrawingState();
      selectSecretWord(state, 'PIZZA');

      const drawerId = state.players[state.currentDrawerIndex].id;
      const res = submitGuess(state, drawerId, 'PIZZA');
      assert.equal(res.isCorrect, false);
      assert.match(res.message, /drawer cannot guess/i);
    });

    it('detects near-misses for 1-letter typos', () => {
      const state = createInitialDrawingState();
      selectSecretWord(state, 'CASTLE');

      const guesserId = state.players[1].id;
      const res = submitGuess(state, guesserId, 'CAZTLE');
      assert.equal(res.isCorrect, false);
      assert.equal(res.isNearMiss, true);
      assert.match(res.message, /so close/i);
    });

    it('handles exact matches, scores points, and bonuses', () => {
      const state = createInitialDrawingState();
      selectSecretWord(state, 'SUN');

      const guesser = state.players[1];
      const drawer = state.players[0];
      const res = submitGuess(state, guesser.id, 'SUN');

      assert.equal(res.isCorrect, true);
      assert.ok(res.pointsAwarded > 100);
      assert.equal(guesser.hasGuessed, true);
      assert.equal(guesser.score, res.pointsAwarded);
      assert.equal(drawer.score, 50); // Drawer bonus

      // Submitting again fails
      const secondTry = submitGuess(state, guesser.id, 'SUN');
      assert.equal(secondTry.isCorrect, false);
      assert.match(secondTry.message, /already guessed/i);
    });

    it('automatically ends round when all non-drawers have guessed', () => {
      const state = createInitialDrawingState({ playerCount: 3 });
      selectSecretWord(state, 'APPLE');

      // Player 0 is drawer. Players 1 and 2 guess correctly.
      submitGuess(state, state.players[1].id, 'APPLE');
      assert.equal(state.phase, 'drawing');

      submitGuess(state, state.players[2].id, 'APPLE');
      assert.equal(state.phase, 'round_reveal');
    });
  });

  describe('Timer & Hints', () => {
    it('reveals letters progressively as time decreases', () => {
      const state = createInitialDrawingState();
      selectSecretWord(state, 'VOLCANO'); // length 7

      // At 60s, no letters revealed
      assert.equal(state.revealedIndices.length, 0);

      // Advance timer to 35s (>50% remaining, <=60%)
      stepDrawingTimer(state, 25);
      assert.equal(state.revealedIndices.length, 1);
      assert.equal(state.revealedIndices[0], 0); // 'V' revealed

      // Advance timer to 15s (<=30% remaining)
      stepDrawingTimer(state, 20);
      assert.equal(state.revealedIndices.length, 2);
      assert.equal(state.revealedIndices[1], 3); // Middle letter 'C' revealed
    });

    it('ends round when timer runs out', () => {
      const state = createInitialDrawingState();
      selectSecretWord(state, 'FISH');
      stepDrawingTimer(state, 61);

      assert.equal(state.phase, 'round_reveal');
      assert.equal(state.timerSeconds, 0);
    });

    it('generates correct masked word string', () => {
      assert.equal(getMaskedWord('SUN', []), '_ _ _');
      assert.equal(getMaskedWord('SUN', [0]), 'S _ _');
      assert.equal(getMaskedWord('SUN', [0, 2]), 'S _ N');
    });
  });

  describe('Round & Match Progression', () => {
    it('advances through rounds, rotates drawers, and ends game', () => {
      const state = createInitialDrawingState({ playerCount: 2, maxRounds: 1 });
      assert.equal(state.currentDrawerIndex, 0);

      // Drawer 0 finishes round
      nextRound(state);
      assert.equal(state.currentDrawerIndex, 1);
      assert.equal(state.currentRound, 1);
      assert.equal(state.phase, 'selecting_word');

      // Drawer 1 finishes round -> round 2 > maxRounds 1 -> game_over
      nextRound(state);
      assert.equal(state.phase, 'game_over');
      assert.ok(state.winnerId !== null);
    });
  });
});
