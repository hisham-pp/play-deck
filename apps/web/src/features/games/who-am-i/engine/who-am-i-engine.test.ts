import assert from 'node:assert/strict';
import test, { describe } from 'node:test';

import {
  answerQuestion,
  askQuestion,
  createInitialState,
  isGuessMatch,
  passTurn,
  proceedToGuessing,
  submitGuess,
  tallyFinalScores,
} from './who-am-i-engine';

const MOCK_PLAYERS = [
  { id: 'p1', displayName: 'Alice', avatar: '👩', isHost: true, isBot: false },
  { id: 'p2', displayName: 'Bob', avatar: '🧔', isHost: false, isBot: true },
  { id: 'p3', displayName: 'Charlie', avatar: '🐱', isHost: false, isBot: true },
];

describe('Who Am I — Engine Tests', () => {
  describe('Initialization & Headband Assignment', () => {
    test('initializes with assigned identities and questioning phase', () => {
      const state = createInitialState(MOCK_PLAYERS);
      assert.equal(state.phase, 'questioning');
      assert.equal(state.players.length, 3);
      assert.equal(state.currentTurnPlayerId, 'p1');
      assert.ok(state.players[0]!.identity.name);
      assert.equal(state.players[0]!.isSolved, false);
    });

    test('supports category filtering', () => {
      const state = createInitialState(MOCK_PLAYERS, 'animals');
      for (const p of state.players) {
        assert.equal(p.identity.category, 'animals');
      }
    });
  });

  describe('Q&A Flow', () => {
    test('player asks a question and moves to answering phase', () => {
      const state = createInitialState(MOCK_PLAYERS);
      const asked = askQuestion(state, 'Am I an animal?');

      assert.equal(asked.phase, 'answering');
      assert.equal(asked.currentQuestion, 'Am I an animal?');
      assert.equal(asked.qaLog.length, 1);
      assert.equal(asked.players[0]!.questionsAsked, 1);
    });

    test('other players answer and auto transition to guessing once all answered', () => {
      const state = createInitialState(MOCK_PLAYERS);
      const asked = askQuestion(state, 'Am I alive?');

      const ans1 = answerQuestion(asked, 'p2', 'yes');
      assert.equal(ans1.phase, 'answering');

      const ans2 = answerQuestion(ans1, 'p3', 'yes');
      // All 2 other players answered!
      assert.equal(ans2.phase, 'guessing');
    });

    test('proceedToGuessing advances stage manually if needed', () => {
      const state = createInitialState(MOCK_PLAYERS);
      const asked = askQuestion(state, 'Am I fictional?');
      const guessing = proceedToGuessing(asked);
      assert.equal(guessing.phase, 'guessing');
    });
  });

  describe('Guessing & Identity Matching', () => {
    test('matches guesses accurately with fuzzy case insensitivity', () => {
      assert.equal(isGuessMatch('Sherlock Holmes', 'Sherlock Holmes'), true);
      assert.equal(isGuessMatch('sherlock', 'Sherlock Holmes'), true);
      assert.equal(isGuessMatch('bald eagle', 'Bald Eagle'), true);
      assert.equal(isGuessMatch('elephant', 'Penguin'), false);
    });

    test('correct guess marks player as solved and awards score', () => {
      const state = createInitialState(MOCK_PLAYERS);
      const asked = askQuestion(state, 'Am I alive?');
      const guessing = proceedToGuessing(asked);

      const targetIdentityName = guessing.players[0]!.identity.name;
      const guessed = submitGuess(guessing, 'p1', targetIdentityName);

      const p1 = guessed.players.find((p) => p.id === 'p1');
      assert.equal(p1?.isSolved, true);
      assert.ok((p1?.score ?? 0) > 0);
      assert.equal(guessed.currentTurnPlayerId, 'p2');
    });

    test('incorrect guess penalizes player and advances turn', () => {
      const state = createInitialState(MOCK_PLAYERS);
      const asked = askQuestion(state, 'Am I alive?');
      const guessing = proceedToGuessing(asked);

      const wrong = submitGuess(guessing, 'p1', 'CompletelyWrongNameXYZ');
      const p1 = wrong.players.find((p) => p.id === 'p1');
      assert.equal(p1?.isSolved, false);
      assert.equal(p1?.wrongGuesses, 1);
      assert.equal(wrong.currentTurnPlayerId, 'p2');
    });

    test('passTurn advances turn to next player', () => {
      const state = createInitialState(MOCK_PLAYERS);
      const passed = passTurn(state, 'p1');
      assert.equal(passed.currentTurnPlayerId, 'p2');
    });
  });

  describe('Final Scoring & Detective Award', () => {
    test('awards Master Detective bonus to player with fewest questions among solved', () => {
      const state = createInitialState(MOCK_PLAYERS);
      state.players[0]!.isSolved = true;
      state.players[0]!.questionsAsked = 2;
      state.players[0]!.score = 300;

      state.players[1]!.isSolved = true;
      state.players[1]!.questionsAsked = 5;
      state.players[1]!.score = 250;

      const finalized = tallyFinalScores(state);
      const p1 = finalized.players.find((p) => p.id === 'p1');
      assert.equal(p1?.score, 450); // 300 + 150
      assert.ok(p1?.awardsReceived.some((a) => a.includes('Master Detective')));
    });
  });
});
