import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { GiantInput } from '../types/giant.types';
import {
  CARRY_SLOW_FLOOR,
  RUN_SPEED,
  THIEF_RADIUS,
  TIPTOE_SPEED,
  WALK_SPEED,
} from './giant-constants';
import { gaitFor, resolveCollisions, resolveThiefPairs, speedFor, stepThief } from './movement';

/** How far `resolveCollisions` had to shove a point to settle it. */
function shove(pos: { x: number; y: number }, map: Parameters<typeof resolveCollisions>[1]) {
  const push = resolveCollisions(pos, map);
  return Math.hypot(push.x, push.y);
}
import { makeHeistWorld } from './test-helpers';

function input(overrides: Partial<GiantInput> = {}): GiantInput {
  return { moveX: 0, moveY: 0, run: false, tiptoe: false, interact: false, ...overrides };
}

describe('movement — gait', () => {
  it('lets tiptoe override a held run, so panic cannot make you loud by accident', () => {
    assert.equal(gaitFor(input()), 'walk');
    assert.equal(gaitFor(input({ run: true })), 'run');
    assert.equal(gaitFor(input({ tiptoe: true })), 'tiptoe');
    assert.equal(gaitFor(input({ tiptoe: true, run: true })), 'tiptoe');
  });

  it('prices each gait apart', () => {
    const world = makeHeistWorld();
    const thief = world.thieves[0];

    thief.gait = 'tiptoe';
    assert.equal(speedFor(thief), TIPTOE_SPEED);
    thief.gait = 'walk';
    assert.equal(speedFor(thief), WALK_SPEED);
    thief.gait = 'run';
    assert.equal(speedFor(thief), RUN_SPEED);
  });

  it('slows a loaded thief, but never to a standstill', () => {
    const world = makeHeistWorld();
    const thief = world.thieves[0];
    thief.gait = 'walk';

    thief.carriedCount = 4;
    assert.ok(speedFor(thief) < WALK_SPEED);

    thief.carriedCount = 500;
    assert.equal(speedFor(thief), WALK_SPEED * CARRY_SLOW_FLOOR);
  });
});

describe('movement — collision', () => {
  it('pushes a thief out of a pillar', () => {
    const world = makeHeistWorld();
    const box = world.map.obstacles[0];
    const pos = { x: box.x + box.w / 2, y: box.y + box.h / 2 };

    assert.ok(shove(pos, world.map) > 0);
    assert.ok(
      pos.x <= box.x || pos.x >= box.x + box.w || pos.y <= box.y || pos.y >= box.y + box.h,
      'the thief should end up outside the box',
    );
  });

  it('pushes a thief off the giant, head and arms alike', () => {
    const world = makeHeistWorld();
    const { head } = world.map.giant;

    const onHead = { ...head.pos };
    assert.ok(shove(onHead, world.map) > 0);
    assert.ok(Math.hypot(onHead.x - head.pos.x, onHead.y - head.pos.y) >= head.radius);

    const limb = world.map.giant.limbs[0];
    const onArm = { ...limb.pivot };
    assert.ok(shove(onArm, world.map) > 0);
  });

  it('keeps everyone inside the room', () => {
    const world = makeHeistWorld();
    const pos = { x: -400, y: 9000 };
    assert.ok(shove(pos, world.map) > 0);
    assert.equal(pos.x, THIEF_RADIUS);
    assert.equal(pos.y, world.map.height - THIEF_RADIUS);
  });

  it('reports open floor as untouched', () => {
    const world = makeHeistWorld();
    assert.equal(shove({ x: 480, y: 40 }, world.map), 0);
  });

  it('stops moving a thief who is already resting against a wall', () => {
    const world = makeHeistWorld();
    const box = world.map.obstacles[0];
    const pos = { x: box.x + box.w / 2, y: box.y - THIEF_RADIUS };

    // Standing still while touching something must not read as a fresh
    // collision, or leaning on the scenery would fill the meter on its own.
    assert.equal(shove(pos, world.map), 0);
  });
});

