import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { HONEYCOMB_PUZZLES } from './puzzle-bank';
import {
  applyMultiplayerBonuses,
  calculateRank,
  isPangramWord,
  scoreWord,
  shuffleOuterLetters,
  validateSubmission,
} from './spelling-bee-engine';

describe('Spelling Bee Engine Tests', () => {
  const puzzle = HONEYCOMB_PUZZLES[0]; // center 'P', outer: A, C, E, I, R, T

  describe('Word Validation & Scoring', () => {
    it('rejects words shorter than 4 letters', () => {
      const res = validateSubmission('PAT', puzzle, []);
      assert.strictEqual(res.isValid, false);
      assert.strictEqual(res.reason, 'too-short');
    });

    it('rejects words missing the center letter', () => {
      const res = validateSubmission('CARE', puzzle, []);
      assert.strictEqual(res.isValid, false);
      assert.strictEqual(res.reason, 'missing-center');
    });

    it('rejects words containing letters not in honeycomb', () => {
      const res = validateSubmission('PUPPY', puzzle, []);
      assert.strictEqual(res.isValid, false);
      assert.strictEqual(res.reason, 'invalid-letter');
    });

    it('rejects words already found', () => {
      const res = validateSubmission('PACE', puzzle, ['PACE']);
      assert.strictEqual(res.isValid, false);
      assert.strictEqual(res.reason, 'already-found');
    });

    it('scores 4-letter words with exactly 1 point', () => {
      const res = validateSubmission('PACE', puzzle, []);
      assert.strictEqual(res.isValid, true);
      assert.strictEqual(res.score, 1);
      assert.strictEqual(res.isPangram, false);
    });

    it('scores 5+ letter words equal to their length', () => {
      const res = validateSubmission('PRICE', puzzle, []);
      assert.strictEqual(res.isValid, true);
      assert.strictEqual(res.score, 5);
      assert.strictEqual(res.isPangram, false);
    });

    it('awards +7 bonus points for pangrams using all 7 letters', () => {
      const res = validateSubmission('PRACTICE', puzzle, []);
      assert.strictEqual(res.isValid, true);
      assert.strictEqual(res.isPangram, true);
      // 8 letters + 7 bonus = 15 points
      assert.strictEqual(res.score, 15);
    });

    it('correctly checks isPangramWord helper', () => {
      assert.strictEqual(isPangramWord('PRACTICE', puzzle), true);
      assert.strictEqual(isPangramWord('PACE', puzzle), false);
    });

    it('computes scoreWord helper accurately', () => {
      assert.strictEqual(scoreWord('CAT', false), 0);
      assert.strictEqual(scoreWord('PACE', false), 1);
      assert.strictEqual(scoreWord('PRICE', false), 5);
      assert.strictEqual(scoreWord('PRACTICE', true), 15);
    });
  });

  describe('Rank Progression', () => {
    it('maps scores accurately across percentage thresholds', () => {
      assert.strictEqual(calculateRank(0, 100), 'Beginner');
      assert.strictEqual(calculateRank(10, 100), 'Good');
      assert.strictEqual(calculateRank(20, 100), 'Solid');
      assert.strictEqual(calculateRank(35, 100), 'Great');
      assert.strictEqual(calculateRank(50, 100), 'Amazing');
      assert.strictEqual(calculateRank(70, 100), 'Genius');
      assert.strictEqual(calculateRank(100, 100), 'Queen Bee');
    });
  });

  describe('Multiplayer Unique Word Bonuses', () => {
    it('awards +3 bonus for words found by only one player', () => {
      const players = [
        {
          id: 'p1',
          displayName: 'Player 1',
          avatar: '🐝',
          isHost: true,
          isBot: false,
          score: 6,
          foundWords: [
            { word: 'PACE', score: 1, isPangram: false, discoveredAt: 1 },
            { word: 'PRICE', score: 5, isPangram: false, discoveredAt: 2 },
          ],
          rank: 'Good' as const,
        },
        {
          id: 'p2',
          displayName: 'Player 2',
          avatar: '🍯',
          isHost: false,
          isBot: true,
          score: 1,
          foundWords: [{ word: 'PACE', score: 1, isPangram: false, discoveredAt: 3 }],
          rank: 'Beginner' as const,
        },
      ];

      const resolved = applyMultiplayerBonuses(players);
      // 'PACE' was found by both -> 0 bonus
      // 'PRICE' was only found by p1 -> +3 bonus (6 + 3 = 9)
      assert.strictEqual(resolved[0].score, 9);
      // p2 had no unique words -> 1
      assert.strictEqual(resolved[1].score, 1);
    });
  });

  describe('Shuffle', () => {
    it('preserves all outer letter elements', () => {
      const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
      const shuffled = shuffleOuterLetters(letters);
      assert.strictEqual(shuffled.length, letters.length);
      assert.deepStrictEqual([...shuffled].sort(), [...letters].sort());
    });
  });
});
