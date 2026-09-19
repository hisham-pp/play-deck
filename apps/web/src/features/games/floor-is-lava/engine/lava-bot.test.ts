import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { LavaPlayer } from '../types/floor-is-lava.types';
import { computeLavaBotDecision } from './lava-bot';
import { createInitialArena, DEFAULT_ARENA_CONFIG } from './lava-tile-engine';

describe('lava-bot', () => {
  const mockPlayers: LavaPlayer[] = [
    {
      id: 'bot-1',
      name: 'Grav-Bot',
      avatar: '🤖',
      color: '#f59e0b',
      isBot: true,
      isHost: false,
      ready: true,
      isAlive: true,
      position: { x: 50, y: 50 },
      velocity: { x: 0, y: 0 },
      radius: 16,
      pushCooldown: 0,
      isPushing: false,
      activePowerUp: null,
      hasDoubleJumpReady: false,
    },
    {
      id: 'player-1',
      name: 'Rival',
      avatar: '⚡',
      color: '#38bdf8',
      isBot: false,
      isHost: true,
      ready: true,
      isAlive: true,
      position: { x: 70, y: 50 }, // Close to bot
      velocity: { x: 0, y: 0 },
      radius: 16,
      pushCooldown: 0,
      isPushing: false,
      activePowerUp: null,
      hasDoubleJumpReady: false,
    },
  ];

  it('moves toward central safe tile when on cracking tile', () => {
    const arena = createInitialArena(mockPlayers, DEFAULT_ARENA_CONFIG);
    const bot = arena.players[0];
    bot.position = { x: 50, y: 50 }; // Corner
    arena.tiles[0][0].state = 'cracking';

    const decision = computeLavaBotDecision(bot, arena, DEFAULT_ARENA_CONFIG);
    // Center is down-right (positive X and Y)
    assert.ok(decision.moveX > 0);
    assert.ok(decision.moveY > 0);
  });

  it('triggers push when rival is in close proximity', () => {
    const arena = createInitialArena(mockPlayers, DEFAULT_ARENA_CONFIG);
    const bot = arena.players[0];
    bot.position = { x: 200, y: 200 };
    arena.players[1].position = { x: 220, y: 200 }; // 20px distance

    const decision = computeLavaBotDecision(bot, arena, DEFAULT_ARENA_CONFIG);
    assert.strictEqual(decision.push, true);
  });
});
