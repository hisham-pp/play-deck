import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isLootDashMessage } from './loot-dash-protocol';

describe('LootDashProtocol', () => {
  it('identifies valid Loot Dash wire messages', () => {
    assert.strictEqual(
      isLootDashMessage({
        type: 'LOOT_DASH_JOIN',
        payload: { playerId: 'p1', playerName: 'Sprinter', color: '#06b6d4' },
      }),
      true,
    );

    assert.strictEqual(
      isLootDashMessage({
        type: 'LOOT_DASH_INPUT',
        payload: { playerId: 'p1', input: { moveX: 1, moveY: -1 } },
      }),
      true,
    );

    assert.strictEqual(
      isLootDashMessage({
        type: 'LOOT_DASH_SYNC',
        payload: {
          timeRemaining: 45,
          players: [],
          loot: [],
          traps: [],
          obstacles: [],
        },
      }),
      true,
    );
  });

  it('rejects invalid or non-LootDash messages', () => {
    assert.strictEqual(isLootDashMessage(null), false);
    assert.strictEqual(isLootDashMessage(undefined), false);
    assert.strictEqual(isLootDashMessage('random string'), false);
    assert.strictEqual(isLootDashMessage({ type: 'TINY_TANK_INPUT', payload: {} }), false);
    assert.strictEqual(isLootDashMessage({ type: 'LOOT_DASH_JOIN' }), false);
  });
});
