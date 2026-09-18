import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  BASE_FRICTION,
  CUP_CAPTURE_MAX_SPEED,
  pointToSegmentDistance,
  SAND_FRICTION,
  updateBallPhysics,
} from '../engine/mini-golf-physics';
import type { Ball, HoleDefinition } from '../engine/mini-golf-types';

const MOCK_HOLE: HoleDefinition = {
  id: 1,
  name: 'Test Hole',
  par: 2,
  tee: { x: 100, y: 300 },
  cup: { x: 500, y: 300, radius: 14 },
  walls: [
    // Vertical wall at x = 400 from y = 100 to y = 500
    { p1: { x: 400, y: 100 }, p2: { x: 400, y: 500 }, restitution: 0.8 },
  ],
  sandTraps: [{ x: 200, y: 200, width: 80, height: 80 }],
  waterHazards: [{ x: 300, y: 200, width: 60, height: 60 }],
  bumpers: [{ x: 250, y: 400, radius: 20, impulse: 300 }],
  rotators: [],
  boosters: [],
  portals: [
    {
      entry: { x: 150, y: 150 },
      exit: { x: 450, y: 450 },
      radius: 15,
    },
  ],
};

function createTestBall(overrides: Partial<Ball> = {}): Ball {
  return {
    x: 100,
    y: 300,
    vx: 0,
    vy: 0,
    radius: 7,
    inHole: false,
    inWater: false,
    isResting: false,
    lastLie: { x: 100, y: 300 },
    trail: [],
    ...overrides,
  };
}

describe('Mini Golf Physics — Geometric & Collision Calculations', () => {
  it('correctly calculates distance from point to segment', () => {
    const a = { x: 100, y: 100 };
    const b = { x: 300, y: 100 };

    // Point directly above the center
    const p1 = { x: 200, y: 50 };
    const res1 = pointToSegmentDistance(p1, a, b);
    assert.equal(res1.dist, 50);
    assert.equal(res1.closest.x, 200);
    assert.equal(res1.closest.y, 100);

    // Point beyond end point B
    const p2 = { x: 340, y: 100 };
    const res2 = pointToSegmentDistance(p2, a, b);
    assert.equal(res2.dist, 40);
    assert.equal(res2.closest.x, 300);
    assert.equal(res2.closest.y, 100);
  });

  it('reflects velocity upon colliding with a wall segment', () => {
    // Ball moving right toward vertical wall at x = 400
    const ball = createTestBall({ x: 395, y: 300, vx: 200, vy: 0 });
    const events = updateBallPhysics(ball, MOCK_HOLE, [], 1 / 60);

    assert.equal(events.hitWall, true);
    // After reflecting off vertical wall with normal pointing left, vx should be negative
    assert.ok(ball.vx < 0, `vx should be negative after bounce, got ${ball.vx}`);
  });

  it('bounces away from bumpers with extra impulse', () => {
    // Ball moving toward bumper at (250, 400)
    const ball = createTestBall({ x: 230, y: 400, vx: 100, vy: 0 });
    const events = updateBallPhysics(ball, MOCK_HOLE, [], 1 / 60);

    assert.equal(events.hitBumper, true);
    assert.ok(ball.vx < 0, 'Ball should rebound away from bumper');
    assert.ok(Math.abs(ball.vx) >= 200, 'Bumper should impart impulse boost');
  });

  it('applies stronger friction inside sand traps', () => {
    const greenBall = createTestBall({ x: 50, y: 50, vx: 300, vy: 0 });
    const sandBall = createTestBall({ x: 240, y: 240, vx: 300, vy: 0 }); // inside sand trap (200..280)

    updateBallPhysics(greenBall, MOCK_HOLE, [], 1 / 60);
    updateBallPhysics(sandBall, MOCK_HOLE, [], 1 / 60);

    assert.ok(
      sandBall.vx < greenBall.vx,
      `Sand ball speed (${sandBall.vx}) should be less than green ball (${greenBall.vx})`,
    );
    assert.ok(SAND_FRICTION < BASE_FRICTION);
  });

  it('detects water hazards and halts movement', () => {
    // Ball positioned inside water hazard (300..360, 200..260)
    const ball = createTestBall({ x: 320, y: 220, vx: 150, vy: 0 });
    const events = updateBallPhysics(ball, MOCK_HOLE, [], 1 / 60);

    assert.equal(events.hitWater, true);
    assert.equal(ball.inWater, true);
    assert.equal(ball.vx, 0);
    assert.equal(ball.vy, 0);
  });

  it('drops into the cup when passing close at controlled speed', () => {
    // Ball near cup (500, 300) with gentle speed < CUP_CAPTURE_MAX_SPEED
    const ball = createTestBall({ x: 498, y: 300, vx: 50, vy: 0 });
    const events = updateBallPhysics(ball, MOCK_HOLE, [], 1 / 60);

    assert.equal(events.inHole, true);
    assert.equal(ball.inHole, true);
    assert.equal(ball.x, 500);
    assert.equal(ball.y, 300);
    assert.equal(ball.vx, 0);
    assert.equal(ball.vy, 0);
  });

  it('lips out when passing over the cup too fast', () => {
    // Ball moving very fast across the cup
    const ball = createTestBall({
      x: 498,
      y: 300,
      vx: CUP_CAPTURE_MAX_SPEED + 150,
      vy: 0,
    });
    const events = updateBallPhysics(ball, MOCK_HOLE, [], 1 / 60);

    assert.equal(events.inHole, false);
    assert.equal(events.lipOut, true);
    assert.equal(ball.inHole, false);
  });

  it('teleports through portals to exit location', () => {
    // Ball inside portal entry (150, 150)
    const ball = createTestBall({ x: 150, y: 150, vx: 100, vy: 50 });
    const events = updateBallPhysics(ball, MOCK_HOLE, [], 1 / 60);

    assert.equal(events.hitPortal, true);
    assert.equal(ball.x, 450);
    assert.equal(ball.y, 450);
  });
});
