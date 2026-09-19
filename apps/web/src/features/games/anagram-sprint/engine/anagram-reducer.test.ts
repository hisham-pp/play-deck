import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { AnagramRules, AnagramSeat, AnagramState } from '../types/anagram-sprint.types';
import {
  DEFAULT_RULES,
  MODE_CLASSIC,
  MODE_SURVIVAL,
  MODE_TEAM,
  TEAM_A,
  TEAM_B,
} from './anagram-constants';
import { anagramReducer } from './anagram-reducer';
import { currentRound } from './anagram-state';

const SEATS: AnagramSeat[] = [
  { id: 'p1', name: 'Ada', avatar: '🔤', team: TEAM_A },
  { id: 'p2', name: 'Bo', avatar: '🔤', team: TEAM_B },
];

function start(overrides: Partial<AnagramRules> = {}, seats = SEATS): AnagramState {
  const rules: AnagramRules = { ...DEFAULT_RULES, mode: MODE_CLASSIC, ...overrides };
  const dealt = anagramReducer(undefined as never, { type: 'start', rules, seats, seed: 2026 });
  return anagramReducer(dealt, { type: 'begin', now: 0 });
}

function answerOf(state: AnagramState): string {
  return currentRound(state)?.entry.word ?? '';
}

function solve(state: AnagramState, playerId: string, elapsedMs: number): AnagramState {
  return anagramReducer(state, { type: 'answer', playerId, word: answerOf(state), elapsedMs });
}

describe('Anagram Sprint — match flow', () => {
  it('deals the whole card up front from the seed', () => {
    const state = start();
    assert.equal(state.plan.length, state.rules.totalRounds);
    assert.equal(state.status, 'playing');
    assert.equal(new Set(state.plan.map((round) => round.entry.word)).size, state.plan.length);
  });

  it('builds an identical card for peers sharing a seed', () => {
    assert.deepEqual(
      start().plan.map((round) => [round.entry.word, round.scrambled]),
      start().plan.map((round) => [round.entry.word, round.scrambled]),
    );
  });

  it('ramps the difficulty across the match', () => {
    const { plan } = start();
    assert.equal(plan[0].entry.difficulty, 'easy');
    assert.equal(plan[plan.length - 1].entry.difficulty, 'hard');
  });

  it('settles the round once everyone has answered', () => {
    let state = solve(start(), 'p1', 2000);
    assert.equal(state.status, 'playing');
    state = solve(state, 'p2', 5000);
    assert.equal(state.status, 'round-summary');
  });

  it('ranks by the clock, not by the order answers arrived', () => {
    let state = solve(start(), 'p2', 9000);
    state = solve(state, 'p1', 1000);

    assert.deepEqual(
      state.results.map((result) => result.playerId),
      ['p1', 'p2'],
    );
    assert.equal(state.results[0].placement, 1);
    const [ada, bo] = state.players;
    assert.ok(ada.score > bo.score, 'the faster seat should score more');
  });

  it('pays nothing until the round settles', () => {
    const state = solve(start(), 'p1', 1000);
    assert.equal(state.players[0].score, 0);
    assert.equal(state.results[0].points, 0);
  });

  it('spends an attempt on a real rearrangement but not on a typo', () => {
    let state = start();
    const word = answerOf(state);
    state = anagramReducer(state, { type: 'answer', playerId: 'p1', word: 'zzz', elapsedMs: 10 });
    assert.equal(state.lastRejection, 'wrong-letters');
    assert.equal(state.attemptsUsed.p1 ?? 0, 0);

    const jumbled = [...word].reverse().join('');
    state = anagramReducer(state, { type: 'answer', playerId: 'p1', word: jumbled, elapsedMs: 20 });
    assert.equal(state.lastRejection, 'not-a-solution');
    assert.equal(state.attemptsUsed.p1, 1);
  });

  it('locks a seat out of a word once its attempts are gone', () => {
    let state = start({ maxAttempts: 1 });
    const jumbled = [...answerOf(state)].sort().join('');
    state = anagramReducer(state, { type: 'answer', playerId: 'p1', word: jumbled, elapsedMs: 10 });
    state = anagramReducer(state, { type: 'answer', playerId: 'p1', word: jumbled, elapsedMs: 20 });
    assert.equal(state.lastRejection, 'no-attempts-left');
  });

  it('refuses a second answer from a seat that is already home', () => {
    let state = solve(start(), 'p1', 100);
    state = solve(state, 'p1', 200);
    assert.equal(state.lastRejection, 'too-late');
    assert.equal(state.results.length, 1);
  });

  it('reveals the answer and charges the misses when the clock expires', () => {
    let state = anagramReducer(start(), { type: 'expire' });
    assert.equal(state.status, 'round-summary');
    assert.deepEqual(state.history[0].missedIds, ['p1', 'p2']);
    assert.equal(state.players[0].missed, 1);

    state = anagramReducer(state, { type: 'next-round', now: 1000 });
    assert.equal(state.status, 'playing');
    assert.equal(state.roundIndex, 1);
    assert.deepEqual(state.results, []);
  });

  it('builds a streak and breaks it on a miss', () => {
    let state = start();
    for (let round = 0; round < 3; round += 1) {
      state = solve(state, 'p1', 1000);
      state = anagramReducer(state, { type: 'expire' });
      state = anagramReducer(state, { type: 'next-round', now: round * 1000 });
    }
    assert.equal(state.players[0].streak, 3);
    assert.equal(state.players[0].bestStreak, 3);

    state = anagramReducer(state, { type: 'expire' });
    assert.equal(state.players[0].streak, 0);
    assert.equal(state.players[0].bestStreak, 3);
  });
});

describe('Anagram Sprint — endings', () => {
  it('ends the match after the last word', () => {
    let state = start({ totalRounds: 2 });
    state = anagramReducer(solve(state, 'p1', 1000), { type: 'expire' });
    state = anagramReducer(state, { type: 'next-round', now: 1 });
    state = anagramReducer(solve(state, 'p1', 1000), { type: 'expire' });

    assert.equal(state.status, 'finished');
    assert.deepEqual(state.winnerIds, ['p1']);
  });

  it('eliminates a survival seat out of lives and ends on the last one standing', () => {
    let state = start({ mode: MODE_SURVIVAL, lives: 1, totalRounds: 10 });
    state = anagramReducer(solve(state, 'p1', 500), { type: 'expire' });

    assert.equal(state.players[1].eliminated, true);
    assert.equal(state.status, 'finished');
    assert.deepEqual(state.winnerIds, ['p1']);
  });

  it('leaves a solo survival run that runs out of lives with no winner', () => {
    const solo = [SEATS[0]];
    let state = start({ mode: MODE_SURVIVAL, lives: 2, totalRounds: 10 }, solo);

    state = anagramReducer(state, { type: 'expire' });
    assert.equal(state.status, 'round-summary');
    state = anagramReducer(state, { type: 'next-round', now: 1 });
    state = anagramReducer(state, { type: 'expire' });

    assert.equal(state.status, 'finished');
    assert.equal(state.players[0].eliminated, true);
    assert.deepEqual(state.winnerIds, []);
  });

  it('hands a team match to the side with the pooled lead', () => {
    let state = start({ mode: MODE_TEAM, totalRounds: 1 });
    state = anagramReducer(solve(state, 'p2', 500), { type: 'expire' });

    assert.equal(state.status, 'finished');
    assert.equal(state.winningTeam, TEAM_B);
    assert.deepEqual(state.winnerIds, ['p2']);
  });
});
