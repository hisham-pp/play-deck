import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { DashInput, LootDashConfig } from '../types/loot-dash.types';
import { createInitialLootDashState, stepLootDashArena } from './loot-engine';

const TEST_CONFIG: LootDashConfig = {
  botCount: 2,
  botDifficulty: 'medium',
  roundDuration: 60,
  targetScore: 200,
  soundEnabled: true,
  highContrast: false,
  reducedMotion: false,
};

describe('LootEngine', () => {
  it('creates initial arena state with correct player roster and obstacles', () => {
    const state = createInitialLootDashState(TEST_CONFIG, 'RunnerOne');
    assert.strictEqual(state.players.length, 3); // 1 human + 2 bots
    assert.strictEqual(state.players[0].name, 'RunnerOne');
    assert.strictEqual(state.players[0].isBot, false);
    assert.strictEqual(state.players[1].isBot, true);
    assert.strictEqual(state.status, 'countdown');
    assert.strictEqual(state.countdown, 3);
    assert.ok(state.obstacles.length > 0);
    assert.ok(state.traps.length > 0);
    assert.ok(state.loot.length > 0);
  });

  it('steps countdown down into playing status', () => {
    const state = createInitialLootDashState(TEST_CONFIG);
    state.countdown = 0.5;

    const { nextState } = stepLootDashArena(state, {}, TEST_CONFIG, 0.6);
    assert.strictEqual(nextState.status, 'playing');
    assert.strictEqual(nextState.countdown, 0);
  });

  it('collects loot on contact and increments player score', () => {
    const state = createInitialLootDashState(TEST_CONFIG);
    state.status = 'playing';
    state.countdown = 0;

    // Place a loot item directly on top of player 0
    state.loot = [
      {
        id: 'test-gem',
        type: 'gem',
        position: { ...state.players[0].position },
        radius: 12,
        value: 50,
        pulseTimer: 0,
      },
    ];

    const inputs: Record<string, DashInput> = {
      'player-1': { moveX: 0, moveY: 0 },
    };

    const { nextState, events } = stepLootDashArena(state, inputs, TEST_CONFIG, 0.05);

    assert.strictEqual(nextState.players[0].score, 50);
    assert.strictEqual(nextState.players[0].gemsCollected, 1);
    assert.strictEqual(nextState.loot.length, 0);
    assert.ok(events.some((e) => e.type === 'gem_pickup'));
  });

  it('triggers victory and declares champion when target score is attained', () => {
    const state = createInitialLootDashState(TEST_CONFIG);
    state.status = 'playing';
    state.countdown = 0;
    state.targetScore = 100;
    state.players[0].score = 90;

    state.loot = [
      {
        id: 'gold-win',
        type: 'gold_bar',
        position: { ...state.players[0].position },
        radius: 12,
        value: 25,
        pulseTimer: 0,
      },
    ];

    const { nextState } = stepLootDashArena(state, {}, TEST_CONFIG, 0.05);

    assert.strictEqual(nextState.status, 'match_over');
    assert.strictEqual(nextState.winnerId, 'player-1');
  });

  it('ends match when timeRemaining drops to 0', () => {
    const state = createInitialLootDashState(TEST_CONFIG);
    state.status = 'playing';
    state.countdown = 0;
    state.timeRemaining = 0.02;
    state.players[0].score = 30;
    state.players[1].score = 10;
    state.loot = [];

    const { nextState } = stepLootDashArena(state, {}, TEST_CONFIG, 0.05);

    assert.strictEqual(nextState.status, 'match_over');
    assert.strictEqual(nextState.winnerId, 'player-1');
  });
});
