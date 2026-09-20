import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { HangmanRules } from '../types/hangman-duel.types';
import { filterWords, getRandomWord, validateCustomWord } from './hangman-bank';
import {
  DEFAULT_ALLOWED_MISSES,
  DEFAULT_TOTAL_ROUNDS,
  DEFAULT_TURN_SECONDS,
  MODE_BATTLE,
  MODE_CLASSIC,
  MODE_SOLO,
  MODE_SPEED,
  POINTS_FOR_SOLVE,
  POINTS_PER_CORRECT_LETTER,
  STATUS_FINISHED,
  STATUS_GUESSING,
  STATUS_ROUND_OVER,
  STATUS_WORD_SELECT,
} from './hangman-constants';
import {
  createInitialState,
  getMaskedWord,
  proceedToNextRound,
  startRound,
  submitLetterGuess,
  submitWordSolve,
} from './hangman-engine';

const BASE_RULES: HangmanRules = {
  mode: MODE_CLASSIC,
  category: 'animals',
  difficulty: 'easy',
  allowedMisses: DEFAULT_ALLOWED_MISSES,
  totalRounds: DEFAULT_TOTAL_ROUNDS,
  turnSeconds: DEFAULT_TURN_SECONDS,
  showCategory: true,
  revealFirstLetter: false,
};

describe('Hangman Duel — Word Bank', () => {
  it('filters words by category and difficulty', () => {
    const easyAnimals = filterWords('animals', 'easy');
    assert.ok(easyAnimals.length > 0);
    assert.ok(easyAnimals.every((w) => w.category === 'animals' && w.difficulty === 'easy'));
  });

  it('draws a random word within limits', () => {
    const word = getRandomWord('food', 'medium', () => 0.5);
    assert.ok(word.word.length >= 3);
    assert.equal(word.category, 'food');
  });

  it('validates custom words strictly', () => {
    assert.equal(validateCustomWord('ab').valid, false); // too short
    assert.equal(validateCustomWord('supercalifragilisticexpialidocious').valid, false); // too long
    assert.equal(validateCustomWord('cat123').valid, false); // non-alpha
    assert.equal(validateCustomWord('  Tiger  ').valid, true);
    assert.equal(validateCustomWord('  Tiger  ').sanitized, 'tiger');
  });
});

