import assert from 'node:assert';
import { describe, it } from 'node:test';
import {
  applyFlapImpulse,
  checkBoundaryCollision,
  checkCircleBoxCollision,
  checkPipeCollision,
  DEFAULT_FLAPPY_CONFIG,
  stepBirdPhysics,
} from '../engine/flappy-physics';
import type { BirdState, ObstaclePipe } from '../engine/flappy-types';

describe('Flappy Physics — Gravity, Impulse & Rotation', () => {
  const baseBird: BirdState = {
    x: 120,
    y: 200,
    vy: 0,
    rotation: 0,
    radius: 14,
    flapCooldown: 0,
  };

  it('applies downward gravity acceleration to bird velocity and position', () => {
    const dt = 0.1;
    const next = stepBirdPhysics(baseBird, dt, DEFAULT_FLAPPY_CONFIG);

    assert.ok(next.vy > 0, 'Velocity should become positive (downward)');
    assert.ok(next.y > baseBird.y, 'Y position should increase');
    assert.strictEqual(next.vy, DEFAULT_FLAPPY_CONFIG.gravity * dt);
  });

  it('clamps vertical velocity to maxFallSpeed', () => {
    const fastFallingBird: BirdState = {
      ...baseBird,
      vy: DEFAULT_FLAPPY_CONFIG.maxFallSpeed - 10,
    };
    const next = stepBirdPhysics(fastFallingBird, 0.5, DEFAULT_FLAPPY_CONFIG);

    assert.strictEqual(next.vy, DEFAULT_FLAPPY_CONFIG.maxFallSpeed);
  });

  it('applies upward flap impulse and resets rotation', () => {
    const fallingBird: BirdState = {
      ...baseBird,
      vy: 300,
      rotation: 0.8,
    };
    const flapped = applyFlapImpulse(fallingBird, DEFAULT_FLAPPY_CONFIG.flapImpulse);

    assert.strictEqual(flapped.vy, -DEFAULT_FLAPPY_CONFIG.flapImpulse);
    assert.ok(flapped.rotation < 0, 'Rotation should tilt upward upon flap');
    assert.ok(flapped.flapCooldown > 0, 'Flap cooldown should be activated');
  });
});

describe('Flappy Physics — Collision Detection', () => {
  it('detects circle-box collision accurately', () => {
    // Circle at (50, 50) radius 10
    // Box from x: 55 to 100, y: 40 to 80 -> Overlaps
    const hit = checkCircleBoxCollision(50, 50, 10, 55, 40, 45, 40);
    assert.strictEqual(hit, true);

    // Box far away at x: 80 to 120 -> No overlap
    const miss = checkCircleBoxCollision(50, 50, 10, 80, 40, 40, 40);
    assert.strictEqual(miss, false);
  });

  it('detects boundary collisions with ground and ceiling', () => {
    const groundBird: BirdState = {
      x: 100,
      y: DEFAULT_FLAPPY_CONFIG.worldHeight - DEFAULT_FLAPPY_CONFIG.groundHeight,
      vy: 100,
      rotation: 0,
      radius: 14,
      flapCooldown: 0,
    };
    const groundHit = checkBoundaryCollision(groundBird, DEFAULT_FLAPPY_CONFIG);
    assert.strictEqual(groundHit.hitGround, true);
    assert.strictEqual(groundHit.hitCeiling, false);

    const ceilingBird: BirdState = {
      x: 100,
      y: DEFAULT_FLAPPY_CONFIG.ceilingHeight,
      vy: -100,
      rotation: 0,
      radius: 14,
      flapCooldown: 0,
    };
    const ceilingHit = checkBoundaryCollision(ceilingBird, DEFAULT_FLAPPY_CONFIG);
    assert.strictEqual(ceilingHit.hitCeiling, true);
    assert.strictEqual(ceilingHit.hitGround, false);
  });

  it('detects pipe collision when hitting top or bottom pipe', () => {
    const pipe: ObstaclePipe = {
      id: 1,
      x: 100,
      width: 60,
      topHeight: 180,
      bottomY: 330,
      gap: 150,
      passed: false,
      pulsePhase: 0,
    };

    // Bird flying inside gap -> safe
    const safeBird: BirdState = {
      x: 130,
      y: 250,
      vy: 0,
      rotation: 0,
      radius: 14,
      flapCooldown: 0,
    };
    assert.strictEqual(checkPipeCollision(safeBird, pipe, DEFAULT_FLAPPY_CONFIG), false);

    // Bird hitting top pipe
    const topCollidingBird: BirdState = {
      x: 130,
      y: 170, // Overlaps top pipe (topHeight = 180)
      vy: 0,
      rotation: 0,
      radius: 14,
      flapCooldown: 0,
    };
    assert.strictEqual(checkPipeCollision(topCollidingBird, pipe, DEFAULT_FLAPPY_CONFIG), true);

    // Bird hitting bottom pipe
    const bottomCollidingBird: BirdState = {
      x: 130,
      y: 340, // Overlaps bottom pipe (bottomY = 330)
      vy: 0,
      rotation: 0,
      radius: 14,
      flapCooldown: 0,
    };
    assert.strictEqual(checkPipeCollision(bottomCollidingBird, pipe, DEFAULT_FLAPPY_CONFIG), true);
  });
});
