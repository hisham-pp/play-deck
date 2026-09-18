import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  COST_ISOLATED,
  COST_NEUTRAL,
  COST_OPPONENT,
  MAX_DEFENCE_SURCHARGE,
} from './color-thief-constants';
import { seat, startedState, withOwners } from './color-thief-test-helpers';
import { neutralTilesTouching, quoteClaim, scoreboardOf, winnersOf } from './territory';

const SEATS = [seat(0, 'red'), seat(1, 'blue')];

describe('Color Thief claim pricing', () => {
  it('charges the bare neutral price for a seat with no territory yet', () => {
    const state = startedState(SEATS);
    const quote = quoteClaim(state, 10, 0);
    assert.equal(quote.cost, COST_NEUTRAL);
    assert.equal(quote.refusal, null);
  });

  it('keeps neutral tiles touching your paint cheap', () => {
    const state = withOwners(startedState(SEATS), { 0: 0 });
    assert.equal(quoteClaim(state, 1, 0).cost, COST_NEUTRAL);
    assert.equal(quoteClaim(state, 1, 0).adjacent, true);
  });

  it('adds the isolated surcharge once you hold territory elsewhere', () => {
    const state = withOwners(startedState(SEATS), { 0: 0 });
    const quote = quoteClaim(state, 15, 0);
    assert.equal(quote.adjacent, false);
    assert.equal(quote.cost, COST_NEUTRAL + COST_ISOLATED);
  });

  it('prices an adjacent lone opponent tile at the plain steal cost', () => {
    const state = withOwners(startedState(SEATS), { 0: 0, 1: 1 });
    assert.equal(quoteClaim(state, 1, 0).cost, COST_OPPONENT);
  });

  it('charges more for every extra defender around the target', () => {
    // Seat 1 holds 1, 2 and 5, so tile 1 has two defenders of its own.
    const state = withOwners(startedState(SEATS), { 0: 0, 1: 1, 2: 1, 5: 1 });
    assert.equal(quoteClaim(state, 1, 0).defenders, 2);
    assert.equal(quoteClaim(state, 1, 0).cost, COST_OPPONENT + 1);
  });

  it('caps the defence surcharge', () => {
    // Tile 5 is ringed by its owner on all four sides, well past the cap.
    const middle = 5;
    const state = {
      ...withOwners(startedState(SEATS), { 0: 0, [middle]: 1, 1: 1, 4: 1, 6: 1, 9: 1 }),
      paintRemaining: 20,
    };
    const quote = quoteClaim(state, middle, 0);
    assert.equal(quote.defenders, 4);
    assert.equal(quote.adjacent, false);
    assert.equal(quote.cost, COST_OPPONENT + COST_ISOLATED + MAX_DEFENCE_SURCHARGE);
  });

  it('refuses your own tile and anything frozen', () => {
    const owned = withOwners(startedState(SEATS), { 0: 0, 1: 1 });
    assert.equal(quoteClaim(owned, 0, 0).refusal, 'own-tile');

    const frozen = {
      ...owned,
      board: owned.board.map((tile) =>
        tile.index === 1 ? { ...tile, frozenUntilRound: 9 } : tile,
      ),
    };
    assert.equal(quoteClaim(frozen, 1, 0).refusal, 'frozen');
  });

  it('refuses a claim the seat cannot pay for', () => {
    const state = { ...withOwners(startedState(SEATS), { 0: 0 }), paintRemaining: 1 };
    assert.equal(quoteClaim(state, 15, 0).refusal, 'too-expensive');
  });

  it('refuses a tile that is not on the grid', () => {
    assert.equal(quoteClaim(startedState(SEATS), 99, 0).refusal, 'off-grid');
  });
});

describe('Color Thief scoring', () => {
  it('ranks by territory and leaves frozen paint out of the count', () => {
    const state = withOwners(startedState(SEATS), { 0: 0, 1: 0, 2: 0, 8: 1 });
    const frozen = {
      ...state,
      board: state.board.map((tile) =>
        tile.index === 2 ? { ...tile, frozenUntilRound: 9 } : tile,
      ),
    };

    const [leader] = scoreboardOf(frozen);
    assert.equal(leader.seatIndex, 0);
    assert.equal(leader.tiles, 2);
    assert.equal(leader.frozenTiles, 1);
  });

  it('breaks an equal tile count on the largest connected blob', () => {
    // Both hold two tiles; seat 0's are joined, seat 1's are scattered.
    const state = withOwners(startedState(SEATS), { 0: 0, 1: 0, 7: 1, 8: 1 });
    assert.deepEqual(winnersOf(state), ['p0']);
  });

  it('reports a genuine dead heat as a shared win', () => {
    const state = withOwners(startedState(SEATS), { 0: 0, 1: 0, 14: 1, 15: 1 });
    assert.deepEqual(winnersOf(state).sort(), ['p0', 'p1']);
  });

  it('lists the neutral tiles a seat can spread onto, in board order', () => {
    const state = withOwners(startedState(SEATS), { 0: 0 });
    assert.deepEqual(neutralTilesTouching(state, 0), [1, 4]);
  });
});
