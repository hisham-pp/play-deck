import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { detectCrash, updateAirState } from './run-rules';
import { BASE_GRIP } from './summit-constants';
import {
  advanceWorld,
  applyRunToProgress,
  buildRunResult,
  createWorld,
  runScore,
} from './summit-engine';
import type { World } from './summit-types';
import { createTerrain, generateFeature, type TerrainFeature } from './terrain-generator';
import { circleContact, groundHeightAt, pointContact } from './terrain-query';
import { DEFAULT_UPGRADES } from './upgrades';
import type { StepContact } from './vehicle-physics';

const GAS = { gas: true, brake: false };
const IDLE = { gas: false, brake: false };
const FRAME = 1 / 60;

function run(world: World, input: typeof GAS, seconds: number): void {
  for (let t = 0; t < seconds; t += FRAME) advanceWorld(world, input, FRAME);
}

function features(seed: number, untilX: number): TerrainFeature[] {
  const terrain = createTerrain(seed);
  const list: TerrainFeature[] = [];
  while (terrain.cursor.x < untilX) list.push(generateFeature(terrain, list.at(-1)?.kind ?? null));
  return list;
}

describe('Summit Rush — terrain', () => {
  it('is deterministic for a seed so online rivals share a course', () => {
    const a = createTerrain(42);
    const b = createTerrain(42);
    for (let i = 0; i < 30; i++) {
      generateFeature(a, null);
      generateFeature(b, null);
    }
    assert.deepEqual(a.points, b.points);
    assert.deepEqual(a.gaps, b.gaps);
  });

  it('keeps the opening stretch gentle and ravines out of the early course', () => {
    for (let seed = 1; seed <= 25; seed++) {
      for (const f of features(seed, 600)) {
        if (f.startX < 120)
          assert.ok(!['jump', 'gap', 'steep'].includes(f.kind), `${f.kind} @${f.startX}`);
        if (f.kind === 'gap') assert.ok(f.startX > 280);
      }
    }
  });

  it('never generates climbs steeper than stock tires can grip', () => {
    const maxSlope = BASE_GRIP * 0.95;
    for (let seed = 1; seed <= 10; seed++) {
      const terrain = createTerrain(seed);
      while (terrain.cursor.x < 4000) generateFeature(terrain, null);
      const pts = terrain.points;
      for (let i = 1; i < pts.length; i++) {
        const dx = pts[i].x - pts[i - 1].x;
        if (dx < 0.1) continue; // lip drops and ravine walls
        assert.ok(
          (pts[i].y - pts[i - 1].y) / dx < maxSlope,
          `seed ${seed} x=${pts[i].x.toFixed(1)}`,
        );
      }
    }
  });

  it('interpolates height and reports circle / point contacts', () => {
    const terrain = createTerrain(7);
    const h = groundHeightAt(terrain, 5);
    assert.equal(h, 0);
    assert.equal(circleContact(terrain, { x: 5, y: 2 }, 0.5), null);
    const touching = circleContact(terrain, { x: 5, y: 0.3 }, 0.5);
    assert.ok(touching && Math.abs(touching.depth - 0.2) < 1e-9);
    assert.ok(touching && touching.normal.y > 0.99);
    assert.ok(pointContact(terrain, { x: 5, y: -0.4 }));
  });
});

describe('Summit Rush — vehicle physics', () => {
  it('settles upright on flat ground without input', () => {
    const world = createWorld(3, DEFAULT_UPGRADES);
    run(world, IDLE, 2);
    const v = world.vehicle;
    assert.ok(v.wheels.every((w) => w.grounded));
    assert.ok(Math.abs(v.angle) < 0.05);
    assert.ok(Math.hypot(v.vel.x, v.vel.y) < 0.3);
    assert.equal(world.status, 'running');
  });

  it('accelerates forward on gas and slows down on brake', () => {
    const world = createWorld(3, DEFAULT_UPGRADES);
    run(world, GAS, 1.2);
    const fast = world.vehicle.vel.x;
    assert.ok(fast > 5, `speed ${fast}`);
    run(world, { gas: false, brake: true }, 0.5);
    assert.ok(world.vehicle.vel.x < fast - 3);
  });

  it('spins the wheels while driving', () => {
    const world = createWorld(3, DEFAULT_UPGRADES);
    run(world, GAS, 1);
    assert.ok(world.vehicle.wheels.every((w) => w.spin > 5 && w.angle < -1));
  });

  it('a better engine reaches a higher top speed', () => {
    const stock = createWorld(3, DEFAULT_UPGRADES);
    const tuned = createWorld(3, { ...DEFAULT_UPGRADES, engine: 10 });
    run(stock, GAS, 1.5);
    run(tuned, GAS, 1.5);
    assert.ok(tuned.vehicle.vel.x > stock.vehicle.vel.x);
  });

  it('stays numerically stable over a long careful drive', () => {
    const world = createWorld(11, DEFAULT_UPGRADES);
    for (let t = 0; t < 60 && world.status === 'running'; t += FRAME) {
      const a = Math.atan2(Math.sin(world.vehicle.angle), Math.cos(world.vehicle.angle));
      const input = world.air.airborne
        ? { gas: a < -0.15, brake: a > 0.35 }
        : { gas: a < 0.55, brake: a > 0.85 };
      advanceWorld(world, input, FRAME);
      assert.ok(Number.isFinite(world.vehicle.pos.x) && Number.isFinite(world.vehicle.angVel));
    }
    assert.ok(world.stats.distance > 150, `only ${world.stats.distance}m`);
    assert.ok(world.terrain.points.length < 1200, 'old terrain is pruned');
  });
});

