import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { GiantInput } from '../types/giant.types';
import {
  HEIST_MS,
  MOOD_AWAKE,
  NOISE_MAX,
  PHASE_ESCAPE,
  PHASE_ESCAPED,
  PHASE_HEIST,
  PHASE_WOKEN,
} from './giant-constants';
import { GiantEngine } from './giant-engine';
import { makeSeats } from './test-helpers';

const AUTHORITY = { authoritative: true };
const GUEST = { authoritative: false };

function engine(count = 3) {
  return new GiantEngine({ seats: makeSeats(count), mapId: 'hearth', heistMs: HEIST_MS });
}

function input(overrides: Partial<GiantInput> = {}): GiantInput {
  return { moveX: 0, moveY: 0, run: false, tiptoe: false, interact: false, ...overrides };
}

/** Runs the sim forward without any player doing anything. */
function idle(game: GiantEngine, seconds: number, options = AUTHORITY) {
  const steps = Math.ceil(seconds * 60);
  for (let i = 0; i < steps; i++) game.step(1 / 60, {}, options);
}

describe('engine — phases', () => {
  it('opens the heist when the countdown runs out', () => {
    const game = engine();
    assert.equal(game.getWorld().phase, 'countdown');

    idle(game, 4);
    assert.equal(game.getWorld().phase, PHASE_HEIST);
  });

  it('holds everyone still through the countdown', () => {
    const game = engine();
    const before = { ...game.getWorld().thieves[0].pos };
    game.step(1 / 60, { p1: input({ moveX: 1, run: true }) }, AUTHORITY);
    assert.deepEqual(game.getWorld().thieves[0].pos, before);
  });

  it('opens the door once the floor has been cleared', () => {
    const game = engine();
    idle(game, 4);

    for (const treasure of game.getWorld().treasures) treasure.takenBy = 'p1';
    game.step(1 / 60, {}, AUTHORITY);

    const world = game.getWorld();
    assert.equal(world.phase, PHASE_ESCAPE);
    assert.equal(world.escapeStartedMs, world.elapsedMs);
  });

  it('opens the door when the heist clock expires, cleared or not', () => {
    const game = engine();
    idle(game, 4);
    game.getWorld().elapsedMs = game.getWorld().countdownMs + HEIST_MS;
    game.step(1 / 60, {}, AUTHORITY);

    assert.equal(game.getWorld().phase, PHASE_ESCAPE);
  });

  it('closes the round when the escape clock expires', () => {
    const game = engine();
    idle(game, 4);
    const world = game.getWorld();
    world.phase = PHASE_ESCAPE;
    world.escapeStartedMs = world.elapsedMs;
    world.elapsedMs += world.escapeMs;

    game.step(1 / 60, {}, AUTHORITY);
    assert.equal(game.getWorld().phase, PHASE_ESCAPED);
  });

  it('leaves the clocks to the host — a guest never ends the round itself', () => {
    const game = engine();
    idle(game, 4, GUEST);
    const world = game.getWorld();
    world.elapsedMs = world.countdownMs + HEIST_MS * 2;

    game.step(1 / 60, {}, GUEST);
    assert.equal(game.getWorld().phase, PHASE_HEIST);
  });
});

describe('engine — waking the giant', () => {
  it('ends it for everybody the moment the meter fills', () => {
    const game = engine();
    idle(game, 4);
    game.getWorld().noise = NOISE_MAX;

    const result = game.step(1 / 60, {}, AUTHORITY);
    assert.equal(result.phaseChanged, PHASE_WOKEN);
    assert.equal(game.getWorld().phase, PHASE_WOKEN);
  });

  it('wakes him on a guest too, without waiting for the host to say so', () => {
    const game = engine();
    idle(game, 4, GUEST);
    game.getWorld().noise = NOISE_MAX;

    game.step(1 / 60, {}, GUEST);
    assert.equal(game.getWorld().phase, PHASE_WOKEN);
  });

  it('stops simulating once the round is over', () => {
    const game = engine();
    game.finish(PHASE_WOKEN);
    const before = game.getWorld().elapsedMs;

    game.step(1 / 60, { p1: input({ moveX: 1 }) }, AUTHORITY);
    assert.equal(game.getWorld().elapsedMs, before);
    assert.equal(game.getWorld().mood, MOOD_AWAKE);
  });

  it('reports a mood change exactly once as the meter crosses a threshold', () => {
    const game = engine();
    idle(game, 4);
    game.getWorld().noise = 52;

    assert.equal(game.step(1 / 60, {}, AUTHORITY).moodChanged, 'stirring');
    assert.equal(game.step(1 / 60, {}, AUTHORITY).moodChanged, null);
  });
});

describe('engine — the room', () => {
  it('charges the meter for a run and barely anything for a tiptoe', () => {
    const loud = engine(1);
    const quiet = engine(1);
    idle(loud, 4);
    idle(quiet, 4);
    loud.thief('p1')!.pos = { x: 480, y: 40 };
    quiet.thief('p1')!.pos = { x: 480, y: 40 };

    for (let i = 0; i < 120; i++) {
      loud.step(1 / 60, { p1: input({ moveX: 1, run: true }) }, AUTHORITY);
      quiet.step(1 / 60, { p1: input({ moveX: 1, tiptoe: true }) }, AUTHORITY);
    }

    assert.ok(loud.getWorld().noise > quiet.getWorld().noise);
  });

  it('settles back down when the crew stands still', () => {
    const game = engine();
    idle(game, 4);
    game.getWorld().noise = 40;
    idle(game, 5);

    assert.ok(game.getWorld().noise < 40);
  });

  it('replays a pickup another client made', () => {
    const game = engine(2);
    idle(game, 4);
    const treasure = game.getWorld().treasures[0];

    game.applyRemoteTake({ thiefId: 'p2', kind: 'treasure', id: treasure.id });

    assert.equal(treasure.takenBy, 'p2');
    assert.equal(game.thief('p2')?.carried, treasure.value);
    assert.equal(game.thief('p2')?.carriedCount, 1);
  });

  it('ignores a replayed pickup for loot that is already gone', () => {
    const game = engine(2);
    idle(game, 4);
    const treasure = game.getWorld().treasures[0];

    game.applyRemoteTake({ thiefId: 'p1', kind: 'treasure', id: treasure.id });
    game.applyRemoteTake({ thiefId: 'p2', kind: 'treasure', id: treasure.id });

    assert.equal(treasure.takenBy, 'p1');
    assert.equal(game.thief('p2')?.carriedCount, 0);
  });

  it('parks a disconnected thief without removing them from the table', () => {
    const game = engine(2);
    idle(game, 4);
    game.setConnected('p2', false);
    const before = { ...game.thief('p2')!.pos };

    game.step(1 / 60, { p2: input({ moveX: 1, run: true }) }, AUTHORITY);
    assert.deepEqual(game.thief('p2')!.pos, before);
  });

  it('accepts a remote pose for somebody else\u2019s body', () => {
    const game = engine(2);
    game.placeThief('p2', { x: 500, y: 120 }, 1.2, 'run');

    const thief = game.thief('p2');
    assert.deepEqual(thief?.pos, { x: 500, y: 120 });
    assert.equal(thief?.facing, 1.2);
    assert.equal(thief?.gait, 'run');
  });
});
