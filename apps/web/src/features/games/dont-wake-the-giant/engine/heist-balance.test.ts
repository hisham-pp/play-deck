import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { GiantInput, GiantSeat } from '../types/giant.types';
import { botInput, claimsOf, createBotMemory, type BotMemory } from './giant-bot';
import { HEIST_MS, MOOD_STIR_AT, NOISE_MAX, PHASE_ESCAPED, PHASE_WOKEN } from './giant-constants';
import { GiantEngine } from './giant-engine';
import { MAP_IDS } from './map-layout';
import { makeSeats } from './test-helpers';

const FRAME = 1 / 60;
/** Long enough to cover the heist clock, the escape clock and some slack. */
const MAX_FRAMES = 60 * 260;

interface Outcome {
  phase: string;
  seconds: number;
  peakNoise: number;
  banked: number;
}

/**
 * Plays a whole heist headlessly. `drive` supplies each thief's intent, which
 * is how the suite below compares a careful crew against a careless one on
 * exactly the same map.
 */
function playOut(
  seats: GiantSeat[],
  mapId: string,
  drive: (game: GiantEngine, memories: Map<string, BotMemory>) => Record<string, GiantInput>,
): Outcome {
  const game = new GiantEngine({ seats, mapId, heistMs: HEIST_MS });
  const memories = new Map(seats.map((seat) => [seat.id, createBotMemory()]));

  for (let frame = 0; frame < MAX_FRAMES; frame++) {
    game.step(FRAME, drive(game, memories), { authoritative: true });
    const { phase } = game.getWorld();
    if (phase === PHASE_WOKEN || phase === PHASE_ESCAPED) break;
  }

  const world = game.getWorld();
  return {
    phase: world.phase,
    seconds: world.elapsedMs / 1000,
    peakNoise: world.peakNoise,
    banked: world.bankedTotal,
  };
}

function botCrew(count: number): GiantSeat[] {
  return makeSeats(count).map((seat) => ({ ...seat, type: 'bot' as const }));
}

/** Everyone plays properly: the bots' own judgement. */
function careful(game: GiantEngine, memories: Map<string, BotMemory>) {
  const world = game.getWorld();
  const claimed = claimsOf(memories.values());
  const inputs: Record<string, GiantInput> = {};
  for (const [id, memory] of memories) {
    const thief = game.thief(id);
    if (thief) inputs[id] = botInput(world, thief, memory, claimed);
  }
  return inputs;
}

/** Everyone sprints everywhere, all the time. The loud way to play. */
function reckless(game: GiantEngine, memories: Map<string, BotMemory>) {
  const inputs = careful(game, memories);
  for (const id of Object.keys(inputs)) {
    inputs[id] = { ...inputs[id], run: true, tiptoe: false };
  }
  return inputs;
}

describe('heist balance — a careful crew', () => {
  for (const crew of [3, 6]) {
    for (const mapId of MAP_IDS) {
      it(`gets ${crew} out of ${mapId} without waking him`, () => {
        const outcome = playOut(botCrew(crew), mapId, careful);

        assert.equal(
          outcome.phase,
          PHASE_ESCAPED,
          `a crew of ${crew} playing carefully woke the giant after ${outcome.seconds.toFixed(0)}s`,
        );
        assert.ok(outcome.peakNoise < NOISE_MAX, 'the meter must never have filled');
        assert.ok(outcome.banked > 0, 'a clean getaway should carry something out');
      });
    }
  }

  it('still gets loud enough to be worth watching', () => {
    // A heist nobody could lose is not a heist. Somewhere in a full crew's run
    // the giant should at least stir, or the meter is decoration.
    const outcome = playOut(botCrew(6), MAP_IDS[0], careful);
    assert.ok(
      outcome.peakNoise >= MOOD_STIR_AT,
      `peaked at only ${outcome.peakNoise.toFixed(0)}; the giant never even stirred`,
    );
  });
});

describe('heist balance — a careless crew', () => {
  it('wakes him by sprinting everywhere', () => {
    const outcome = playOut(botCrew(6), MAP_IDS[0], reckless);

    assert.equal(outcome.phase, PHASE_WOKEN);
    assert.ok(
      outcome.seconds < HEIST_MS / 1000,
      'sprinting should end it well before the clock does',
    );
  });
});

describe('heist balance — a crew that does nothing', () => {
  it('keeps the room silent', () => {
    const still: GiantInput = { moveX: 0, moveY: 0, run: false, tiptoe: false, interact: false };
    const seats = makeSeats(6);
    const game = new GiantEngine({ seats, mapId: MAP_IDS[0], heistMs: HEIST_MS });

    for (let frame = 0; frame < 60 * 30; frame++) {
      const inputs = Object.fromEntries(seats.map((seat) => [seat.id, still]));
      game.step(FRAME, inputs, { authoritative: true });
    }

    assert.equal(game.getWorld().noise, 0, 'standing still must cost nothing at all');
    assert.equal(game.getWorld().mood, 'asleep');
  });
});
