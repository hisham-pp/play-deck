import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { areTargetsValid, isAbilityReady, resolveAbility } from './abilities';
import { BLEED_LIMIT, FREEZE_ROUNDS } from './color-thief-constants';
import { seat, startedState, withOwners } from './color-thief-test-helpers';

const RED_VS_BLUE = [seat(0, 'red'), seat(1, 'blue')];
const YELLOW_VS_BLUE = [seat(0, 'yellow'), seat(1, 'blue')];
const PURPLE_VS_BLUE = [seat(0, 'purple'), seat(1, 'blue')];
const ORANGE_VS_BLUE = [seat(0, 'orange'), seat(1, 'blue')];

describe('Color Thief abilities — readiness', () => {
  it('holds an ability back while it is on cooldown', () => {
    const state = startedState(RED_VS_BLUE);
    const cooling = {
      ...state,
      players: state.players.map((p) => (p.seatIndex === 0 ? { ...p, abilityReadyOnRound: 9 } : p)),
    };
    assert.equal(isAbilityReady(cooling, cooling.players[0]), false);
  });

  it('holds an ability back when the paint will not cover it', () => {
    const state = { ...startedState(RED_VS_BLUE), paintRemaining: 1 };
    assert.equal(isAbilityReady(state, state.players[0]), false);
  });

  it('never treats a passive as an aimable ability', () => {
    const state = startedState([seat(0, 'green'), seat(1, 'blue')]);
    assert.equal(isAbilityReady(state, state.players[0]), false);
  });
});

describe('Color Thief abilities — targeting', () => {
  it('requires no target for Bleed', () => {
    const state = startedState(RED_VS_BLUE);
    assert.equal(areTargetsValid(state, 0, []), true);
    assert.equal(areTargetsValid(state, 0, [3]), false);
  });

  it('requires one live enemy tile for Freeze', () => {
    const state = withOwners(startedState([seat(0, 'blue'), seat(1, 'red')]), { 5: 1, 6: 0 });
    assert.equal(areTargetsValid(state, 0, [5]), true);
    assert.equal(areTargetsValid(state, 0, [6]), false, 'your own tile is not a Freeze target');
    assert.equal(areTargetsValid(state, 0, [7]), false, 'a neutral tile is not a Freeze target');
  });

  it('requires one of yours and one of theirs for Swap', () => {
    const state = withOwners(startedState(YELLOW_VS_BLUE), { 0: 0, 9: 1 });
    assert.equal(areTargetsValid(state, 0, [0, 9]), true);
    assert.equal(areTargetsValid(state, 0, [9, 0]), false, 'order matters: yours first');
  });
});

describe('Color Thief abilities — resolution', () => {
  it('Bleed floods neutral tiles touching your paint, up to its limit', () => {
    const state = withOwners(startedState(RED_VS_BLUE), { 5: 0, 6: 0 });
    const outcome = resolveAbility(state, 0, [])!;
    const gained = outcome.board.filter((tile) => tile.owner === 0).length;
    assert.equal(gained, 2 + BLEED_LIMIT);
  });

  it('Bleed says so plainly when there is nothing to flood', () => {
    const outcome = resolveAbility(startedState(RED_VS_BLUE), 0, [])!;
    assert.match(outcome.message, /no neutral tile/);
  });

  it('Freeze catches the target and its touching allies only', () => {
    const state = withOwners(startedState([seat(0, 'blue'), seat(1, 'red')]), {
      5: 1,
      6: 1,
      9: 1,
      7: 0,
    });
    const outcome = resolveAbility(state, 0, [5])!;
    const frozen = outcome.board.filter((tile) => tile.frozenUntilRound > state.round);

    assert.deepEqual(
      frozen.map((tile) => tile.index),
      [5, 6, 9],
    );
    assert.ok(frozen.every((tile) => tile.frozenUntilRound === state.round + FREEZE_ROUNDS));
  });

  it('Swap exchanges the two tiles and changes nobody\u2019s count', () => {
    const state = withOwners(startedState(YELLOW_VS_BLUE), { 0: 0, 9: 1 });
    const outcome = resolveAbility(state, 0, [0, 9])!;

    assert.equal(outcome.board[0].owner, 1);
    assert.equal(outcome.board[9].owner, 0);
    assert.equal(outcome.board.filter((tile) => tile.owner === 0).length, 1);
  });

  it('Blockade names the tile owner rather than touching the board', () => {
    const state = withOwners(startedState(PURPLE_VS_BLUE), { 9: 1 });
    const outcome = resolveAbility(state, 0, [9])!;

    assert.deepEqual(outcome.blockadedSeats, [1]);
    assert.equal(outcome.board, state.board);
  });

  it('Splash takes the target and its four neighbours at once', () => {
    const state = withOwners(startedState(ORANGE_VS_BLUE), { 1: 1, 4: 1 });
    const outcome = resolveAbility(state, 0, [5])!;

    assert.deepEqual(
      outcome.board.filter((tile) => tile.owner === 0).map((tile) => tile.index),
      [1, 4, 5, 6, 9],
    );
  });

  it('Splash leaves frozen tiles alone', () => {
    const base = withOwners(startedState(ORANGE_VS_BLUE), { 1: 1 });
    const state = {
      ...base,
      board: base.board.map((tile) => (tile.index === 1 ? { ...tile, frozenUntilRound: 9 } : tile)),
    };
    const outcome = resolveAbility(state, 0, [5])!;

    assert.equal(outcome.board[1].owner, 1);
  });

  it('Bloom is never resolved as an aimed ability', () => {
    const state = startedState([seat(0, 'green'), seat(1, 'blue')]);
    assert.equal(resolveAbility(state, 0, []), null);
  });
});
