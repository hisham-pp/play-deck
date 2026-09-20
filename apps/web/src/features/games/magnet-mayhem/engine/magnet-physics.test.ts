import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  calculateAttractForce,
  calculateRepelForce,
  clamp,
  findNearestAnchor,
  isHazardZapped,
  isTargetCollected,
  resolveCircleCollision,
  resolveWallCollisions,
  vecAdd,
  vecDist,
  vecLength,
  vecNormalize,
  vecScale,
  vecSub,
} from './magnet-physics';

describe('Magnet Mayhem — Physics Engine', () => {
  it('performs vector mathematics accurately', () => {
    const a = { x: 3, y: 4 };
    const b = { x: 1, y: 2 };

    assert.deepEqual(vecAdd(a, b), { x: 4, y: 6 });
    assert.deepEqual(vecSub(a, b), { x: 2, y: 2 });
    assert.deepEqual(vecScale(a, 2), { x: 6, y: 8 });
    assert.equal(vecLength(a), 5);
    assert.equal(vecDist(a, b), Math.hypot(2, 2));

    const norm = vecNormalize(a);
    assert.equal(norm.x, 0.6);
    assert.equal(norm.y, 0.8);

    assert.equal(clamp(15, 0, 10), 10);
    assert.equal(clamp(-5, 0, 10), 0);
    assert.equal(clamp(5, 0, 10), 5);
  });

  it('calculates attract force pulling towards anchor within range', () => {
    const player = { x: 100, y: 100 };
    const anchor = { x: 200, y: 100 };

    const pull = calculateAttractForce(player, anchor, 300);
    assert.ok(pull.x > 0, 'pull should be directed towards positive X');
    assert.equal(pull.y, 0, 'pull Y should be 0');

    // Outside range returns 0
    const outRangePull = calculateAttractForce(player, { x: 600, y: 100 }, 300);
    assert.equal(outRangePull.x, 0);
    assert.equal(outRangePull.y, 0);
  });

  it('calculates repel force pushing away within range', () => {
    const source = { x: 100, y: 100 };
    const target = { x: 150, y: 100 };

    const repel = calculateRepelForce(source, target, 200);
    assert.ok(repel.x > 0, 'repel should push target further positive X');
    assert.equal(repel.y, 0);

    const outRangeRepel = calculateRepelForce(source, { x: 400, y: 100 }, 200);
    assert.equal(outRangeRepel.x, 0);
    assert.equal(outRangeRepel.y, 0);
  });

  it('resolves elastic arena wall bounces with restitution', () => {
    const radius = 18;
    const width = 800;
    const height = 600;

    // Left wall penetration
    const leftRes = resolveWallCollisions(
      { x: 5, y: 100 },
      { x: -100, y: 50 },
      radius,
      width,
      height,
    );
    assert.ok(leftRes.bounced);
    assert.equal(leftRes.pos.x, radius);
    assert.ok(leftRes.vel.x > 0, 'velocity should reverse to positive');

    // Right wall penetration
    const rightRes = resolveWallCollisions(
      { x: 810, y: 100 },
      { x: 100, y: 50 },
      radius,
      width,
      height,
    );
    assert.ok(rightRes.bounced);
    assert.equal(rightRes.pos.x, width - radius);
    assert.ok(rightRes.vel.x < 0, 'velocity should reverse to negative');
  });

  it('resolves circle-to-circle elastic collision separation and momentum', () => {
    const posA = { x: 100, y: 100 };
    const velA = { x: 50, y: 0 };
    const posB = { x: 120, y: 100 };
    const velB = { x: -50, y: 0 };

    const res = resolveCircleCollision(posA, velA, 15, posB, velB, 15);
    assert.ok(res.collided);
    assert.ok(res.velA.x < 0, 'A should reverse after head-on collision');
    assert.ok(res.velB.x > 0, 'B should reverse after head-on collision');
    assert.ok(vecDist(res.posA, res.posB) >= 30, 'circles should no longer overlap');
  });

  it('finds nearest metallic anchor correctly', () => {
    const anchors = [
      { id: 'a1', x: 200, y: 200, radius: 20, isMovable: false, pulsePhase: 0 },
      { id: 'a2', x: 500, y: 500, radius: 20, isMovable: false, pulsePhase: 0 },
    ];

    const nearest = findNearestAnchor({ x: 210, y: 205 }, anchors, 300);
    assert.ok(nearest);
    assert.equal(nearest.id, 'a1');

    const tooFar = findNearestAnchor({ x: 900, y: 900 }, anchors, 100);
    assert.equal(tooFar, null);
  });

  it('detects target collection and hazard zaps', () => {
    const target = {
      id: 't1',
      x: 100,
      y: 100,
      radius: 12,
      tier: 'normal' as const,
      value: 10,
      velocity: { x: 0, y: 0 },
      isCollected: false,
      respawnTimer: 0,
      pulseTimer: 0,
    };

    assert.ok(isTargetCollected({ x: 110, y: 100 }, 18, target));
    assert.ok(!isTargetCollected({ x: 200, y: 100 }, 18, target));

    const hazard = {
      id: 'h1',
      x: 300,
      y: 300,
      radius: 25,
      zapCooldown: 0,
      glowPhase: 0,
    };

    const mockPlayer = {
      id: 'p1',
      name: 'Player',
      avatar: '🧲',
      color: '#06b6d4',
      isBot: false,
      isHost: true,
      ready: true,
      score: 0,
      position: { x: 310, y: 300 },
      velocity: { x: 0, y: 0 },
      aimAngle: 0,
      action: 'idle' as const,
      energy: 100,
      stunnedTimer: 0,
      targetHitCount: 0,
      slingshotCount: 0,
      repelHitCount: 0,
      isTethered: false,
      tetherTarget: null,
    };

    assert.ok(isHazardZapped(mockPlayer, hazard));
  });
});
