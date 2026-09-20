import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { DashPlayer, LootItem, ObstacleBlock } from '../types/loot-dash.types';
import {
  circleIntersectsAABB,
  resolvePlayerBumps,
  updateLootMagnets,
  updatePlayerPhysics,
  vectorDistance,
} from './loot-physics';

function createDummyPlayer(overrides: Partial<DashPlayer> = {}): DashPlayer {
  return {
    id: 'p1',
    name: 'Player 1',
    color: '#06b6d4',
    isBot: false,
    isAlive: true,
    position: { x: 100, y: 100 },
    velocity: { x: 0, y: 0 },
    angle: 0,
    radius: 16,
    score: 50,
    coinsCollected: 5,
    gemsCollected: 1,
    trapsTriggered: 0,
    stealsCount: 0,
    activePowerUp: null,
    powerUpTimeRemaining: 0,
    stunTimer: 0,
    slowTimer: 0,
    invulnerableTimer: 0,
    ...overrides,
  };
}

describe('LootPhysics', () => {
  it('computes Euclidean distance correctly', () => {
    const d = vectorDistance({ x: 0, y: 0 }, { x: 30, y: 40 });
    assert.strictEqual(d, 50);
  });

  it('detects circle vs AABB rectangle collision', () => {
    const hit = circleIntersectsAABB(105, 100, 16, 110, 80, 40, 40);
    assert.strictEqual(hit.collides, true);
    assert.ok(hit.depth > 0);

    const miss = circleIntersectsAABB(50, 50, 16, 110, 80, 40, 40);
    assert.strictEqual(miss.collides, false);
  });

  it('updates player movement physics and dampens friction', () => {
    const player = createDummyPlayer({ position: { x: 100, y: 100 } });
    const obstacles: ObstacleBlock[] = [];
    const next = updatePlayerPhysics(player, { moveX: 1, moveY: 0 }, obstacles, 800, 600, 0.05);

    assert.ok(next.position.x > 100);
    assert.strictEqual(next.position.y, 100);
    assert.ok(next.velocity.x > 0);
  });

  it('prevents player from entering solid obstacles', () => {
    const player = createDummyPlayer({ position: { x: 105, y: 100 } });
    const obstacles: ObstacleBlock[] = [
      { id: 'wall', x: 110, y: 80, width: 50, height: 40, type: 'wall' },
    ];
    const next = updatePlayerPhysics(player, { moveX: 1, moveY: 0 }, obstacles, 800, 600, 0.05);
    // Player circle radius 16 cannot overlap wall left edge 110 (so position.x <= 94)
    assert.ok(next.position.x <= 100);
  });

  it('resolves bumping between two overlapping players and triggers thief steals', () => {
    const p1 = createDummyPlayer({
      id: 'p1',
      position: { x: 100, y: 100 },
      activePowerUp: 'thief',
      score: 10,
    });
    const p2 = createDummyPlayer({
      id: 'p2',
      position: { x: 110, y: 100 }, // 10px distance < 32px diameter
      score: 40,
    });

    const { updatedPlayers, steals } = resolvePlayerBumps([p1, p2]);

    assert.strictEqual(steals.length, 1);
    assert.strictEqual(steals[0]?.thiefId, 'p1');
    assert.strictEqual(steals[0]?.victimId, 'p2');
    assert.strictEqual(steals[0]?.amount, 25);

    // Score transferred
    const nextP1 = updatedPlayers.find((p) => p.id === 'p1');
    const nextP2 = updatedPlayers.find((p) => p.id === 'p2');
    assert.strictEqual(nextP1?.score, 35);
    assert.strictEqual(nextP2?.score, 15);
    assert.ok(nextP1!.position.x < nextP2!.position.x);
  });

  it('pulls nearby loot when magnet power-up is active', () => {
    const magnetPlayer = createDummyPlayer({
      position: { x: 200, y: 200 },
      activePowerUp: 'magnet',
    });
    const loot: LootItem[] = [
      {
        id: 'c1',
        type: 'bronze_coin',
        position: { x: 250, y: 200 }, // 50px away, within 180px magnet radius
        radius: 10,
        value: 5,
        pulseTimer: 0,
      },
      {
        id: 'c2',
        type: 'gold_bar',
        position: { x: 600, y: 500 }, // Far away
        radius: 12,
        value: 25,
        pulseTimer: 0,
      },
    ];

    const updatedLoot = updateLootMagnets(loot, [magnetPlayer], 0.1);
    // c1 pulled towards player x=200
    assert.ok(updatedLoot[0].position.x < 250);
    // c2 unchanged
    assert.strictEqual(updatedLoot[1].position.x, 600);
  });
});
