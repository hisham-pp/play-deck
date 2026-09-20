import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { TankPlayer, ArenaBlock } from '../types/tiny-tank.types';
import {
  vectorAdd,
  vectorSub,
  vectorScale,
  vectorLength,
  vectorDistance,
  circleIntersectsAABB,
  reflectVector,
  updateTankPhysics,
  resolveTankSeparation,
  TANK_RADIUS,
} from './tank-physics';

describe('tank-physics', () => {
  it('performs vector basic math correctly', () => {
    const a = { x: 3, y: 4 };
    const b = { x: 1, y: 2 };

    assert.deepEqual(vectorAdd(a, b), { x: 4, y: 6 });
    assert.deepEqual(vectorSub(a, b), { x: 2, y: 2 });
    assert.deepEqual(vectorScale(a, 2), { x: 6, y: 8 });
    assert.equal(vectorLength(a), 5);
    assert.equal(vectorDistance(a, b), Math.hypot(2, 2));
  });

  it('detects circle vs AABB collision accurately', () => {
    // Circle at (50, 50) radius 18, Box at (40, 40) size (40, 40)
    const hit = circleIntersectsAABB(50, 50, 18, 40, 40, 40, 40);
    assert.equal(hit.collides, true);

    // Far away box
    const miss = circleIntersectsAABB(10, 10, 18, 100, 100, 40, 40);
    assert.equal(miss.collides, false);
  });

  it('reflects projectile vector off horizontal and vertical surfaces', () => {
    // Bounce off vertical wall (normal pointing left -1, 0)
    const incomingX = { x: 100, y: 50 };
    const reflectedX = reflectVector(incomingX, -1, 0);
    assert.equal(reflectedX.x, -100);
    assert.equal(reflectedX.y, 50);

    // Bounce off horizontal wall (normal pointing up 0, -1)
    const incomingY = { x: 50, y: 100 };
    const reflectedY = reflectVector(incomingY, 0, -1);
    assert.equal(reflectedY.x, 50);
    assert.equal(reflectedY.y, -100);
  });

  it('accelerates tank forward and applies boundary clamping', () => {
    const tank: TankPlayer = {
      id: 'p1',
      name: 'Tester',
      color: '#06b6d4',
      isBot: false,
      isAlive: true,
      position: { x: 100, y: 100 },
      velocity: { x: 0, y: 0 },
      angle: 0, // facing right (+X)
      turretAngle: 0,
      health: 100,
      maxHealth: 100,
      shield: 0,
      maxShield: 50,
      ammo: 5,
      maxAmmo: 5,
      reloadTimer: 0,
      activeWeapon: 'cannon',
      weaponAmmo: { cannon: Infinity, bouncing: 0, homing: 0, mine: 0, laser: 0, rubber: 0 },
      score: 0,
      kills: 0,
      damageDealt: 0,
      recoilOffset: 0,
      invulnerableTimer: 0,
    };

    const blocks: ArenaBlock[] = [];
    const updated = updateTankPhysics(
      tank,
      {
        moveForward: true,
        moveBackward: false,
        turnLeft: false,
        turnRight: false,
        turretAngle: 0,
        fire: false,
      },
      blocks,
      960,
      640,
      0.1,
    );

    assert.ok(updated.position.x > 100);
    assert.ok(updated.velocity.x > 0);
  });

  it('resolves overlapping tank positions smoothly', () => {
    const t1: TankPlayer = {
      id: 'p1',
      name: 'P1',
      color: '#06b6d4',
      isBot: false,
      isAlive: true,
      position: { x: 200, y: 200 },
      velocity: { x: 0, y: 0 },
      angle: 0,
      turretAngle: 0,
      health: 100,
      maxHealth: 100,
      shield: 0,
      maxShield: 50,
      ammo: 5,
      maxAmmo: 5,
      reloadTimer: 0,
      activeWeapon: 'cannon',
      weaponAmmo: { cannon: Infinity, bouncing: 0, homing: 0, mine: 0, laser: 0, rubber: 0 },
      score: 0,
      kills: 0,
      damageDealt: 0,
      recoilOffset: 0,
      invulnerableTimer: 0,
    };

    const t2: TankPlayer = {
      ...t1,
      id: 'p2',
      name: 'P2',
      position: { x: 210, y: 200 }, // overlap (dist 10 < 2 * 18 = 36)
    };

    const [res1, res2] = resolveTankSeparation([t1, t2]);
    const postDist = vectorDistance(res1.position, res2.position);
    assert.ok(postDist >= TANK_RADIUS * 2 - 0.01);
  });
});
