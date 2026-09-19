import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { BallState, CosmicCup, GravityObject } from '../types/gravity-golf.types';
import {
  BALL_RADIUS,
  calculateNetAcceleration,
  checkHazardCollision,
  resolveWallCollisions,
  stepPhysicsTick,
  updateCupInteraction,
} from './gravity-physics';

describe('Gravity Golf Physics — Field Accelerations', () => {
  it('pulls the ball toward an attractor (inward vector)', () => {
    const ballPos = { x: 100, y: 100 };
    const attractor: GravityObject = {
      id: 'att-1',
      type: 'attractor',
      position: { x: 200, y: 100 },
      radius: 20,
      strength: 1,
    };

    const accel = calculateNetAcceleration(ballPos, [attractor]);
    assert.ok(accel.x > 0, `Expected positive x acceleration towards attractor, got ${accel.x}`);
    assert.ok(Math.abs(accel.y) < 0.001, `Expected near zero y acceleration, got ${accel.y}`);
  });

  it('pushes the ball away from a repeller (outward vector)', () => {
    const ballPos = { x: 100, y: 100 };
    const repeller: GravityObject = {
      id: 'rep-1',
      type: 'repeller',
      position: { x: 200, y: 100 },
      radius: 20,
      strength: 1,
    };

    const accel = calculateNetAcceleration(ballPos, [repeller]);
    assert.ok(accel.x < 0, `Expected negative x acceleration away from repeller, got ${accel.x}`);
    assert.ok(Math.abs(accel.y) < 0.001, `Expected near zero y acceleration, got ${accel.y}`);
  });

  it('applies directional boost along the specified direction vector', () => {
    const ballPos = { x: 100, y: 100 };
    const booster: GravityObject = {
      id: 'dir-1',
      type: 'directional',
      position: { x: 100, y: 100 },
      radius: 80,
      strength: 1,
      direction: { x: 0, y: -1 }, // Upward push
    };

    const accel = calculateNetAcceleration(ballPos, [booster]);
    assert.ok(accel.y < -50, `Expected strong upward push, got ${accel.y}`);
  });

  it('applies vortex force in an orbit ring', () => {
    const ring: GravityObject = {
      id: 'ring-1',
      type: 'orbit-ring',
      position: { x: 200, y: 200 },
      radius: 50,
      strength: 1,
    };

    // Ball is at top of orbit ring (200, 150)
    const ballPos = { x: 200, y: 150 };
    const accel = calculateNetAcceleration(ballPos, [ring]);
    // Counter-clockwise tangent at top points left (-x)
    assert.ok(accel.x !== 0, 'Expected tangential acceleration from orbit ring');
  });
});

describe('Gravity Golf Physics — Wall Collisions and Bounces', () => {
  it('reflects velocity off a horizontal wall', () => {
    const ballPos = { x: 100, y: 55 };
    const ballVel = { x: 50, y: -50 }; // moving upwards towards wall at y=50
    const walls = [{ x1: 0, y1: 50, x2: 200, y2: 50 }];

    const result = resolveWallCollisions(ballPos, ballVel, BALL_RADIUS, walls, []);
    assert.ok(result.bounced, 'Expected collision with wall');
    assert.ok(result.vel.y > 0, `Expected downward rebound velocity, got ${result.vel.y}`);
  });
});

describe('Gravity Golf Physics — Hazards and Cup Capture', () => {
  const testCup: CosmicCup = {
    position: { x: 500, y: 300 },
    radius: 18,
    captureRadius: 36,
    captureSpeed: 250,
  };

  it('sinks ball into cup when inside radius with controlled velocity', () => {
    const pos = { x: 505, y: 302 };
    const vel = { x: 20, y: 10 };
    const result = updateCupInteraction(pos, vel, testCup);
    assert.equal(result.status, 'sunk');
  });

  it('funnels ball when within capture radius', () => {
    const pos = { x: 525, y: 300 }; // 25px away (within capture radius 36)
    const vel = { x: -30, y: 0 };
    const result = updateCupInteraction(pos, vel, testCup);
    assert.equal(result.status, 'funneling');
    assert.ok(result.assistAccel && result.assistAccel.x < 0, 'Expected pull towards cup');
  });

  it('absorbs ball on asteroid collision', () => {
    const hazard = { id: 'ast-1', position: { x: 200, y: 200 }, radius: 25 };
    const ballPos = { x: 205, y: 205 };
    const collides = checkHazardCollision(ballPos, BALL_RADIUS, [hazard]);
    assert.equal(collides, true);
  });

  it('advances physics tick and transitions ball to sunk', () => {
    const ball: BallState = {
      position: { x: 502, y: 302 },
      velocity: { x: 5, y: 5 },
      radius: BALL_RADIUS,
      status: 'in_flight',
      trail: [],
      flightTicks: 0,
    };

    const { ball: nextBall } = stepPhysicsTick(ball, [], [], [], testCup);
    assert.equal(nextBall.status, 'sunk');
  });
});
