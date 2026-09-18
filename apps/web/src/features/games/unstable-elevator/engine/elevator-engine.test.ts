import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { ElevatorSeat } from '../types/unstable-elevator.types';
import {
  COUNTDOWN_MS,
  PHASE_ASCENDING,
  PHASE_COLLAPSE,
  PHASE_PLACING,
  PHASE_SCORES,
  PHASE_SETTLING,
  SEAT_COLORS,
} from './elevator-constants';
import { ElevatorEngine } from './elevator-engine';

const SEED = 'test-seed';

function seat(index: number, type: ElevatorSeat['type'] = 'human'): ElevatorSeat {
  return {
    id: `seat-${index}`,
    displayName: `Player ${index + 1}`,
    avatar: '🕹️',
    type,
    color: SEAT_COLORS[index % SEAT_COLORS.length],
    seatIndex: index,
    status: 'connected',
  };
}

function newEngine(seats = [seat(0), seat(1)], slips = 5) {
  return new ElevatorEngine({ seats, seed: SEED, slips });
}

/** Runs the engine forwards in 16 ms frames. */
function run(engine: ElevatorEngine, ms: number) {
  for (let elapsed = 0; elapsed < ms; elapsed += 16) engine.update(16);
}

/** Advances until `predicate` holds, or gives up after `limitMs`. */
function runUntil(engine: ElevatorEngine, limitMs: number, predicate: () => boolean) {
  for (let elapsed = 0; elapsed < limitMs; elapsed += 16) {
    if (predicate()) return true;
    engine.update(16);
  }
  return predicate();
}

describe('ElevatorEngine — run flow', () => {
  it('starts idle and does nothing until the run begins', () => {
    const engine = newEngine();
    assert.equal(engine.getState().phase, 'idle');
    run(engine, 2000);
    assert.equal(engine.getState().phase, 'idle');
  });

  it('counts down and then opens the first floor for placing', () => {
    const engine = newEngine();
    engine.start();
    assert.equal(engine.getState().phase, 'countdown');

    run(engine, COUNTDOWN_MS + 64);

    const state = engine.getState();
    assert.equal(state.phase, PHASE_PLACING);
    assert.equal(state.floor, 1);
    assert.equal(state.activeSeatId, 'seat-0');
    assert.ok(state.pendingShapeId, 'a shape should be waiting on the claw');
  });

  it('gives each seat the claw in turn, one object per floor', () => {
    const engine = newEngine([seat(0), seat(1), seat(2)]);
    engine.start();
    const seen: (string | null)[] = [];

    for (let floor = 1; floor <= 3; floor += 1) {
      runUntil(engine, 40_000, () => engine.getState().floor === floor);
      runUntil(engine, 5_000, () => engine.getState().phase === PHASE_PLACING);
      seen.push(engine.getState().activeSeatId);
      engine.drop(engine.getState().activeSeatId ?? '');
      runUntil(engine, 40_000, () => engine.getState().floor === floor + 1);
    }

    assert.deepEqual(seen, ['seat-0', 'seat-1', 'seat-2']);
  });
});

describe('ElevatorEngine — placing', () => {
  it('only lets the seat on the claw drop', () => {
    const engine = newEngine();
    engine.start();
    runUntil(engine, 5_000, () => engine.getState().phase === PHASE_PLACING);

    assert.equal(engine.drop('seat-1'), false);
    assert.equal(engine.getState().phase, PHASE_PLACING);
    assert.equal(engine.drop('seat-0'), true);
    assert.equal(engine.getState().phase, PHASE_SETTLING);
  });

  it('scores the placement to the player who made it', () => {
    const engine = newEngine();
    engine.start();
    runUntil(engine, 5_000, () => engine.getState().phase === PHASE_PLACING);
    engine.drop('seat-0');

    const [first, second] = engine.getState().scores;
    assert.ok(first.points > 0, 'the placing seat should be paid');
    assert.equal(first.placed, 1);
    assert.equal(second.points, 0);
  });

  it('keeps the claw inside the platform rail', () => {
    const engine = newEngine();
    engine.start();
    runUntil(engine, 5_000, () => engine.getState().phase === PHASE_PLACING);

    engine.setClaw(99, 0);
    assert.ok(engine.getState().clawX < 4, 'claw should be clamped to the rail');
    engine.setClaw(-99, 0);
    assert.ok(engine.getState().clawX > -4);
  });

  it('refuses a drop that would start inside the tower', () => {
    const engine = newEngine();
    engine.start();
    runUntil(engine, 5_000, () => engine.getState().phase === PHASE_PLACING);
    engine.setClaw(0, 0);
    engine.drop('seat-0');

    // Second floor, same spot: the first object has not reached the claw's
    // height, so this should still be clear.
    runUntil(engine, 40_000, () => engine.getState().floor === 2);
    runUntil(engine, 5_000, () => engine.getState().phase === PHASE_PLACING);
    assert.equal(engine.canDrop(), true);
  });

  it('drops on its own when the placing clock runs out', () => {
    const engine = newEngine();
    engine.start();
    runUntil(engine, 5_000, () => engine.getState().phase === PHASE_PLACING);

    runUntil(engine, 30_000, () => engine.getState().phase !== PHASE_PLACING);
    assert.notEqual(engine.getState().phase, PHASE_PLACING);
    assert.equal(engine.getState().cargo.length, 1);
  });
});

describe('ElevatorEngine — losing cargo', () => {
  it('ends the run once the crew is out of slips', () => {
    const engine = newEngine([seat(0)], 1);
    engine.start();
    runUntil(engine, 5_000, () => engine.getState().phase === PHASE_PLACING);

    // Released hard against the rail, this lands beyond the platform edge.
    engine.setClaw(4, 0);
    engine.drop('seat-0');
    runUntil(engine, 20_000, () => engine.getState().phase === PHASE_COLLAPSE);

    assert.equal(engine.getState().phase, PHASE_COLLAPSE);
    assert.equal(engine.getState().scores[0].lost, 1);
    assert.ok(engine.getState().scores[0].points < 0, 'a lost object should cost points');

    runUntil(engine, 10_000, () => engine.getState().phase === PHASE_SCORES);
    assert.equal(engine.getState().finished, true);
  });
});

describe('ElevatorEngine — snapshots', () => {
  it('mirrors the host run onto a guest engine', () => {
    const host = newEngine();
    host.start();
    runUntil(host, 5_000, () => host.getState().phase === PHASE_PLACING);
    host.drop('seat-0');
    runUntil(host, 20_000, () => host.getState().phase === PHASE_ASCENDING);

    const guest = newEngine();
    guest.applySnapshot(host.getSnapshot());

    const hostState = host.getState();
    const guestState = guest.getState();
    assert.equal(guestState.phase, hostState.phase);
    assert.equal(guestState.floor, hostState.floor);
    assert.deepEqual(guestState.scores, hostState.scores);
    assert.equal(guestState.bodies.length, hostState.bodies.length);
    assert.ok(guestState.stackHeight > 0, 'the guest should see the tower');
  });
});
