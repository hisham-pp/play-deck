import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { ShadowTagSeat } from '../types/shadow-tag.types';
import {
  awardSurvival,
  countdownRemaining,
  secondsRemaining,
  standings,
  winnerOf,
} from './scoring';
import { SEAT_COLORS, SURVIVAL_POINTS_PER_SEC } from './shadow-tag-constants';
import { createWorld } from './shadow-tag-state';

function seats(count: number): ShadowTagSeat[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `p${index + 1}`,
    displayName: `Player ${index + 1}`,
    avatar: '🕹️',
    type: 'human' as const,
    seatIndex: index,
    color: SEAT_COLORS[index],
  }));
}

function world(count = 3) {
  return createWorld({ seats: seats(count), arenaId: 'atrium', roundMs: 60_000, itId: 'p1' });
}

describe('scoring', () => {
  it('pays everyone but "it" for staying free', () => {
    const state = world();
    awardSurvival(state, 1);

    const [it, free] = state.players;
    assert.equal(it.score, 0);
    assert.equal(it.itMs, 1000);
    assert.equal(free.score, SURVIVAL_POINTS_PER_SEC);
    assert.equal(free.bestEvasionMs, 1000);
  });

  it('resets the evasion streak the moment you take the mark', () => {
    const state = world();
    awardSurvival(state, 3);
    state.itId = 'p2';
    awardSurvival(state, 1);

    const p2 = state.players[1];
    assert.equal(p2.evasionMs, 0);
    assert.equal(p2.bestEvasionMs, 3000, 'the streak it just lost is still its best');
  });

  it('ranks on score, then on fewest times tagged', () => {
    const state = world();
    state.players[0].score = 100;
    state.players[1].score = 100;
    state.players[1].timesTagged = 3;
    state.players[2].score = 40;

    const table = standings(seats(3), state.players);
    assert.deepEqual(
      table.map((row) => row.seat.id),
      ['p1', 'p2', 'p3'],
    );
    assert.deepEqual(
      table.map((row) => row.rank),
      [1, 2, 3],
    );
    assert.equal(winnerOf(seats(3), state.players)?.id, 'p1');
  });

  it('drops seats that never took the field', () => {
    const state = world(2);
    assert.equal(standings(seats(4), state.players).length, 2);
  });

  it('counts the countdown down first, then the round clock', () => {
    const state = world();
    assert.equal(countdownRemaining(state), Math.ceil(state.countdownMs / 1000));
    assert.equal(secondsRemaining(state), 60);

    state.elapsedMs = state.countdownMs + 15_000;
    assert.equal(countdownRemaining(state), 0);
    assert.equal(secondsRemaining(state), 45);

    state.elapsedMs = state.countdownMs + 90_000;
    assert.equal(secondsRemaining(state), 0);
  });
});
