import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { ShadowTagInput, ShadowTagSeat } from '../types/shadow-tag.types';
import {
  COUNTDOWN_MS,
  PHASE_COUNTDOWN,
  PHASE_PLAYING,
  PHASE_ROUND_OVER,
  SEAT_COLORS,
  TAG_POINTS,
} from './shadow-tag-constants';
import { ShadowTagEngine } from './shadow-tag-engine';
import type { RoundSetup } from './shadow-tag-state';

const IDLE: ShadowTagInput = { moveX: 0, moveY: 0, sneak: false, block: false, redirect: false };

function setup(count = 3): RoundSetup {
  const seats: ShadowTagSeat[] = Array.from({ length: count }, (_, index) => ({
    id: `p${index + 1}`,
    displayName: `Player ${index + 1}`,
    avatar: '🕹️',
    type: 'human',
    seatIndex: index,
    color: SEAT_COLORS[index],
  }));
  return { seats, arenaId: 'atrium', roundMs: 20_000, itId: 'p1' };
}

function run(engine: ShadowTagEngine, seconds: number, authoritative = true) {
  const inputs: Record<string, ShadowTagInput> = {};
  for (const runner of engine.getWorld().players) inputs[runner.id] = IDLE;
  const results = [];
  for (let i = 0; i < Math.round(seconds * 60); i++) {
    results.push(engine.step(1 / 60, inputs, { authoritative }));
  }
  return results;
}

describe('ShadowTagEngine', () => {
  it('holds the countdown before play opens', () => {
    const engine = new ShadowTagEngine(setup());
    assert.equal(engine.getWorld().phase, PHASE_COUNTDOWN);

    run(engine, COUNTDOWN_MS / 1000 - 0.5);
    assert.equal(engine.getWorld().phase, PHASE_COUNTDOWN);

    run(engine, 1);
    assert.equal(engine.getWorld().phase, PHASE_PLAYING);
  });

  it('scores nobody until the countdown clears', () => {
    const engine = new ShadowTagEngine(setup());
    run(engine, COUNTDOWN_MS / 1000 - 0.5);
    assert.equal(engine.getWorld().players[1].score, 0);

    run(engine, 2);
    assert.ok(engine.getWorld().players[1].score > 0);
  });

  it('closes the round exactly once when the clock runs out', () => {
    const engine = new ShadowTagEngine(setup());
    const results = run(engine, COUNTDOWN_MS / 1000 + 21);
    assert.equal(engine.getWorld().phase, PHASE_ROUND_OVER);
    assert.equal(results.filter((result) => result.roundEnded).length, 1);
  });

  it('leaves scoring alone on a non-authoritative client', () => {
    const engine = new ShadowTagEngine(setup());
    run(engine, COUNTDOWN_MS / 1000 + 2, false);
    assert.equal(engine.getWorld().players[1].score, 0);
    assert.equal(engine.getWorld().phase, PHASE_PLAYING, 'phase still advances locally');
  });

  it('adopts a tag the host settled', () => {
    const engine = new ShadowTagEngine(setup());
    run(engine, COUNTDOWN_MS / 1000 + 1, false);

    engine.applyRemoteTag({ taggerId: 'p1', victimId: 'p3', atMs: 100, at: { x: 10, y: 10 } });
    const world = engine.getWorld();
    assert.equal(world.itId, 'p3');
    assert.equal(world.players[0].tags, 1);
    assert.equal(world.players[0].score, TAG_POINTS);
    assert.equal(world.players[2].timesTagged, 1);
  });

  it('ignores a replayed tag for the player already holding the mark', () => {
    const engine = new ShadowTagEngine(setup());
    engine.applyRemoteTag({ taggerId: 'p2', victimId: 'p1', atMs: 1, at: { x: 0, y: 0 } });
    assert.equal(engine.getWorld().players[1].tags, 0);
  });

  it('parks a dropped player and puts remote bodies where their client says', () => {
    const engine = new ShadowTagEngine(setup());
    engine.setConnected('p2', false);
    engine.placeRunner('p3', { x: 400, y: 120 }, 1.2);

    const world = engine.getWorld();
    assert.equal(world.players[1].connected, false);
    assert.deepEqual(world.players[2].pos, { x: 400, y: 120 });
    assert.equal(world.players[2].facing, 1.2);
    assert.ok(
      engine.getCasts().every((cast) => cast.playerId !== 'p2'),
      'a dropped player stops casting',
    );
  });

  it('restarts cleanly onto a new arena', () => {
    const engine = new ShadowTagEngine(setup());
    run(engine, COUNTDOWN_MS / 1000 + 3);
    engine.reset({ ...setup(), arenaId: 'cellar', itId: 'p2' });

    const world = engine.getWorld();
    assert.equal(world.phase, PHASE_COUNTDOWN);
    assert.equal(world.elapsedMs, 0);
    assert.equal(world.itId, 'p2');
    assert.equal(world.arena.id, 'cellar');
    assert.equal(world.players[1].score, 0);
  });
});
