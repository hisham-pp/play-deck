import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Obstacle } from '../types/reverse-racing.types';
import {
  createInitialSaboteur,
  placeObstacle,
  rechargeEnergy,
  validateObstaclePlacement,
} from './obstacle-system';

describe('Reverse Racing Obstacle System', () => {
  it('creates initial saboteur with 50 energy and selected obstacle', () => {
    const sab = createInitialSaboteur('player-1', 'player-2');
    assert.equal(sab.saboteurId, 'player-1');
    assert.equal(sab.targetPlayerId, 'player-2');
    assert.equal(sab.energy, 50);
    assert.equal(sab.selectedObstacle, 'roadblock');
  });

  it('recharges saboteur energy up to max 100', () => {
    let sab = createInitialSaboteur('player-1', 'player-2');
    sab = rechargeEnergy(sab, 2); // 50 + 14 * 2 = 78
    assert.equal(sab.energy, 78);

    sab = rechargeEnergy(sab, 10); // 78 + 140 -> capped at 100
    assert.equal(sab.energy, 100);
  });

  it('validates placement boundaries and reaction windows', () => {
    const obstacles: Obstacle[] = [];

    // Under 40m (start zone)
    const tooCloseStart = validateObstaclePlacement(30, 0, 'roadblock', 0, obstacles);
    assert.equal(tooCloseStart.valid, false);

    // Past track length - 30
    const tooFarFinish = validateObstaclePlacement(1500, 0, 'roadblock', 0, obstacles);
    assert.equal(tooFarFinish.valid, false);

    // Less than 18m ahead of vehicle
    const noReaction = validateObstaclePlacement(50, 0, 'roadblock', 40, obstacles);
    assert.equal(noReaction.valid, false);

    // Valid placement
    const valid = validateObstaclePlacement(70, 0, 'roadblock', 40, obstacles);
    assert.equal(valid.valid, true);
  });

  it('rejects obstacle if saboteur has insufficient energy', () => {
    let sab = createInitialSaboteur('player-1', 'player-2');
    sab = { ...sab, energy: 10 }; // Roadblock costs 25
    const res = placeObstacle(sab, 'track-2', 80, 0, 'roadblock', 40, []);
    assert.equal(res.obstacle, null);
    assert.equal(res.error, 'Not enough energy');
  });

  it('successfully places obstacle and deducts energy and awards sabotage score', () => {
    const sab = createInitialSaboteur('player-1', 'player-2');
    const res = placeObstacle(sab, 'track-2', 80, 0, 'roadblock', 40, []);
    assert.ok(res.obstacle);
    assert.equal(res.obstacle?.type, 'roadblock');
    assert.equal(res.obstacle?.lane, 0);
    assert.equal(res.obstacle?.distance, 80);
    assert.equal(res.saboteur.energy, 25); // 50 - 25
    assert.equal(res.saboteur.obstaclesPlaced, 1);
    assert.equal(res.saboteur.sabotageScore, 50);
  });
});
