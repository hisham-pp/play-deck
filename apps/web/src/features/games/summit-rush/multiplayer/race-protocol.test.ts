import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createWorld } from '../engine/summit-engine';
import { DEFAULT_UPGRADES } from '../engine/upgrades';
import {
  decideRaceOutcome,
  decodePose,
  encodeSnapshot,
  GHOST_RENDER_DELAY_MS,
  GhostTrack,
  isGhostSnapshot,
  isRaceFinish,
  isRaceStart,
} from './race-protocol';

const pose = (x: number) => [x, 1, 0, x - 1, 0, 0, x + 1, 0, 0];

describe('Summit Rush — race protocol', () => {
  it('round-trips a world snapshot through the wire guard', () => {
    const world = createWorld(9, DEFAULT_UPGRADES);
    const snapshot = JSON.parse(JSON.stringify(encodeSnapshot(world, 'race-1', 1234)));
    assert.ok(isGhostSnapshot(snapshot));
    assert.equal(snapshot.pose.length, 9);
    const decoded = decodePose(snapshot.pose);
    assert.ok(Math.abs(decoded.x - world.vehicle.pos.x) < 0.01);
    assert.equal(decoded.wheels.length, 2);
  });

  it('rejects malformed payloads', () => {
    assert.equal(
      isGhostSnapshot({ raceId: 'r', pose: [1, 2], distance: 0, score: 0, status: 'running' }),
      false,
    );
    assert.equal(
      isGhostSnapshot({ raceId: 'r', pose: pose(1), distance: 0, score: 0, status: 'flying' }),
      false,
    );
    assert.equal(isGhostSnapshot(null), false);
    assert.equal(isRaceStart({ raceId: 'r', seed: 'x' }), false);
    assert.equal(isRaceStart({ raceId: 'r', seed: 12 }), true);
    assert.equal(
      isRaceFinish({ raceId: 'r', distance: 1, score: 2, coins: 3, reason: 'head' }),
      true,
    );
    assert.equal(isRaceFinish({ raceId: 'r', distance: 1 }), false);
  });

  it('interpolates ghost poses between buffered snapshots', () => {
    const track = new GhostTrack();
    assert.equal(track.sample(0), null);
    track.push(pose(0), 1000);
    track.push(pose(10), 1100);
    const mid = track.sample(1050 + GHOST_RENDER_DELAY_MS);
    assert.ok(mid && Math.abs(mid.x - 5) < 1e-9);
    const early = track.sample(900 + GHOST_RENDER_DELAY_MS);
    assert.equal(early?.x, 0);
  });

  it('extrapolates briefly past the newest snapshot, then holds', () => {
    const track = new GhostTrack();
    track.push(pose(0), 1000);
    track.push(pose(10), 1100);
    const ahead = track.sample(1150 + GHOST_RENDER_DELAY_MS);
    assert.ok(ahead && Math.abs(ahead.x - 15) < 1e-9);
    const capped = track.sample(5000 + GHOST_RENDER_DELAY_MS);
    assert.ok(capped && Math.abs(capped.x - 35) < 1e-9);
  });

  it('decides races by distance, then score', () => {
    assert.equal(
      decideRaceOutcome({ distance: 300, score: 1 }, { distance: 200, score: 9 }),
      'win',
    );
    assert.equal(
      decideRaceOutcome({ distance: 200, score: 1 }, { distance: 300, score: 0 }),
      'lose',
    );
    assert.equal(
      decideRaceOutcome({ distance: 200, score: 5 }, { distance: 200, score: 4 }),
      'win',
    );
    assert.equal(
      decideRaceOutcome({ distance: 200, score: 5 }, { distance: 200, score: 5 }),
      'draw',
    );
  });
});
