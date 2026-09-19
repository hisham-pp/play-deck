import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { breathPhase, limbSegment, limbStrikes, limbTouching, updateGiant } from './giant-ai';
import { MOOD_ASLEEP, MOOD_AWAKE, MOOD_RESTLESS, MOOD_STIRRING } from './giant-constants';
import { makeHeistWorld } from './test-helpers';

describe('giant — sleeping', () => {
  it('holds its arms still while nobody has made a sound', () => {
    const world = makeHeistWorld();
    const limb = world.giant.limbs[0];
    const before = limb.angle;

    for (let i = 0; i < 60; i++) updateGiant(world.giant, MOOD_ASLEEP, 1 / 60);

    assert.ok(Math.abs(limb.angle - before) < 1e-6, 'a sleeping arm should not travel');
  });

  it('breathes regardless of mood', () => {
    const world = makeHeistWorld();
    updateGiant(world.giant, MOOD_ASLEEP, 0.5);
    assert.equal(world.giant.breathMs, 500);

    const phase = breathPhase(world.giant, MOOD_ASLEEP);
    assert.ok(phase >= 0 && phase <= 1);
  });
});

describe('giant — stirring', () => {
  it('drifts each arm to the far end of its arc, changing the routes through the room', () => {
    const world = makeHeistWorld();
    const limb = world.giant.limbs[0];
    const before = limb.angle;

    for (let i = 0; i < 180; i++) updateGiant(world.giant, MOOD_STIRRING, 1 / 60);

    assert.ok(Math.abs(limb.angle - before) > 0.05, 'a stirring arm should have moved');
    assert.ok(limb.angle <= limb.sweepTo + 1e-6 && limb.angle >= limb.sweepFrom - 1e-6);
  });

  it('settles back towards rest once the room goes quiet again', () => {
    const world = makeHeistWorld();
    const limb = world.giant.limbs[0];
    const rest = (limb.sweepFrom + limb.sweepTo) / 2;

    for (let i = 0; i < 300; i++) updateGiant(world.giant, MOOD_STIRRING, 1 / 60);
    const stirred = Math.abs(limb.angle - rest);

    for (let i = 0; i < 600; i++) updateGiant(world.giant, MOOD_ASLEEP, 1 / 60);
    assert.ok(Math.abs(limb.angle - rest) < stirred);
  });
});

describe('giant — restless', () => {
  it('sweeps an arm across its arc and turns round at the end', () => {
    const world = makeHeistWorld();
    const limb = world.giant.limbs[0];
    limb.angle = limb.sweepTo - 0.01;
    limb.dir = 1;

    for (let i = 0; i < 30; i++) updateGiant(world.giant, MOOD_RESTLESS, 1 / 60);

    assert.equal(limb.dir, -1, 'the arm should have reversed at the end of the arc');
    assert.ok(limb.angle <= limb.sweepTo + 1e-9);
  });

  it('stays inside its arc over a long sweep', () => {
    const world = makeHeistWorld();
    const limb = world.giant.limbs[0];

    for (let i = 0; i < 2000; i++) {
      updateGiant(world.giant, MOOD_RESTLESS, 1 / 60);
      assert.ok(limb.angle >= limb.sweepFrom - 1e-6 && limb.angle <= limb.sweepTo + 1e-6);
    }
  });
});

describe('giant — contact', () => {
  it('finds the arm a thief is standing on', () => {
    const world = makeHeistWorld();
    const limb = world.giant.limbs[0];
    const { b } = limbSegment(limb);

    assert.equal(limbTouching(world.giant, b)?.id, limb.id);
    assert.equal(limbTouching(world.giant, { x: 20, y: 20 }), null);
  });

  it('only swats people once the arms are actually moving', () => {
    const world = makeHeistWorld();
    const thief = world.thieves[0];
    thief.pos = { ...limbSegment(world.giant.limbs[0]).b };

    assert.equal(limbStrikes(world.giant, MOOD_ASLEEP, thief), false);
    assert.equal(limbStrikes(world.giant, MOOD_STIRRING, thief), false);
    assert.equal(limbStrikes(world.giant, MOOD_RESTLESS, thief), true);
    assert.equal(limbStrikes(world.giant, MOOD_AWAKE, thief), false);
  });
});
