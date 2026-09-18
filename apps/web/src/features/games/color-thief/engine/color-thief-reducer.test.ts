import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { ColorThiefGameState } from '../types/color-thief.types';
import { decideBotMove } from './color-thief-bot';
import {
  BLOCKADE_PAINT_FACTOR,
  PAINT_PER_TURN,
  STATUS_COMPLETED,
  STATUS_PAUSED,
  STATUS_PLAYING,
} from './color-thief-constants';
import { colorThiefReducer } from './color-thief-reducer';
import { createInitialColorThiefState } from './color-thief-state';
import { seat, startedState, withOwners } from './color-thief-test-helpers';

const SEATS = [seat(0, 'red'), seat(1, 'blue')];
const BLUE_FIRST = [seat(0, 'blue'), seat(1, 'red')];

function claim(state: ColorThiefGameState, playerId: string, index: number) {
  return colorThiefReducer(state, { type: 'CLAIM_TILE', playerId, payload: { index } });
}

function endTurn(state: ColorThiefGameState, playerId: string) {
  return colorThiefReducer(state, { type: 'END_TURN', playerId });
}

describe('Color Thief reducer — match lifecycle', () => {
  it('refuses to start below the seat minimum', () => {
    const solo = createInitialColorThiefState([seat(0, 'red')]);
    assert.equal(colorThiefReducer(solo, { type: 'START_GAME', playerId: 'p0' }).status, 'waiting');
  });

  it('opens on round one with a full paint allowance', () => {
    const state = startedState(SEATS);
    assert.equal(state.status, STATUS_PLAYING);
    assert.equal(state.round, 1);
    assert.equal(state.paintRemaining, PAINT_PER_TURN);
    assert.equal(state.currentTurnSeatIndex, 0);
  });

  it('pauses and resumes without disturbing the board', () => {
    const state = claim(startedState(SEATS), 'p0', 5);
    const paused = colorThiefReducer(state, { type: 'PAUSE_GAME', playerId: 'p0' });
    assert.equal(paused.status, STATUS_PAUSED);
    assert.equal(claim(paused, 'p0', 6).board[6].owner, null, 'a paused board takes no paint');

    const resumed = colorThiefReducer(paused, { type: 'RESUME_GAME', playerId: 'p0' });
    assert.equal(resumed.status, STATUS_PLAYING);
    assert.equal(resumed.board[5].owner, 0);
  });

  it('scores the arena when the match is called early', () => {
    const state = withOwners(startedState(SEATS), { 0: 0, 1: 0, 8: 1 });
    const ended = colorThiefReducer(state, { type: 'END_GAME', playerId: 'p0' });
    assert.equal(ended.status, STATUS_COMPLETED);
    assert.deepEqual(ended.winnerIds, ['p0']);
  });
});

describe('Color Thief reducer — claiming', () => {
  it('spends paint and flips the tile', () => {
    const next = claim(startedState(SEATS), 'p0', 5);
    assert.equal(next.board[5].owner, 0);
    assert.equal(next.paintRemaining, PAINT_PER_TURN - 1);
    assert.equal(next.actionCount, 1);
  });

  it('ignores a claim from a seat that is not on turn', () => {
    const state = startedState(SEATS);
    assert.equal(claim(state, 'p1', 5), state);
  });

  it('ignores a claim nobody can afford', () => {
    const poor = { ...withOwners(startedState(SEATS), { 0: 0 }), paintRemaining: 1 };
    assert.equal(claim(poor, 'p0', 15), poor);
  });

  it('ends the turn on its own once the paint runs out', () => {
    let state = { ...startedState(SEATS), paintRemaining: 2 };
    state = claim(state, 'p0', 5);
    state = claim(state, 'p0', 6);

    assert.equal(state.currentTurnSeatIndex, 1);
    assert.equal(state.paintRemaining, PAINT_PER_TURN, 'the next seat starts fresh');
  });
});

