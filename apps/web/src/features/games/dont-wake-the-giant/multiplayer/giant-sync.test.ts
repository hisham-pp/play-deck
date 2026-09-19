import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { HEIST_MS, PHASE_ESCAPE, PHASE_HEIST, PHASE_WOKEN } from '../engine/giant-constants';
import { GiantEngine } from '../engine/giant-engine';
import { makeSeats } from '../engine/test-helpers';
import { buildSnapshot, applySnapshot } from './giant-sync';

function engine(count = 3) {
  return new GiantEngine({ seats: makeSeats(count), mapId: 'hearth', heistMs: HEIST_MS });
}

/** A host and a guest that started from the same round setup. */
function pair() {
  return { host: engine(), guest: engine() };
}

describe('sync — building a snapshot', () => {
  it('carries the meter, the clocks and what is left on the floor', () => {
    const host = engine();
    const world = host.getWorld();
    world.elapsedMs = 12_345.6;
    world.noise = 41.234;
    world.treasures[0].takenBy = 'p1';
    world.charms[0].usedBy = 'p2';

    const snapshot = buildSnapshot(host, 'r1');

    assert.equal(snapshot.roundId, 'r1');
    assert.equal(snapshot.elapsedMs, 12_346);
    assert.equal(snapshot.noise, 41.23);
    assert.deepEqual(snapshot.taken, [[world.treasures[0].id, 'p1']]);
    assert.deepEqual(snapshot.charms, [[world.charms[0].id, 'p2']]);
    assert.equal(snapshot.hauls.length, world.thieves.length);
    assert.equal(snapshot.limbs.length, world.giant.limbs.length);
  });

  it('leaves positions out — those ride the pose channel instead', () => {
    const snapshot = buildSnapshot(engine(), 'r1');
    assert.equal('positions' in snapshot, false);
    for (const haul of snapshot.hauls) assert.equal('pos' in haul, false);
  });
});

describe('sync — applying a snapshot', () => {
  it('takes the shared meter wholesale rather than easing towards it', () => {
    const { host, guest } = pair();
    host.getWorld().noise = 62;
    guest.getWorld().noise = 8;

    applySnapshot(guest, buildSnapshot(host, 'r1'));
    assert.equal(guest.getWorld().noise, 62);
    assert.equal(guest.getWorld().peakNoise, 62);
  });

  it('eases a small clock drift but snaps a large one', () => {
    const { host, guest } = pair();
    host.getWorld().elapsedMs = 10_400;

    guest.getWorld().elapsedMs = 10_000;
    applySnapshot(guest, buildSnapshot(host, 'r1'));
    assert.ok(guest.getWorld().elapsedMs > 10_000 && guest.getWorld().elapsedMs < 10_400);

    guest.getWorld().elapsedMs = 0;
    applySnapshot(guest, buildSnapshot(host, 'r1'));
    assert.equal(guest.getWorld().elapsedMs, 10_400);
  });

  it('reconciles loot in both directions', () => {
    const { host, guest } = pair();
    const lootId = host.getWorld().treasures[0].id;
    host.getWorld().treasures[0].takenBy = 'p1';
    // The guest optimistically claimed a different piece that the host rejected.
    guest.getWorld().treasures[1].takenBy = 'p2';

    applySnapshot(guest, buildSnapshot(host, 'r1'));

    assert.equal(guest.getWorld().treasures[0].takenBy, 'p1');
    assert.equal(guest.getWorld().treasures[1].takenBy, null, 'the host is the final word');
    assert.equal(guest.getWorld().treasures[0].id, lootId);
  });

  it('settles hauls, escapes and the team total', () => {
    const { host, guest } = pair();
    const thief = host.getWorld().thieves[0];
    thief.banked = 85;
    thief.carried = 20;
    thief.carriedCount = 2;
    thief.escaped = true;
    host.getWorld().bankedTotal = 85;

    applySnapshot(guest, buildSnapshot(host, 'r1'));

    const mirrored = guest.thief('p1');
    assert.equal(mirrored?.banked, 85);
    assert.equal(mirrored?.carried, 20);
    assert.equal(mirrored?.carriedCount, 2);
    assert.equal(mirrored?.escaped, true);
    assert.equal(guest.getWorld().bankedTotal, 85);
  });

  it('lines the arms up so both clients agree which routes are blocked', () => {
    const { host, guest } = pair();
    const limb = host.getWorld().giant.limbs[0];
    limb.angle = 1.5;
    limb.dir = -1;

    applySnapshot(guest, buildSnapshot(host, 'r1'));

    const mirrored = guest.getWorld().giant.limbs[0];
    assert.equal(mirrored.angle, 1.5);
    assert.equal(mirrored.dir, -1);
  });

  it('follows the host into the escape phase', () => {
    const { host, guest } = pair();
    host.getWorld().phase = PHASE_ESCAPE;
    host.getWorld().escapeStartedMs = 9000;

    applySnapshot(guest, buildSnapshot(host, 'r1'));

    assert.equal(guest.getWorld().phase, PHASE_ESCAPE);
    assert.equal(guest.getWorld().escapeStartedMs, 9000);
  });

  it('ends the round on a guest when the host says the giant woke', () => {
    const { host, guest } = pair();
    guest.getWorld().phase = PHASE_HEIST;
    host.finish(PHASE_WOKEN);

    applySnapshot(guest, buildSnapshot(host, 'r1'));

    assert.equal(guest.getWorld().phase, PHASE_WOKEN);
    assert.equal(guest.getWorld().mood, 'awake');
  });
});
