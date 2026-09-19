import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { PHASE_ESCAPE, PHASE_ESCAPED, PHASE_WOKEN } from './giant-constants';
import {
  countdownRemaining,
  crewSucceeded,
  haulOf,
  isOver,
  loudestOf,
  secondsRemaining,
  standings,
} from './scoring';
import { makeHeistWorld, makeSeats, makeWorld } from './test-helpers';

describe('scoring — the table', () => {
  it('counts loot still in your arms towards your haul', () => {
    const world = makeHeistWorld();
    const thief = world.thieves[0];
    thief.banked = 30;
    thief.carried = 25;
    assert.equal(haulOf(thief), 55);
  });

  it('ranks on haul, then on who kept quietest', () => {
    const world = makeHeistWorld(3);
    world.thieves[0].banked = 50;
    world.thieves[0].noiseMade = 40;
    world.thieves[1].banked = 50;
    world.thieves[1].noiseMade = 12;
    world.thieves[2].banked = 10;

    const table = standings(makeSeats(3), world.thieves);
    assert.deepEqual(
      table.map((row) => row.seat.id),
      ['p2', 'p1', 'p3'],
    );
    assert.deepEqual(
      table.map((row) => row.rank),
      [1, 2, 3],
    );
  });

  it('names whoever put the most into the meter', () => {
    const world = makeHeistWorld(3);
    world.thieves[1].noiseMade = 99;
    assert.equal(loudestOf(makeSeats(3), world.thieves)?.id, 'p2');
  });

  it('drops seats that never took the field', () => {
    const world = makeHeistWorld(2);
    assert.equal(standings(makeSeats(5), world.thieves).length, 2);
  });
});

describe('scoring — the clocks', () => {
  it('counts the countdown down before the heist clock starts', () => {
    const world = makeWorld();
    assert.equal(countdownRemaining(world), Math.ceil(world.countdownMs / 1000));
    assert.equal(secondsRemaining(world), Math.ceil(world.heistMs / 1000));
  });

  it('runs the heist clock from the end of the countdown', () => {
    const world = makeHeistWorld();
    world.elapsedMs = world.countdownMs + 30_000;
    assert.equal(countdownRemaining(world), 0);
    assert.equal(secondsRemaining(world), Math.ceil(world.heistMs / 1000) - 30);
  });

  it('switches to the escape clock once the door opens', () => {
    const world = makeHeistWorld();
    world.phase = PHASE_ESCAPE;
    world.escapeStartedMs = world.elapsedMs;
    assert.equal(secondsRemaining(world), Math.ceil(world.escapeMs / 1000));

    world.elapsedMs += 20_000;
    assert.equal(secondsRemaining(world), Math.ceil(world.escapeMs / 1000) - 20);

    world.elapsedMs += world.escapeMs;
    assert.equal(secondsRemaining(world), 0);
  });
});

describe('scoring — the outcome', () => {
  it('treats waking him as the end of the round, and not a win', () => {
    const world = makeHeistWorld();
    world.phase = PHASE_WOKEN;
    world.bankedTotal = 120;

    assert.equal(isOver(world), true);
    assert.equal(crewSucceeded(world), false);
  });

  it('only counts a getaway that actually carried something out', () => {
    const world = makeHeistWorld();
    world.phase = PHASE_ESCAPED;
    assert.equal(crewSucceeded(world), false);

    world.bankedTotal = 10;
    assert.equal(crewSucceeded(world), true);
  });
});
