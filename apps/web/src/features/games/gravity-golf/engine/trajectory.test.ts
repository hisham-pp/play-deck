import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { CosmicCup } from '../types/gravity-golf.types';
import { predictTrajectory } from './trajectory-predictor';

describe('Gravity Golf Trajectory Predictor', () => {
  const cup: CosmicCup = {
    position: { x: 300, y: 100 },
    radius: 18,
    captureRadius: 36,
    captureSpeed: 300,
  };

  it('generates points along a straight path when no fields act', () => {
    const start = { x: 100, y: 100 };
    const vel = { x: 100, y: 0 };

    const result = predictTrajectory(start, vel, [], [], [], cup, 20);
    assert.ok(result.points.length > 5, 'Expected trajectory sample points');
    // First point should be start
    assert.equal(result.points[0].x, 100);
    assert.equal(result.points[0].y, 100);
    // Path should progress to the right
    assert.ok(result.points[result.points.length - 1].x > 150);
  });

  it('detects ball reaching the cup in predicted trajectory', () => {
    const start = { x: 280, y: 100 };
    const vel = { x: 40, y: 0 };

    const result = predictTrajectory(start, vel, [], [], [], cup, 40);
    assert.equal(result.reachesCup, true);
    assert.equal(result.endStatus, 'sunk');
  });

  it('detects asteroid hazard collision in predicted trajectory', () => {
    const start = { x: 100, y: 100 };
    const vel = { x: 100, y: 0 };
    const hazard = { id: 'h-1', position: { x: 180, y: 100 }, radius: 25 };

    const result = predictTrajectory(start, vel, [], [hazard], [], cup, 50);
    assert.equal(result.hitsHazard, true);
    assert.equal(result.endStatus, 'absorbed');
  });
});
