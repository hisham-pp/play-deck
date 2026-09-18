import assert from 'node:assert/strict';
import test, { describe } from 'node:test';
import { createMachineObject } from '../engine/conveyor-engine';
import {
  isObjectDelivered,
  resolveObstacleForces,
  resolveSegmentCollision,
  stepObjectPhysics,
} from '../engine/conveyor-physics';
import type { ConveyorSegment } from '../engine/conveyor-types';

describe('Conveyor Physics — Collisions & Dynamics', () => {
  const mockSegment: ConveyorSegment = {
    id: 'seg-1',
    seatIndex: 0,
    label: 'Segment 1',
    x: 200,
    y: 200,
    baseY: 200,
    length: 160,
    thickness: 16,
    angle: 0,
    targetAngle: 0,
    elevation: 0,
    targetElevation: 0,
    speed: 50,
    targetSpeed: 50,
    color: '#10b981',
    glyph: '●',
    assignedPlayerId: 'p1',
    assignedPlayerName: 'Player 1',
    isBot: false,
  };

  test('detects and resolves top-surface collision with a flat horizontal segment', () => {
    const obj = createMachineObject('standard', 200, 192, 0, 100);
    const res = resolveSegmentCollision(obj, mockSegment, 0.016);

    assert.equal(res.hit, true);
    assert.equal(res.shattered, false);
    assert.ok(obj.vy < 0, 'Velocity should reflect upward on bounce');
    assert.ok(obj.vx > 0, 'Conveyor speed should accelerate object horizontally');
  });

  test('shatters a fragile object when impact exceeds durability limit', () => {
    // Drop fragile object at high downward velocity (> 140)
    const fragileObj = createMachineObject('fragile', 200, 192, 0, 240);
    const res = resolveSegmentCollision(fragileObj, mockSegment, 0.016);

    assert.equal(res.hit, true);
    assert.equal(res.shattered, true);
    assert.equal(fragileObj.status, 'broken');
  });

  test('does not trigger collision when object is horizontally outside segment bounds', () => {
    const obj = createMachineObject('standard', 350, 192, 0, 100);
    const res = resolveSegmentCollision(obj, mockSegment, 0.016);

    assert.equal(res.hit, false);
  });

  test('detects when an object enters the delivery target hopper', () => {
    const target = { x: 800, y: 400, width: 100, height: 100, label: 'Target' };
    const insideObj = createMachineObject('standard', 850, 450, 10, 10);
    const outsideObj = createMachineObject('standard', 700, 450, 10, 10);

    assert.equal(isObjectDelivered(insideObj, target), true);
    assert.equal(isObjectDelivered(outsideObj, target), false);
  });

  test('applies wind tunnel upward force', () => {
    const obj = createMachineObject('standard', 100, 100, 0, 0);
    const wind = {
      id: 'wind-1',
      type: 'wind_tunnel' as const,
      x: 80,
      y: 80,
      width: 60,
      height: 60,
      windForceX: 20,
      windForceY: -300,
    };

    resolveObstacleForces(obj, wind, 0.1);
    assert.ok(obj.vy < 0, 'Wind tunnel should draft object upwards');
    assert.ok(obj.vx > 0, 'Wind tunnel should push object in windForceX direction');
  });

  test('marks object dropped when passing below hazard pit floor', () => {
    const obj = createMachineObject('standard', 200, 600, 0, 100);
    const target = { x: 800, y: 400, width: 100, height: 100, label: 'Target' };

    stepObjectPhysics(obj, [], [], target, 550, 0.016);
    assert.equal(obj.status, 'dropped');
  });
});
