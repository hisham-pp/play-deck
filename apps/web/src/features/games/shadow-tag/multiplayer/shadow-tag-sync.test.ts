import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { PHASE_ROUND_OVER, SEAT_COLORS } from '../engine/shadow-tag-constants';
import { ShadowTagEngine } from '../engine/shadow-tag-engine';
import type { RoundSetup } from '../engine/shadow-tag-state';
import type { ShadowTagSeat } from '../types/shadow-tag.types';
import { applySnapshot, buildSnapshot } from './shadow-tag-sync';

function setup(): RoundSetup {
  const seats: ShadowTagSeat[] = ['p1', 'p2', 'p3'].map((id, index) => ({
    id,
    displayName: id,
    avatar: '🕹️',
    type: 'human',
    seatIndex: index,
    color: SEAT_COLORS[index],
  }));
  return { seats, arenaId: 'atrium', roundMs: 30_000, itId: 'p1' };
}

describe('host snapshots', () => {
  it('carries the clock, the mark, every lamp and every score', () => {
    const host = new ShadowTagEngine(setup());
    const world = host.getWorld();
    world.elapsedMs = 4321.6;
    world.itId = 'p2';
    world.players[0].score = 120.4;
    world.players[0].tags = 2;

    const snapshot = buildSnapshot(host, 'r1');
    assert.equal(snapshot.elapsedMs, 4322);
    assert.equal(snapshot.itId, 'p2');
    assert.equal(snapshot.ended, false);
    assert.equal(snapshot.lights.length, world.lights.length);
    assert.equal(snapshot.scores[0].score, 120);
    assert.equal(snapshot.scores[0].tags, 2);
  });

  it('flags a finished round', () => {
    const host = new ShadowTagEngine(setup());
    host.endRound();
    assert.equal(buildSnapshot(host, 'r1').ended, true);
  });
});

describe('applying a snapshot on a guest', () => {
  it('settles the mark, the lamps and the scores', () => {
    const host = new ShadowTagEngine(setup());
    const guest = new ShadowTagEngine(setup());

    const hostWorld = host.getWorld();
    hostWorld.itId = 'p3';
    hostWorld.lights[0].intensity = 0.25;
    hostWorld.lights[0].blockedUntilMs = 8000;
    hostWorld.lights[0].speed = -0.5;
    hostWorld.players[1].score = 90;
    hostWorld.players[1].timesTagged = 1;

    applySnapshot(guest, buildSnapshot(host, 'r1'));

    const guestWorld = guest.getWorld();
    assert.equal(guestWorld.itId, 'p3');
    assert.equal(guestWorld.lights[0].intensity, 0.25);
    assert.equal(guestWorld.lights[0].blockedUntilMs, 8000);
    assert.equal(guestWorld.lights[0].speed, -0.5);
    assert.equal(guestWorld.players[1].score, 90);
    assert.equal(guestWorld.players[1].timesTagged, 1);
  });

  it('eases a small clock drift but snaps a large one', () => {
    const guest = new ShadowTagEngine(setup());
    const host = new ShadowTagEngine(setup());

    host.getWorld().elapsedMs = 400;
    applySnapshot(guest, buildSnapshot(host, 'r1'));
    assert.ok(guest.getWorld().elapsedMs > 0 && guest.getWorld().elapsedMs < 400);

    host.getWorld().elapsedMs = 20_000;
    applySnapshot(guest, buildSnapshot(host, 'r1'));
    assert.equal(guest.getWorld().elapsedMs, 20_000);
  });

  it('never moves bodies, which ride the pose channel instead', () => {
    const guest = new ShadowTagEngine(setup());
    const host = new ShadowTagEngine(setup());
    guest.placeRunner('p2', { x: 12, y: 34 }, 0);

    applySnapshot(guest, buildSnapshot(host, 'r1'));
    assert.deepEqual(guest.getWorld().players[1].pos, { x: 12, y: 34 });
  });

  it('ends the guest round when the host says the clock ran out', () => {
    const guest = new ShadowTagEngine(setup());
    const host = new ShadowTagEngine(setup());
    host.endRound();

    applySnapshot(guest, buildSnapshot(host, 'r1'));
    assert.equal(guest.getWorld().phase, PHASE_ROUND_OVER);
  });

  it('ignores patches for lamps and players it does not have', () => {
    const guest = new ShadowTagEngine(setup());
    applySnapshot(guest, {
      roundId: 'r1',
      elapsedMs: 0,
      itId: 'p1',
      ended: false,
      lights: [{ id: 'nope', angle: 1, speed: 1, intensity: 0, blockedUntilMs: 0 }],
      scores: [{ id: 'ghost', score: 999, tags: 9, timesTagged: 9 }],
    });
    assert.ok(guest.getWorld().players.every((runner) => runner.score === 0));
  });
});
