import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type {
  WordChainRules,
  WordChainSetupPlayer,
  WordChainState,
} from '../types/word-chain.types';
import {
  DEFAULT_RULES,
  MODE_POINTS,
  MODE_SOLO,
  MODE_TEAM,
  TEAM_A,
  TEAM_B,
  VARIANT_LENGTH_REQUIREMENT,
} from './word-chain-constants';
import { wordChainReducer } from './word-chain-reducer';

const KNOWN = new Set([
  'tiger',
  'rabbit',
  'trout',
  'eagle',
  'egret',
  'table',
  'ember',
  'robin',
  'nectar',
  'raven',
  'nomad',
  'dagger',
  'runner',
  'relay',
  'yonder',
]);
const isKnownWord = (word: string) => KNOWN.has(word);

const TWO: WordChainSetupPlayer[] = [
  { name: 'Ada', team: TEAM_A },
  { name: 'Brin', team: TEAM_B },
];

function start(rules: Partial<WordChainRules> = {}, setup = TWO, seed = 'start'): WordChainState {
  const merged = { ...DEFAULT_RULES, ...rules };
  const created = wordChainReducer(undefined as never, {
    type: 'start',
    rules: merged,
    setup,
    startingWord: seed,
  });
  return wordChainReducer(created, { type: 'begin', now: 0 });
}

function submit(state: WordChainState, word: string, now = 1_000): WordChainState {
  return wordChainReducer(state, { type: 'submit', word, now, isKnownWord });
}

describe('starting a game', () => {
  it('seeds the chain and asks for the last letter of the seed word', () => {
    const state = start({}, TWO, 'tiger');
    assert.equal(state.status, 'playing');
    assert.equal(state.requiredPrefix, 'r');
    assert.deepEqual(state.usedWords, ['tiger']);
  });

  it('gives the opening turn to the first seat', () => {
    const state = start({}, TWO, 'tiger');
    assert.equal(state.turnIndex, 0);
    assert.equal(state.players[0].name, 'Ada');
  });

  it('interleaves the seating in team mode', () => {
    const setup: WordChainSetupPlayer[] = [
      { name: 'A1', team: TEAM_A },
      { name: 'A2', team: TEAM_A },
      { name: 'B1', team: TEAM_B },
      { name: 'B2', team: TEAM_B },
    ];
    const state = start({ mode: MODE_TEAM }, setup, 'tiger');
    assert.deepEqual(
      state.players.map((player) => player.team),
      [TEAM_A, TEAM_B, TEAM_A, TEAM_B],
    );
  });
});

describe('submitting a word', () => {
  it('accepts a valid word, scores it and passes the turn', () => {
    const state = submit(start({}, TWO, 'tiger'), 'rabbit');
    assert.equal(state.chain.length, 1);
    assert.equal(state.requiredPrefix, 't');
    assert.equal(state.turnIndex, 1);
    assert.equal(state.players[0].wordsPlayed, 1);
    assert.ok(state.players[0].score > 0);
  });

  it('keeps the turn and reports why when a word is rejected', () => {
    const state = submit(start({}, TWO, 'tiger'), 'eagle');
    assert.equal(state.lastRejection, 'wrong-start');
    assert.equal(state.turnIndex, 0);
    assert.equal(state.chain.length, 0);
  });

  it('refuses a word already in the chain', () => {
    let state = submit(start({}, TWO, 'tiger'), 'rabbit');
    // "trout" both starts and ends with t, so the prefix is still satisfied
    // when it comes back around — only the repeat rule can reject it.
    state = submit(state, 'trout', 2_000);
    assert.equal(submit(state, 'trout', 3_000).lastRejection, 'repeated');
  });

  it('tracks the longest word per player', () => {
    const state = submit(start({}, TWO, 'tiger'), 'rabbit');
    assert.equal(state.players[0].longestWord, 'rabbit');
  });

  it('raises the length floor a lap at a time', () => {
    let state = start({ variant: VARIANT_LENGTH_REQUIREMENT }, TWO, 'tiger');
    state = submit(state, 'rabbit');
    state = submit(state, 'trout', 2_000);
    // Lap two: three-letter words no longer clear the bar.
    assert.equal(state.round, 2);
    const short = wordChainReducer(state, { type: 'submit', word: 'tab', now: 3_000, isKnownWord });
    assert.equal(short.lastRejection, 'too-short-for-round');
  });
});