describe('movement — stepping', () => {
  it('accelerates towards the held direction and faces it', () => {
    const world = makeHeistWorld();
    const thief = world.thieves[0];
    thief.pos = { x: 480, y: 40 };

    for (let i = 0; i < 12; i++) stepThief(thief, input({ moveX: 1 }), world, 1 / 60);

    assert.ok(thief.vel.x > 0);
    assert.ok(thief.pos.x > 480);
    assert.ok(Math.abs(thief.facing) < 0.01, 'heading due east');
  });

  it('reports a bump when a thief runs into something solid', () => {
    const world = makeHeistWorld();
    const thief = world.thieves[0];
    const box = world.map.obstacles[0];
    thief.pos = { x: box.x + box.w / 2, y: box.y - THIEF_RADIUS - 2 };
    thief.vel = { x: 0, y: RUN_SPEED };

    const report = stepThief(thief, input({ moveY: 1, run: true }), world, 1 / 30);
    assert.equal(report.bumped, true);
  });

  it('lets a thief settle silently against a wall instead of crashing forever', () => {
    const world = makeHeistWorld();
    const thief = world.thieves[0];
    const box = world.map.obstacles[0];
    thief.pos = { x: box.x + box.w / 2, y: box.y - THIEF_RADIUS - 2 };
    thief.vel = { x: 0, y: RUN_SPEED };

    // Give it a few frames to come to rest against the wall...
    for (let i = 0; i < 5; i++) stepThief(thief, input({ moveY: 1, run: true }), world, 1 / 60);
    // ...then keep pressing into it. That is one crash, not sixty.
    for (let i = 0; i < 40; i++) {
      const report = stepThief(thief, input({ moveY: 1, run: true }), world, 1 / 60);
      assert.equal(report.bumped, false, `frame ${i} charged a second crash`);
    }
  });

  it('does not charge a tiptoeing thief for easing into a wall', () => {
    const world = makeHeistWorld();
    const thief = world.thieves[0];
    const box = world.map.obstacles[0];
    thief.pos = { x: box.x + box.w / 2, y: box.y - THIEF_RADIUS - 2 };

    for (let i = 0; i < 40; i++) {
      const report = stepThief(thief, input({ moveY: 1, tiptoe: true }), world, 1 / 60);
      assert.equal(report.bumped, false);
    }
  });

  it('does not bank stride time for a thief pinned against a wall', () => {
    const world = makeHeistWorld();
    const thief = world.thieves[0];
    thief.pos = { x: THIEF_RADIUS, y: 300 };

    for (let i = 0; i < 20; i++) stepThief(thief, input({ moveX: -1, run: true }), world, 1 / 60);
    assert.equal(thief.strideMs, 0);
  });
});

describe('movement — crowding', () => {
  it('separates two thieves in the same place and reports a real barge', () => {
    const world = makeHeistWorld(2);
    const [a, b] = world.thieves;
    a.pos = { x: 480, y: 40 };
    b.pos = { x: 484, y: 40 };
    a.vel = { x: RUN_SPEED, y: 0 };

    const collisions = resolveThiefPairs(world.thieves);
    assert.equal(collisions.length, 1);
    assert.ok(Math.hypot(a.pos.x - b.pos.x, a.pos.y - b.pos.y) >= THIEF_RADIUS * 2 - 1e-6);
  });

  it('separates two thieves standing still without charging anybody for it', () => {
    const world = makeHeistWorld(2);
    const [a, b] = world.thieves;
    a.pos = { x: 480, y: 40 };
    b.pos = { x: 484, y: 40 };

    // Shoulder to shoulder and going nowhere. They still get untangled, but
    // this must not be a collision on every frame for as long as they stand there.
    assert.deepEqual(resolveThiefPairs(world.thieves), []);
    assert.ok(Math.hypot(a.pos.x - b.pos.x, a.pos.y - b.pos.y) >= THIEF_RADIUS * 2 - 1e-6);
  });

  it('lets two thieves edge past each other on tiptoe in silence', () => {
    const world = makeHeistWorld(2);
    const [a, b] = world.thieves;
    a.pos = { x: 480, y: 40 };
    b.pos = { x: 484, y: 40 };
    a.vel = { x: TIPTOE_SPEED * 0.9, y: 0 };

    assert.deepEqual(resolveThiefPairs(world.thieves), []);
  });

  it('ignores anyone already out of the door', () => {
    const world = makeHeistWorld(2);
    const [a, b] = world.thieves;
    a.pos = { x: 480, y: 40 };
    b.pos = { x: 480, y: 40 };
    b.escaped = true;

    assert.deepEqual(resolveThiefPairs(world.thieves), []);
  });
});
