import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { LavaPlayer } from '../types/floor-is-lava.types';
import {
  createInitialArena,
  DEFAULT_ARENA_CONFIG,
  executePush,
  getTileAtPosition,
  updateLavaPhysics,
  updateTileStates,
} from './lava-tile-engine';

describe('lava-tile-engine', () => {
  const mockPlayers: LavaPlayer[] = [
    {
      id: 'p1',
      name: 'Player 1',
      avatar: '🔥',
      color: '#38bdf8',
      isBot: false,
      isHost: true,
      ready: true,
      isAlive: true,
      position: { x: 300, y: 300 },
      velocity: { x: 0, y: 0 },
      radius: 16,
      pushCooldown: 0,
      isPushing: false,
      activePowerUp: null,
      hasDoubleJumpReady: false,
    },
    {
      id: 'p2',
      name: 'Player 2',
      avatar: '🤖',
      color: '#f59e0b',
      isBot: true,
      isHost: false,
      ready: true,
      isAlive: true,
      position: { x: 320, y: 300 },
      velocity: { x: 0, y: 0 },
      radius: 16,
      pushCooldown: 0,
      isPushing: false,
      activePowerUp: null,
      hasDoubleJumpReady: false,
    },
  ];

  it('initializes arena grid and player positions', () => {
    const arena = createInitialArena(mockPlayers, DEFAULT_ARENA_CONFIG);
    assert.strictEqual(arena.tiles.length, 10);
    assert.strictEqual(arena.tiles[0].length, 10);
    assert.strictEqual(arena.players.length, 2);
    assert.strictEqual(arena.isGameOver, false);
    assert.strictEqual(arena.tiles[0][0].state, 'safe');
  });

  it('accurately resolves tile at coordinate', () => {
    const arena = createInitialArena(mockPlayers, DEFAULT_ARENA_CONFIG);
    // Each tile is 54 + 6 = 60 pitch
    const tile = getTileAtPosition({ x: 65, y: 65 }, arena, DEFAULT_ARENA_CONFIG);
    assert.ok(tile);
    assert.strictEqual(tile?.row, 1);
    assert.strictEqual(tile?.col, 1);

    const outside = getTileAtPosition({ x: -10, y: 50 }, arena, DEFAULT_ARENA_CONFIG);
    assert.strictEqual(outside, null);
  });

  it('degrades perimeter tiles into warning, cracking, and lava', () => {
    const arena = createInitialArena(mockPlayers, DEFAULT_ARENA_CONFIG);
    const cornerTile = arena.tiles[0][0];

    // Simulate elapsed time past ring 0 start (3.0s)
    arena.elapsedSec = 4.0;

    for (let i = 0; i < 40; i++) {
      updateTileStates(arena, DEFAULT_ARENA_CONFIG, 0.5);
    }

    assert.ok(cornerTile.stability < 1.0);
    assert.ok(
      cornerTile.state === 'warning' ||
        cornerTile.state === 'cracking' ||
        cornerTile.state === 'lava',
    );
  });

  it('executes push knockback on nearby opponent', () => {
    const arena = createInitialArena(mockPlayers, DEFAULT_ARENA_CONFIG);
    const p1 = arena.players[0];
    const p2 = arena.players[1];

    p1.position = { x: 200, y: 200 };
    p2.position = { x: 230, y: 200 }; // 30px away, within BASE_PUSH_RADIUS (52)

    const result = executePush(p1, arena);
    assert.strictEqual(result.targets.length, 1);
    assert.strictEqual(result.targets[0].id, 'p2');
    assert.ok(p2.velocity.x > 0); // Pushed to the right away from p1
  });

  it('eliminates players who step onto lava tiles', () => {
    const arena = createInitialArena(mockPlayers, DEFAULT_ARENA_CONFIG);
    const p1 = arena.players[0];
    // Put p1 on corner tile and set it to lava
    p1.position = { x: 25, y: 25 };
    arena.tiles[0][0].state = 'lava';

    const result = updateLavaPhysics(arena, {}, DEFAULT_ARENA_CONFIG, 0.016);
    assert.ok(result.eliminatedIds.includes('p1'));
    assert.strictEqual(p1.isAlive, false);
    assert.strictEqual(arena.isGameOver, true); // Only p2 alive -> p2 wins
    assert.strictEqual(arena.winnerId, 'p2');
  });
});