describe('Summit Rush — run rules', () => {
  const contact = (over: Partial<StepContact> = {}): StepContact => ({
    wheelsGrounded: 2,
    headHit: false,
    impact: 0,
    ...over,
  });

  it('ends the run when the helmet hits the ground', () => {
    const world = createWorld(1, DEFAULT_UPGRADES);
    detectCrash(world, contact({ headHit: true }), 0.01);
    assert.equal(world.status, 'crashing');
    assert.equal(world.crashReason, 'head');
    run(world, IDLE, 2);
    assert.equal(world.status, 'ended');
  });

  it('flags a rollover only after resting on the roof for a while', () => {
    const world = createWorld(1, DEFAULT_UPGRADES);
    world.vehicle.angle = Math.PI;
    world.vehicle.hullContact = true;
    detectCrash(world, contact({ wheelsGrounded: 0 }), 0.5);
    assert.equal(world.status, 'running');
    detectCrash(world, contact({ wheelsGrounded: 0 }), 0.7);
    assert.equal(world.crashReason, 'flipped');
  });

  it('drains fuel, refills from a can and ends a stalled empty run', () => {
    const world = createWorld(5, DEFAULT_UPGRADES);
    run(world, GAS, 2);
    assert.ok(world.fuel < world.vehicle.spec.fuelCapacity);

    const v = world.vehicle;
    world.collectibles.push({
      id: 999,
      kind: 'fuel',
      pos: { ...v.pos },
      value: 0,
      collected: false,
    });
    world.fuel = 10;
    run(world, IDLE, FRAME);
    assert.ok(world.fuel > 90);

    // Coasting on an empty tank keeps the run alive only while it gains ground.
    world.fuel = 0;
    world.collectibles = [];
    run(world, { gas: false, brake: true }, 5);
    assert.equal(world.crashReason, 'fuel');
  });

  it('collects coins it drives through', () => {
    const world = createWorld(5, DEFAULT_UPGRADES);
    const v = world.vehicle;
    world.collectibles.push({
      id: 998,
      kind: 'coin',
      pos: { x: v.pos.x, y: v.pos.y },
      value: 5,
      collected: false,
    });
    run(world, IDLE, FRAME);
    assert.equal(world.stats.coins, 5);
  });

  it('awards a backflip, air time and a long jump on a clean landing', () => {
    const world = createWorld(1, DEFAULT_UPGRADES);
    Object.assign(world.air, {
      airborne: true,
      airTime: 1.6,
      rotation: Math.PI * 2 + 0.2,
      takeoffX: -20,
    });
    world.vehicle.angle = 0.1;
    updateAirState(world, contact({ impact: 4 }), FRAME);
    assert.equal(world.stats.flips, 1);
    assert.ok(world.stats.stuntScore >= 500 + 190 + 240);
    assert.ok(world.stats.coins >= 20);
    assert.ok(world.popups.some((p) => p.text.startsWith('BACKFLIP')));
    assert.equal(world.air.airborne, false);
  });

  it('scores distance, coins and stunts and folds runs into progress', () => {
    const world = createWorld(1, DEFAULT_UPGRADES);
    Object.assign(world.stats, { distance: 123.7, coins: 40, stuntScore: 500 });
    world.status = 'ended';
    world.crashReason = 'gap';
    assert.equal(runScore(world), 1230 + 200 + 500);

    const progress = {
      coins: 10,
      bestDistance: 100,
      bestScore: 0,
      totalRuns: 2,
      totalDistance: 300,
      upgrades: DEFAULT_UPGRADES,
    };
    const result = buildRunResult(world, progress);
    assert.equal(result.isNewBest, true);
    assert.equal(result.reason, 'gap');
    const next = applyRunToProgress(progress, result);
    assert.deepEqual(
      [next.coins, next.bestDistance, next.totalRuns, next.totalDistance],
      [50, 123, 3, 423],
    );
  });
});
