import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  MOOD_ASLEEP,
  MOOD_AWAKE,
  MOOD_RESTLESS,
  MOOD_STIRRING,
  MUFFLE_MS,
  NOISE_DECAY_PER_SEC,
  NOISE_MAX,
  QUIET_ZONE_FACTOR,
} from './giant-constants';
import {
  addNoise,
  decayNoise,
  dampingFor,
  expireRipples,
  moodFor,
  quietFactorAt,
  relieveNoise,
} from './noise';
import { makeHeistWorld } from './test-helpers';

describe('noise — damping', () => {
  it('carries sound fully on bare floor', () => {
    const world = makeHeistWorld();
    assert.equal(quietFactorAt({ x: 480, y: 40 }, world.map.quietZones), 1);
  });

  it('damps hardest at the centre of a quiet zone', () => {
    const world = makeHeistWorld();
    const zone = world.map.quietZones[0];
    assert.ok(Math.abs(quietFactorAt(zone.pos, world.map.quietZones) - QUIET_ZONE_FACTOR) < 1e-9);

    const rim = { x: zone.pos.x + zone.radius * 0.99, y: zone.pos.y };
    const edge = quietFactorAt(rim, world.map.quietZones);
    assert.ok(edge > QUIET_ZONE_FACTOR && edge < 1, 'the rim should be a partial damp');
  });

  it('stacks a muffle charm on top of the floor', () => {
    const world = makeHeistWorld();
    const thief = world.thieves[0];
    thief.pos = { x: 480, y: 40 };
    assert.equal(dampingFor(thief, world), 1);

    thief.muffledUntilMs = world.elapsedMs + MUFFLE_MS;
    assert.ok(dampingFor(thief, world) < 1);
  });
});

describe('noise — the shared meter', () => {
  it('attributes what it adds and remembers the peak', () => {
    const world = makeHeistWorld();
    const thief = world.thieves[0];
    thief.pos = { x: 480, y: 40 };

    const applied = addNoise(world, { source: 'bump', thief, amount: 12 });
    assert.equal(applied, 12);
    assert.equal(world.noise, 12);
    assert.equal(thief.noiseMade, 12);
    assert.equal(world.peakNoise, 12);

    relieveNoise(world, 8);
    assert.equal(world.noise, 4);
    assert.equal(world.peakNoise, 12, 'relief does not erase how loud it got');
  });

  it('never pushes the meter past full', () => {
    const world = makeHeistWorld();
    world.noise = NOISE_MAX - 2;
    addNoise(world, { source: 'struck', thief: world.thieves[0], amount: 50 });
    assert.equal(world.noise, NOISE_MAX);
  });

  it('draws a ripple for discrete events but not for footfalls', () => {
    const world = makeHeistWorld();
    addNoise(world, { source: 'collect', thief: world.thieves[0], amount: 6 });
    assert.equal(world.ripples.length, 1);

    addNoise(world, { source: 'step', thief: world.thieves[0], amount: 0.4, silentRipple: true });
    assert.equal(world.ripples.length, 1);
  });

  it('settles on its own, and never below silence', () => {
    const world = makeHeistWorld();
    world.noise = 10;
    decayNoise(world, 1);
    assert.ok(Math.abs(world.noise - (10 - NOISE_DECAY_PER_SEC)) < 1e-9);

    decayNoise(world, 60);
    assert.equal(world.noise, 0);
  });

  it('retires ripples once they have faded', () => {
    const world = makeHeistWorld();
    addNoise(world, { source: 'bump', thief: world.thieves[0], amount: 5 });
    assert.equal(expireRipples(world.ripples, world.elapsedMs).length, 1);
    assert.equal(expireRipples(world.ripples, world.elapsedMs + 5000).length, 0);
  });
});

describe('noise — mood thresholds', () => {
  it('escalates the giant strictly with the meter', () => {
    assert.equal(moodFor(0), MOOD_ASLEEP);
    assert.equal(moodFor(49.9), MOOD_ASLEEP);
    assert.equal(moodFor(50), MOOD_STIRRING);
    assert.equal(moodFor(74.9), MOOD_STIRRING);
    assert.equal(moodFor(75), MOOD_RESTLESS);
    assert.equal(moodFor(NOISE_MAX), MOOD_AWAKE);
  });
});
