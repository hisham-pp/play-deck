import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { WordChainPlayer } from '../types/word-chain.types';
import { TEAM_A } from './word-chain-constants';
import {
  applySurvivalBonuses,
  isSpeedAnswer,
  scoreWord,
  survivalBonus,
  topScorers,
} from './word-chain-scoring';

function player(overrides: Partial<WordChainPlayer> = {}): WordChainPlayer {
  return {
    id: 'p1',
    name: 'Ada',
    team: TEAM_A,
    lives: 3,
    score: 0,
    wordsPlayed: 0,
    longestWord: '',
    eliminated: false,
    ...overrides,
  };
}

describe('scoreWord', () => {
  it('pays the base points for a word at the minimum length', () => {
    assert.deepEqual(scoreWord('cat', 3, 10_000, 15), { points: 5, isSpeedBonus: false });
  });

  it('pays two points for every letter beyond the minimum', () => {
    assert.deepEqual(scoreWord('cathedral', 3, 10_000, 15), { points: 17, isSpeedBonus: false });
  });

  it('adds the speed bonus for a fast answer', () => {
    assert.deepEqual(scoreWord('cat', 3, 1_000, 15), { points: 8, isSpeedBonus: true });
  });

  it('never charges for being under the minimum length', () => {
    assert.equal(scoreWord('ox', 3, 10_000, 15).points, 5);
  });
});

describe('isSpeedAnswer', () => {
  it('is true inside the opening 40% of the clock', () => {
    assert.equal(isSpeedAnswer(5_999, 15), true);
    assert.equal(isSpeedAnswer(6_001, 15), false);
  });

  it('is false when there is no clock', () => {
    assert.equal(isSpeedAnswer(0, 0), false);
  });
});

describe('survival bonuses', () => {
  it('pays ten points per remaining life', () => {
    assert.equal(survivalBonus(player({ lives: 2 })), 20);
  });

  it('pays nothing to an eliminated player', () => {
    assert.equal(survivalBonus(player({ lives: 2, eliminated: true })), 0);
  });

  it('folds the bonus into every score at once', () => {
    const [alive, out] = applySurvivalBonuses([
      player({ id: 'p1', score: 10, lives: 1 }),
      player({ id: 'p2', score: 40, lives: 0, eliminated: true }),
    ]);
    assert.equal(alive.score, 20);
    assert.equal(out.score, 40);
  });
});

describe('topScorers', () => {
  it('returns everyone tied at the top', () => {
    const ids = topScorers([
      player({ id: 'p1', score: 30 }),
      player({ id: 'p2', score: 30 }),
      player({ id: 'p3', score: 10 }),
    ]);
    assert.deepEqual(ids, ['p1', 'p2']);
  });

  it('handles an empty table', () => {
    assert.deepEqual(topScorers([]), []);
  });
});
