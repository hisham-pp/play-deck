import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type {
  SnakeLadderGameState,
  SnakeLadderPlayer,
  SnakeLadderRuleSettings,
} from '../types/snake-and-ladder.types';
import {
  SEAT_COLORS,
  STATUS_COMPLETED,
  STATUS_PAUSED,
  STATUS_PLAYING,
} from './snake-ladder-constants';
import { snakeLadderReducer } from './snake-ladder-reducer';
import { createInitialSnakeLadderState } from './snake-ladder-state';

function seats(count: number): SnakeLadderPlayer[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `p${index + 1}`,
    displayName: `Player ${index + 1}`,
    type: 'human' as const,
    color: SEAT_COLORS[index],
    seatIndex: index,
    status: 'connected' as const,
    ready: true,
  }));
}

function started(count = 2, settings: Partial<SnakeLadderRuleSettings> = {}): SnakeLadderGameState {
  const state = createInitialSnakeLadderState(seats(count), settings);
  return snakeLadderReducer(state, { type: 'START_GAME', playerId: 'p1' });
}

function roll(state: SnakeLadderGameState, playerId: string, value: number) {
  return snakeLadderReducer(state, { type: 'ROLL_DICE', playerId, payload: { value } });
}

function positionOf(state: SnakeLadderGameState, playerId: string): number {
  return state.players.find((p) => p.playerId === playerId)!.position;
}

describe('Snake & Ladder reducer — lifecycle', () => {
  it('starts only from the waiting state and only with two seats', () => {
    const solo = createInitialSnakeLadderState(seats(1));
    assert.equal(
      snakeLadderReducer(solo, { type: 'START_GAME', playerId: 'p1' }).status,
      'waiting',
    );
    assert.equal(started().status, STATUS_PLAYING);
  });

  it('pauses and resumes', () => {
    const paused = snakeLadderReducer(started(), { type: 'PAUSE_GAME', playerId: 'p1' });
    assert.equal(paused.status, STATUS_PAUSED);
    assert.equal(
      snakeLadderReducer(paused, { type: 'RESUME_GAME', playerId: 'p1' }).status,
      STATUS_PLAYING,
    );
  });

  it('refuses rolls while paused', () => {
    const paused = snakeLadderReducer(started(), { type: 'PAUSE_GAME', playerId: 'p1' });
    assert.equal(roll(paused, 'p1', 3), paused);
  });
});

describe('Snake & Ladder reducer — turn order', () => {
  it('ignores a roll from a seat that is not on turn', () => {
    const state = started();
    assert.equal(roll(state, 'p2', 3), state);
  });

  it('ignores a dice value outside 1..6', () => {
    const state = started();
    assert.equal(roll(state, 'p1', 0), state);
    assert.equal(roll(state, 'p1', 7), state);
    assert.equal(roll(state, 'p1', 2.5), state);
  });

  it('passes the dice to the next seat after a non-six', () => {
    const next = roll(started(), 'p1', 3);
    assert.equal(positionOf(next, 'p1'), 3);
    assert.equal(next.currentTurnSeatIndex, 1);
  });

  it('keeps the turn on a six', () => {
    const next = roll(started(), 'p1', 6);
    assert.equal(next.currentTurnSeatIndex, 0);
  });

  it('hands the turn over on a six when the extra-turn rule is off', () => {
    const next = roll(started(2, { sixGrantsExtraTurn: false }), 'p1', 6);
    assert.equal(next.currentTurnSeatIndex, 1);
  });

  it('forfeits the turn on the third six in a row, without moving', () => {
    let state = started();
    state = roll(state, 'p1', 6); // square 6
    state = roll(state, 'p1', 6); // square 12
    const before = positionOf(state, 'p1');
    state = roll(state, 'p1', 6);

    assert.equal(positionOf(state, 'p1'), before, 'the third six must not move the token');
    assert.equal(state.currentTurnSeatIndex, 1);
    assert.equal(state.players[0].consecutiveSixes, 0, 'the streak resets after the forfeit');
  });

  it('skips seats that have already finished', () => {
    let state = started(3);
    state = roll(state, 'p1', 3);
    state = roll(state, 'p2', 3);
    state = roll(state, 'p3', 3);
    assert.equal(state.currentTurnSeatIndex, 0);
  });
});

describe('Snake & Ladder reducer — board effects', () => {
  it('records a ladder climb on the move', () => {
    const state = roll(started(), 'p1', 4);
    assert.equal(positionOf(state, 'p1'), 14);
    assert.deepEqual(state.lastMove?.jump, { kind: 'ladder', from: 4, to: 14 });
    assert.equal(state.lastMove?.walkTo, 4);
  });

  it('records a snake slide on the move', () => {
    let state = started();
    state = roll(state, 'p1', 6); // 6, keeps the turn
    state = roll(state, 'p1', 4); // walks to 10
    state = roll(state, 'p2', 1);
    state = roll(state, 'p1', 6); // 16 -> snake down to 6
    assert.equal(positionOf(state, 'p1'), 6);
    assert.deepEqual(state.lastMove?.jump, { kind: 'snake', from: 16, to: 6 });
  });

  it('stamps every move with a rising id so the board can replay it', () => {
    let state = started();
    state = roll(state, 'p1', 3);
    const first = state.lastMove!.moveId;
    state = roll(state, 'p2', 3);
    assert.ok(state.lastMove!.moveId > first);
  });
});

describe('Snake & Ladder reducer — finishing', () => {
  function walkTo(state: SnakeLadderGameState, playerId: string, square: number) {
    return {
      ...state,
      players: state.players.map((p) => (p.playerId === playerId ? { ...p, position: square } : p)),
    };
  }

  it('wins on an exact 100 and ranks the finisher', () => {
    const state = roll(walkTo(started(), 'p1', 97), 'p1', 3);
    assert.equal(state.players[0].finished, true);
    assert.equal(state.players[0].finishRank, 1);
    assert.deepEqual(state.winnerOrder, ['p1']);
  });

  it('ends a two-player match as soon as one player is home', () => {
    const state = roll(walkTo(started(), 'p1', 97), 'p1', 3);
    assert.equal(state.status, STATUS_COMPLETED);
  });

  it('keeps a four-player match running for the remaining places', () => {
    const state = roll(walkTo(started(4), 'p1', 97), 'p1', 3);
    assert.equal(state.status, STATUS_PLAYING);
    assert.equal(state.currentTurnSeatIndex, 1);
  });

  it('stops a four-player match at the first finisher when configured', () => {
    const base = started(4, { endOnFirstFinisher: true });
    const state = roll(walkTo(base, 'p1', 97), 'p1', 3);
    assert.equal(state.status, STATUS_COMPLETED);
  });

  it('holds position when the exact-finish rule rejects an overshoot', () => {
    const state = roll(walkTo(started(), 'p1', 98), 'p1', 5);
    assert.equal(positionOf(state, 'p1'), 98);
    assert.equal(state.lastMove?.overshot, true);
    assert.equal(state.status, STATUS_PLAYING);
  });

  it('does not grant an extra turn to a player who just won on a six', () => {
    const state = roll(walkTo(started(4), 'p1', 94), 'p1', 6);
    assert.equal(state.players[0].finished, true);
    assert.equal(state.currentTurnSeatIndex, 1);
  });
});