describe('Hangman Duel — Engine Simulation', () => {
  it('initializes state for classic mode with setter and guesser', () => {
    const players = [
      { id: 'p1', name: 'Alice' },
      { id: 'p2', name: 'Bob' },
      { id: 'p3', name: 'Charlie' },
    ];
    const state = createInitialState(BASE_RULES, players);

    assert.equal(state.status, STATUS_WORD_SELECT);
    assert.equal(state.round, 1);
    assert.equal(state.setterIndex, 0); // Alice sets word
    assert.equal(state.turnIndex, 1); // Bob guesses first
    assert.equal(state.players.length, 3);
  });

  it('handles letter reveals, multiple occurrences, and masked words', () => {
    const players = [
      { id: 'p1', name: 'Alice' },
      { id: 'p2', name: 'Bob' },
    ];
    const state = createInitialState(BASE_RULES, players);
    startRound(state, 'banana', 'food');

    assert.equal(state.status, STATUS_GUESSING);
    assert.deepEqual(getMaskedWord(state, 'p2'), ['_', '_', '_', '_', '_', '_']);

    // Bob guesses 'a' (occurs 3 times: +3 + 1 + 1 = 5 pts)
    const res = submitLetterGuess(state, 'p2', 'a');
    assert.equal(res.success, true);
    assert.equal(res.isCorrect, true);
    assert.equal(state.players[1]!.score, 5);
    assert.deepEqual(getMaskedWord(state, 'p2'), ['_', 'a', '_', 'a', '_', 'a']);
  });

  it('enforces turn order and prevents duplicate guesses', () => {
    const players = [
      { id: 'p1', name: 'Alice' },
      { id: 'p2', name: 'Bob' },
      { id: 'p3', name: 'Charlie' },
    ];
    const state = createInitialState(BASE_RULES, players);
    startRound(state, 'tiger', 'animals');

    // Charlie tries to guess when it is Bob's turn
    const wrongTurn = submitLetterGuess(state, 'p3', 'e');
    assert.equal(wrongTurn.success, false);
    assert.equal(wrongTurn.rejection, 'not-your-turn');

    // Bob guesses 't' correctly
    const bobGuess = submitLetterGuess(state, 'p2', 't');
    assert.equal(bobGuess.success, true);
    assert.equal(state.turnIndex, 2); // now Charlie's turn

    // Charlie guesses already guessed 't'
    const dupGuess = submitLetterGuess(state, 'p3', 't');
    assert.equal(dupGuess.success, false);
    assert.equal(dupGuess.rejection, 'already-guessed');
  });

  it('awards solve bonus upon full word completion', () => {
    const players = [
      { id: 'p1', name: 'Alice' },
      { id: 'p2', name: 'Bob' },
    ];
    const state = createInitialState(BASE_RULES, players);
    startRound(state, 'cat', 'animals');

    submitLetterGuess(state, 'p2', 'c');
    submitLetterGuess(state, 'p2', 'a');
    const finalGuess = submitLetterGuess(state, 'p2', 't');

    assert.equal(finalGuess.isCorrect, true);
    assert.equal(state.status, STATUS_ROUND_OVER);
    assert.equal(state.roundOutcome?.solvedById, 'p2');
    assert.ok(state.players[1]!.score >= POINTS_FOR_SOLVE + 3 * POINTS_PER_CORRECT_LETTER);
  });

  it('supports instant full-word solve attempts', () => {
    const players = [
      { id: 'p1', name: 'Alice' },
      { id: 'p2', name: 'Bob' },
    ];
    const state = createInitialState(BASE_RULES, players);
    startRound(state, 'dolphin', 'animals');

    const solve = submitWordSolve(state, 'p2', 'dolphin');
    assert.equal(solve.success, true);
    assert.equal(solve.isCorrect, true);
    assert.equal(state.status, STATUS_ROUND_OVER);
    assert.equal(state.roundOutcome?.solvedByName, 'Bob');
  });

  it('awards defense bonus to setter when guessers run out of misses', () => {
    const rules: HangmanRules = { ...BASE_RULES, allowedMisses: 2 };
    const players = [
      { id: 'p1', name: 'Alice' },
      { id: 'p2', name: 'Bob' },
    ];
    const state = createInitialState(rules, players);
    startRound(state, 'fox', 'animals');

    submitLetterGuess(state, 'p2', 'z'); // miss 1
    submitLetterGuess(state, 'p2', 'q'); // miss 2 -> out

    assert.equal(state.status, STATUS_ROUND_OVER);
    assert.equal(state.roundOutcome?.solvedById, null);
    assert.equal(state.roundOutcome?.setterId, 'p1');
    assert.ok(state.players[0]!.score > 0); // Alice got defense bonus
  });

  it('isolates boards in battle mode', () => {
    const rules: HangmanRules = { ...BASE_RULES, mode: MODE_BATTLE, allowedMisses: 2 };
    const players = [
      { id: 'p1', name: 'Alice' },
      { id: 'p2', name: 'Bob' },
    ];
    const state = createInitialState(rules, players);
    startRound(state, 'wolf', 'animals');

    // Bob misses 'z'
    submitLetterGuess(state, 'p2', 'z');
    assert.equal(state.boards['p2']!.wrongCount, 1);
    assert.equal(state.boards['p1']!.wrongCount, 0); // Alice's board is untouched
  });

  it('rotates setter and completes match after total rounds', () => {
    const rules: HangmanRules = { ...BASE_RULES, totalRounds: 2 };
    const players = [
      { id: 'p1', name: 'Alice' },
      { id: 'p2', name: 'Bob' },
    ];
    const state = createInitialState(rules, players);
    startRound(state, 'cat', 'animals');
    submitWordSolve(state, 'p2', 'cat');

    // Proceed to round 2
    proceedToNextRound(state);
    assert.equal(state.round, 2);
    assert.equal(state.setterIndex, 1); // Now Bob is setter
    assert.equal(state.status, STATUS_WORD_SELECT);

    startRound(state, 'dog', 'animals');
    submitWordSolve(state, 'p1', 'dog');

    // Finish match
    proceedToNextRound(state);
    assert.equal(state.status, STATUS_FINISHED);
    assert.ok(state.winnerIds.length > 0);
  });

  it('awards speed bonus in speed mode when guessing quickly', () => {
    const rules: HangmanRules = { ...BASE_RULES, mode: MODE_SPEED, turnSeconds: 15 };
    const players = [
      { id: 'p1', name: 'Alice' },
      { id: 'p2', name: 'Bob' },
    ];
    const state = createInitialState(rules, players);
    startRound(state, 'lion', 'animals');

    // Bob guesses 'l' immediately (within speed bonus threshold)
    const res = submitLetterGuess(state, 'p2', 'l', state.turnStartedAt + 1000);
    assert.equal(res.success, true);
    assert.equal(res.isCorrect, true);
    assert.equal(state.players[1]!.score, POINTS_PER_CORRECT_LETTER + 1); // got speed bonus (+1)
  });

  it('runs solo mode without word setter phase', () => {
    const rules: HangmanRules = { ...BASE_RULES, mode: MODE_SOLO, totalRounds: 1 };
    const players = [{ id: 'p1', name: 'Alice' }];
    const state = createInitialState(rules, players);

    assert.equal(state.status, STATUS_GUESSING);
    assert.equal(state.setterIndex, -1);
    startRound(state, 'fox', 'animals');

    const res = submitLetterGuess(state, 'p1', 'f');
    assert.equal(res.success, true);
  });
});
