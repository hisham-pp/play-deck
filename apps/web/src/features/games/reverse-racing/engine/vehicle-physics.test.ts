import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Obstacle } from '../types/reverse-racing.types';
import {
  BASE_SPEED,
  createInitialVehicle,
  jumpVehicle,
  steerVehicle,
  stepVehicleTick,
  TRACK_LENGTH,
} from './vehicle-physics';

describe('Reverse Racing Vehicle Physics', () => {
  it('creates initial vehicle grounded and moving at base speed', () => {
    const v = createInitialVehicle('p1', 'Racer 1', '🏎️', '#ef4444');
    assert.equal(v.distance, 0);
    assert.equal(v.lane, 0);
    assert.equal(v.speed, BASE_SPEED);
    assert.equal(v.jumpHeight, 0);
    assert.equal(v.status, 'driving');
  });

  it('steers vehicle between lanes within [-1, 1]', () => {
    let v = createInitialVehicle('p1', 'Racer 1', '🏎️', '#ef4444');
    v = steerVehicle(v, 'left');
    assert.equal(v.targetLane, -1);

    // Cannot steer left beyond -1
    v = steerVehicle(v, 'left');
    assert.equal(v.targetLane, -1);

    v = steerVehicle(v, 'right');
    assert.equal(v.targetLane, 0);
    v = steerVehicle(v, 'right');
    assert.equal(v.targetLane, 1);
  });

  it('jumps vehicle with upward velocity and lands back down', () => {
    let v = createInitialVehicle('p1', 'Racer 1', '🏎️', '#ef4444');
    v = jumpVehicle(v);
    assert.equal(v.status, 'jumping');
    assert.ok(v.jumpVelocity > 0);

    // Step physics for 0.2s
    let res = stepVehicleTick(v, [], 0.2);
    assert.ok(res.vehicle.jumpHeight > 0);

    // Step physics forward until landing (approx 1s total)
    for (let i = 0; i < 40; i++) {
      res = stepVehicleTick(res.vehicle, [], 0.05);
    }
    assert.equal(res.vehicle.jumpHeight, 0);
    assert.equal(res.vehicle.status, 'driving');
  });

  it('detects crash with roadblock if grounded', () => {
    const v = createInitialVehicle('p1', 'Racer 1', '🏎️', '#ef4444');
    v.distance = 100;
    const obstacle: Obstacle = {
      id: 'obs-1',
      type: 'roadblock',
      trackId: 'p1',
      distance: 102,
      lane: 0,
      placedBy: 'p2',
      active: true,
    };

    const res = stepVehicleTick(v, [obstacle], 0.1);
    assert.equal(res.collisionEvent, 'crash_roadblock');
    assert.equal(res.vehicle.status, 'crashed');
    assert.equal(res.vehicle.speed, 0);
    assert.equal(res.vehicle.crashesSuffered, 1);
  });

  it('clears roadblock safely if jumping over it', () => {
    let v = createInitialVehicle('p1', 'Racer 1', '🏎️', '#ef4444');
    v.distance = 98;
    v = jumpVehicle(v);
    // Give enough height
    v.jumpHeight = 1.3;

    const obstacle: Obstacle = {
      id: 'obs-1',
      type: 'roadblock',
      trackId: 'p1',
      distance: 100,
      lane: 0,
      placedBy: 'p2',
      active: true,
    };

    const res = stepVehicleTick(v, [obstacle], 0.1);
    assert.equal(res.collisionEvent, 'jumped_over');
    assert.notEqual(res.vehicle.status, 'crashed');
  });

  it('detects race finish when reaching track length', () => {
    const v = createInitialVehicle('p1', 'Racer 1', '🏎️', '#ef4444');
    v.distance = TRACK_LENGTH - 5;
    const res = stepVehicleTick(v, [], 0.5);
    assert.equal(res.finished, true);
    assert.equal(res.vehicle.status, 'finished');
    assert.equal(res.vehicle.distance, TRACK_LENGTH);
  });
});
