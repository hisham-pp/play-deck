import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  BODY_STATIC,
  centreVertices,
  createBody,
  polygonArea,
  worldNormals,
  worldVertices,
} from './body';
import { collide } from './collision';
import { boxVertices } from './shapes';
import { vec } from './vector';
import { PhysicsWorld } from './world';

const GRAVITY = vec(0, -14);
const STEP = 1 / 120;

function ground(y = 0, width = 40) {
  return createBody({
    id: 'ground',
    type: BODY_STATIC,
    vertices: boxVertices(width, 1),
    position: vec(0, y - 0.5),
    friction: 0.8,
  });
}

function crate(id: string, x: number, y: number, size = 1) {
  return createBody({
    id,
    vertices: boxVertices(size, size),
    position: vec(x, y),
    density: 1,
    friction: 0.6,
  });
}

function settle(world: PhysicsWorld, steps: number) {
  for (let i = 0; i < steps; i += 1) world.step(STEP);
}

describe('polygon mass properties', () => {
  it('measures the area of a counter-clockwise box', () => {
    assert.equal(polygonArea(boxVertices(2, 3)), 6);
  });

  it('recentres a hull on its centroid', () => {
    const shifted = boxVertices(2, 2).map((v) => vec(v.x + 5, v.y - 3));
    const centred = centreVertices(shifted);
    const sumX = centred.reduce((total, v) => total + v.x, 0);
    const sumY = centred.reduce((total, v) => total + v.y, 0);
    assert.ok(Math.abs(sumX) < 1e-9);
    assert.ok(Math.abs(sumY) < 1e-9);
  });

  it('points box face normals outwards', () => {
    const body = createBody({ id: 'b', vertices: boxVertices(2, 2), position: vec(0, 0) });
    const normals = worldNormals(worldVertices(body));
    assert.deepEqual(
      normals.map((n) => [Math.round(n.x) + 0, Math.round(n.y) + 0]),
      [
        [0, -1],
        [1, 0],
        [0, 1],
        [-1, 0],
      ],
    );
  });
});

describe('collision detection', () => {
  it('finds no manifold for separated boxes', () => {
    assert.equal(collide(crate('a', 0, 0), crate('b', 5, 0)), null);
  });

  it('reports a normal pointing from the first body to the second', () => {
    const manifold = collide(crate('a', 0, 0), crate('b', 0, 0.9));
    assert.ok(manifold);
    assert.ok(manifold.normal.y > 0.9, `normal was ${JSON.stringify(manifold.normal)}`);
    assert.ok(manifold.contacts.length > 0);
  });

  it('measures penetration depth along the shallowest axis', () => {
    const manifold = collide(crate('a', 0, 0), crate('b', 0, 0.75));
    assert.ok(manifold);
    const deepest = Math.max(...manifold.contacts.map((c) => c.penetration));
    assert.ok(Math.abs(deepest - 0.25) < 0.02, `penetration was ${deepest}`);
  });
});

describe('PhysicsWorld', () => {
  it('drops a crate onto the ground and lets it rest', () => {
    const world = new PhysicsWorld({ gravity: GRAVITY });
    world.add(ground());
    const box = world.add(crate('box', 0, 4));

    settle(world, 600);

    assert.ok(Math.abs(box.position.y - 0.5) < 0.05, `rested at ${box.position.y}`);
    assert.ok(Math.abs(box.velocity.y) < 0.1, `still moving at ${box.velocity.y}`);
  });

  it('keeps a three-crate stack standing', () => {
    const world = new PhysicsWorld({ gravity: GRAVITY });
    world.add(ground());
    const lower = world.add(crate('lower', 0, 0.5));
    const middle = world.add(crate('middle', 0, 1.5));
    const upper = world.add(crate('upper', 0, 2.5));

    settle(world, 900);

    assert.ok(Math.abs(lower.position.y - 0.5) < 0.06);
    assert.ok(Math.abs(middle.position.y - 1.5) < 0.1);
    assert.ok(Math.abs(upper.position.y - 2.5) < 0.16, `top crate at ${upper.position.y}`);
    assert.ok(Math.abs(upper.position.x) < 0.1, `top crate drifted to ${upper.position.x}`);
  });

  it('never lets a crate tunnel below a static floor', () => {
    const world = new PhysicsWorld({ gravity: vec(0, -40) });
    world.add(ground());
    const box = world.add(crate('box', 0, 10));

    settle(world, 900);

    assert.ok(box.position.y > 0.3, `fell through to ${box.position.y}`);
  });

  it('slides a crate off the end of a tilted platform', () => {
    const world = new PhysicsWorld({ gravity: GRAVITY });
    const platform = createBody({
      id: 'platform',
      type: BODY_STATIC,
      vertices: boxVertices(6, 0.4),
      position: vec(0, 0),
      angle: 0.55,
      friction: 0.05,
    });
    world.add(platform);
    const box = world.add(crate('box', 0, 0.6));

    settle(world, 600);

    assert.ok(box.position.x < -1, `crate stayed put at x=${box.position.x}`);
  });
});
