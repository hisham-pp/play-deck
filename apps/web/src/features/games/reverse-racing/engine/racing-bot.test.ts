import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Obstacle } from '../types/reverse-racing.types';
import { createInitialSaboteur } from './obstacle-system';
import { updateBotDriver, updateBotSaboteur } from './racing-bot';
import { createInitialVehicle } from './vehicle-physics';

describe('Reverse Racing Bot AI', () => {
  it('steers or jumps when facing an upcoming obstacle', () => {
    const bot = createInitialVehicle('bot-1', 'Bot 1', '🤖', '#ff0055', true);
    const roadblock: Obstacle = {
      id: 'obs-1',
      type: 'roadblock',
      trackId: 'track-bot',
      distance: 15,
      lane: 0,
      placedBy: 'human',
      active: true,
    };

    const updated = updateBotDriver(bot, [roadblock]);
    // Either the bot jumped or steered to lane -1 or 1
    const jumped = updated.status === 'jumping' || updated.jumpVelocity > 0;
    const steered = updated.targetLane !== 0;
    assert.ok(jumped || steered, 'Bot must jump or steer away from immediate obstacle');
  });

  it('attempts to place obstacle if energy is sufficient', () => {
    const sab = createInitialSaboteur('bot-1', 'human-1');
    sab.energy = 50;
    const targetVehicle = createInitialVehicle('human-1', 'Human', '🏎️', '#00ffaa');
    targetVehicle.distance = 100;

    const res = updateBotSaboteur(sab, 'track-human', targetVehicle, [], 1.0);
    // Should have placed an obstacle or kept energy
    if (res.newObstacle) {
      assert.ok(res.newObstacle.distance > targetVehicle.distance);
      assert.ok(res.saboteur.energy < 50);
    } else {
      assert.equal(res.saboteur.energy, 50);
    }
  });

  it('does not place obstacle if energy is low', () => {
    const sab = createInitialSaboteur('bot-1', 'human-1');
    sab.energy = 10;
    const targetVehicle = createInitialVehicle('human-1', 'Human', '🏎️', '#00ffaa');

    const res = updateBotSaboteur(sab, 'track-human', targetVehicle, [], 1.0);
    assert.equal(res.newObstacle, null);
    assert.equal(res.saboteur.energy, 10);
  });
});
