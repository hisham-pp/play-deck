import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { AnagramPlayer } from '../types/anagram-sprint.types';
import { BASE_POINTS, MAX_SPEED_BONUS, TEAM_A, TEAM_B } from './anagram-constants';
import { rankPlayers, remainingFraction, scoreAnswer, teamScore } from './anagram-scoring';

function player(overrides: Partial<AnagramPlayer> = {}): AnagramPlayer {
  return {
    id: 'p1',
    name: 'Ada',
    avatar: '🔤',
    team: TEAM_A,
    score: 0,
    streak: 0,
    bestStreak: 0,
    solved: 0,
    missed: 0,
    lives: 3,
    eliminated: false,
    fastestMs: null,
    ...overrides,
  };
}

const ROUND = { roundSeconds: 30, elapsedMs: 15000, streak: 1 } as const;

describe('Anagram Sprint — scoring', () => {
  it('pays an instant first-place answer the full base plus the full speed bonus', () => {
    const score = scoreAnswer({ ...ROUND, difficulty: 'hard', placement: 1, elapsedMs: 0 });
    assert.equal(score.base, BASE_POINTS.hard);
    assert.equal(score.speedBonus, MAX_SPEED_BONUS);
    assert.equal(score.streakBonus, 0);
  });

  it('decays the base for each later finisher', () => {
    const bases = [1, 2, 3, 4, 8].map(
      (placement) => scoreAnswer({ ...ROUND, difficulty: 'medium', placement }).base,
    );
    assert.deepEqual(bases, [75, 60, 49, 38, 38]);
  });

  it('gives no speed bonus to an answer that lands on the buzzer', () => {
    const score = scoreAnswer({ ...ROUND, difficulty: 'easy', placement: 1, elapsedMs: 30000 });
    assert.equal(score.speedBonus, 0);
  });

  it('clamps the clock fraction at both ends', () => {
    assert.equal(remainingFraction(-500, 30), 1);
    assert.equal(remainingFraction(99000, 30), 0);
    assert.equal(remainingFraction(1000, 0), 0);
  });

  it('adds a streak bonus that stops growing after five in a row', () => {
    const bonuses = [1, 2, 6, 7, 20].map(
      (streak) => scoreAnswer({ ...ROUND, difficulty: 'easy', placement: 1, streak }).streakBonus,
    );
    assert.deepEqual(bonuses, [0, 10, 50, 50, 50]);
  });

  it('totals the three levers', () => {
    const score = scoreAnswer({
      difficulty: 'medium',
      placement: 2,
      elapsedMs: 9000,
      roundSeconds: 30,
      streak: 3,
    });
    assert.equal(score.points, score.base + score.speedBonus + score.streakBonus);
  });
});

describe('Anagram Sprint — standings', () => {
  it('pools a team score', () => {
    const players = [
      player({ id: 'a', score: 120 }),
      player({ id: 'b', score: 80 }),
      player({ id: 'c', team: TEAM_B, score: 150 }),
    ];
    assert.equal(teamScore(players, TEAM_A), 200);
    assert.equal(teamScore(players, TEAM_B), 150);
  });

  it('ranks by score, then words solved, then name', () => {
    const ranked = rankPlayers([
      player({ id: 'c', name: 'Cleo', score: 100, solved: 2 }),
      player({ id: 'a', name: 'Ada', score: 100, solved: 2 }),
      player({ id: 'b', name: 'Bo', score: 100, solved: 5 }),
      player({ id: 'd', name: 'Dee', score: 300 }),
    ]);
    assert.deepEqual(
      ranked.map((entry) => entry.id),
      ['d', 'b', 'a', 'c'],
    );
  });
});