describe('Color Thief reducer — turns and rounds', () => {
  it('passes the brush to the next seat and refills their paint', () => {
    const next = endTurn(claim(startedState(SEATS), 'p0', 5), 'p0');
    assert.equal(next.currentTurnSeatIndex, 1);
    assert.equal(next.paintRemaining, PAINT_PER_TURN);
  });

  it('rolls the round over only when the table wraps', () => {
    const afterFirst = endTurn(startedState(SEATS), 'p0');
    assert.equal(afterFirst.round, 1);

    const afterSecond = endTurn(afterFirst, 'p1');
    assert.equal(afterSecond.round, 2);
    assert.equal(afterSecond.currentTurnSeatIndex, 0);
  });

  it('completes the match once the configured rounds are spent', () => {
    let state = startedState(SEATS, 4, 4, 2);
    state = withOwners(state, { 0: 0, 1: 0, 8: 1 });

    for (let turn = 0; turn < 4; turn++) {
      state = endTurn(state, state.currentTurnSeatIndex === 0 ? 'p0' : 'p1');
    }

    assert.equal(state.status, STATUS_COMPLETED);
    assert.equal(state.round, 2);
    assert.deepEqual(state.winnerIds, ['p0']);
  });

  it('ends early once a single colour owns the arena', () => {
    const owned = startedState(SEATS, 2, 2, 9);
    const conquered = withOwners(owned, { 0: 0, 1: 0, 2: 0, 3: 0 });
    assert.equal(endTurn(conquered, 'p0').status, STATUS_COMPLETED);
  });
});

describe('Color Thief reducer — abilities', () => {
  it('reveals the colour, spends paint and sets the cooldown', () => {
    const state = withOwners(startedState(SEATS), { 5: 0 });
    const next = colorThiefReducer(state, {
      type: 'USE_ABILITY',
      playerId: 'p0',
      payload: { targets: [] },
    });

    assert.equal(next.players[0].abilityRevealed, true);
    assert.equal(next.paintRemaining, PAINT_PER_TURN - 3);
    assert.equal(next.players[0].abilityReadyOnRound, state.round + 2);
  });

  it('keeps an ability hidden until its owner fires it', () => {
    assert.equal(startedState(SEATS).players[0].abilityRevealed, false);
  });

  it('refuses an ability whose targets do not fit', () => {
    const state = withOwners(startedState(BLUE_FIRST), { 5: 1 });
    const bad = colorThiefReducer(state, {
      type: 'USE_ABILITY',
      playerId: 'p0',
      payload: { targets: [] },
    });
    assert.equal(bad, state, 'Freeze without a target changes nothing');
  });

  it('refuses a second use before the cooldown is up', () => {
    const state = withOwners(startedState(SEATS), { 5: 0 });
    const used = colorThiefReducer(state, {
      type: 'USE_ABILITY',
      playerId: 'p0',
      payload: { targets: [] },
    });
    const again = colorThiefReducer(used, {
      type: 'USE_ABILITY',
      playerId: 'p0',
      payload: { targets: [] },
    });
    assert.equal(again, used);
  });

  it('starves a blockaded seat on its next turn only', () => {
    const state = withOwners(startedState([seat(0, 'purple'), seat(1, 'red')]), { 9: 1 });
    const blockaded = colorThiefReducer(state, {
      type: 'USE_ABILITY',
      playerId: 'p0',
      payload: { targets: [9] },
    });

    const victimTurn = endTurn(blockaded, 'p0');
    assert.equal(victimTurn.paintRemaining, Math.floor(PAINT_PER_TURN * BLOCKADE_PAINT_FACTOR));

    const laterTurn = endTurn(endTurn(victimTurn, 'p1'), 'p0');
    assert.equal(laterTurn.paintRemaining, PAINT_PER_TURN);
  });

  it('creeps Bloom onto one tile at the start of every green turn', () => {
    const state = withOwners(startedState([seat(0, 'red'), seat(1, 'green')]), { 5: 1 });
    const greenTurn = endTurn(state, 'p0');

    assert.equal(greenTurn.board.filter((tile) => tile.owner === 1).length, 2);
    assert.equal(greenTurn.players[1].abilityRevealed, true, 'the creep gives Green away');
  });
});

describe('Color Thief bot', () => {
  it('opens with a claim rather than ending an untouched turn', () => {
    assert.equal(decideBotMove(startedState(SEATS), 0).kind, 'claim');
  });

  it('never acts for a seat that is not on turn', () => {
    assert.deepEqual(decideBotMove(startedState(SEATS), 1), { kind: 'end' });
  });

  it('prefers a cheap tile against its own wall over a distant one', () => {
    // Yellow, so a ready ability does not pre-empt the claim being tested.
    const state = withOwners(startedState([seat(0, 'yellow'), seat(1, 'blue')]), { 0: 0, 1: 0 });
    const move = decideBotMove(state, 0);
    assert.ok(move.kind === 'claim' && [2, 4, 5].includes(move.index));
  });

  it('fires Bleed once there is a full spread to take', () => {
    const state = withOwners(startedState(SEATS), { 5: 0, 6: 0, 9: 0 });
    assert.deepEqual(decideBotMove(state, 0), { kind: 'ability', targets: [] });
  });
});