describe('running out of time', () => {
  it('costs a life and moves on', () => {
    const state = wordChainReducer(start({}, TWO, 'tiger'), { type: 'timeout' });
    assert.equal(state.players[0].lives, DEFAULT_RULES.lives - 1);
    assert.equal(state.turnIndex, 1);
    assert.equal(state.requiredPrefix, 'r', 'the chain does not advance on a miss');
  });

  it('eliminates a player who runs out of lives and ends a two-player game', () => {
    let state = start({ lives: 1 }, TWO, 'tiger');
    state = wordChainReducer(state, { type: 'timeout' });
    assert.equal(state.status, 'finished');
    assert.equal(state.players[0].eliminated, true);
    assert.deepEqual(state.winnerIds, [state.players[1].id]);
  });

  it('costs no lives in points mode', () => {
    const state = wordChainReducer(start({ mode: MODE_POINTS }, TWO, 'tiger'), { type: 'timeout' });
    assert.equal(state.players[0].lives, DEFAULT_RULES.lives);
    assert.equal(state.status, 'playing');
  });
});

describe('finishing', () => {
  it('ends points mode after the configured rounds and ranks on score', () => {
    let state = start({ mode: MODE_POINTS, totalRounds: 1 }, TWO, 'tiger');
    state = submit(state, 'rabbit');
    assert.equal(state.status, 'playing');
    state = submit(state, 'trout', 2_000);
    assert.equal(state.status, 'finished');
    assert.deepEqual(state.winnerIds, [state.players[0].id]);
  });

  it('declares the surviving team in team mode', () => {
    const setup: WordChainSetupPlayer[] = [
      { name: 'A1', team: TEAM_A },
      { name: 'B1', team: TEAM_B },
    ];
    let state = start({ mode: MODE_TEAM, lives: 1 }, setup, 'tiger');
    state = wordChainReducer(state, { type: 'timeout' });
    assert.equal(state.status, 'finished');
    assert.equal(state.winningTeam, TEAM_B);
  });

  it('ends a solo run when the last life goes', () => {
    const solo: WordChainSetupPlayer[] = [{ name: 'Ada', team: TEAM_A }];
    let state = start({ mode: MODE_SOLO, lives: 1 }, solo, 'tiger');
    state = submit(state, 'rabbit');
    assert.equal(state.turnIndex, 0, 'a solo player keeps the seat');
    state = wordChainReducer(state, { type: 'timeout' });
    assert.equal(state.status, 'finished');
    assert.match(state.message, /1 word/);
  });
});

describe('pausing and resetting', () => {
  it('pauses and resumes only from the matching status', () => {
    const playing = start({}, TWO, 'tiger');
    const paused = wordChainReducer(playing, { type: 'pause' });
    assert.equal(paused.status, 'paused');
    assert.equal(wordChainReducer(paused, { type: 'pause' }).status, 'paused');
    assert.equal(wordChainReducer(paused, { type: 'resume', now: 50 }).status, 'playing');
  });

  it('ignores a submission while paused', () => {
    const paused = wordChainReducer(start({}, TWO, 'tiger'), { type: 'pause' });
    assert.equal(submit(paused, 'rabbit').chain.length, 0);
  });

  it('returns to setup on reset but keeps the rules', () => {
    const state = wordChainReducer(start({ lives: 2 }, TWO, 'tiger'), { type: 'reset' });
    assert.equal(state.status, 'setup');
    assert.equal(state.rules.lives, 2);
    assert.deepEqual(state.players, []);
  });
});
