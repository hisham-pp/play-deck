import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { DashPlayer, LootItem } from '../types/loot-dash.types';
import { computeLootBotInput } from './loot-bot';

function createDummyPlayer(overrides: Partial<DashPlayer> = {}): DashPlayer {
  return {
    id: 'bot-1',
    name: 'Bot 1',
    color: '#f59e0b',
    isBot: true,
    isAlive: true,
    position: { x: 100, y: 100 },
    velocity: { x: 0, y: 0 },
    angle: 0,
    radius: 16,
    score: 0,
    coinsCollected: 0,
    gemsCollected: 0,
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

describe('LootBot', () => {
  it('yields zero movement when bot is stunned', () => {
    const bot = createDummyPlayer({ stunTimer: 1.5 });
    const input = computeLootBotInput(bot, [bot], [], [], [], 'medium');
    assert.strictEqual(input.moveX, 0);
    assert.strictEqual(input.moveY, 0);
  });

  it('navigates towards the highest-value nearby loot', () => {
    const bot = createDummyPlayer({ position: { x: 100, y: 100 } });
    const loot: LootItem[] = [
      {
        id: 'c1',
        type: 'bronze_coin',
        position: { x: 50, y: 100 }, // value 5
        radius: 10,
        value: 5,
        pulseTimer: 0,
      },
      {
        id: 'c2',
        type: 'gem',
        position: { x: 200, y: 100 }, // value 50
        radius: 12,
        value: 50,
        pulseTimer: 0,
      },
    ];

    const input = computeLootBotInput(bot, [bot], loot, [], [], 'medium');
    // Gem score is much higher: bot steers to the right (positive moveX)
    assert.ok(input.moveX > 0);
  });

  it('pursues players with score when equipped with thief power-up', () => {
    const bot = createDummyPlayer({
      id: 'bot-thief',
      position: { x: 100, y: 100 },
      activePowerUp: 'thief',
    });
    const rival = createDummyPlayer({
      id: 'player-1',
      position: { x: 200, y: 100 },
      score: 100,
    });

    const input = computeLootBotInput(bot, [bot, rival], [], [], [], 'hard');
    // Steers towards rival
    assert.ok(input.moveX > 0);
  });

  it('flees from nearby rivals equipped with thief gloves', () => {
    const bot = createDummyPlayer({
      id: 'bot-1',
      position: { x: 100, y: 100 },
      score: 80,
    });
    const rivalThief = createDummyPlayer({
      id: 'thief-1',
      position: { x: 120, y: 100 }, // 20px to the right
      activePowerUp: 'thief',
    });

    const input = computeLootBotInput(bot, [bot, rivalThief], [], [], [], 'medium');
    // Flees to the left (negative moveX)
    assert.ok(input.moveX < 0);
  });

  it('deploys decoy trap when holding decoy_drop power-up', () => {
    const bot = createDummyPlayer({
      position: { x: 100, y: 100 },
      activePowerUp: 'decoy_drop',
    });
    const input = computeLootBotInput(bot, [bot], [], [], [], 'hard');
    assert.strictEqual(input.activateTrap, true);
  });
});
