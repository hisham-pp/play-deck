import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { useLootDashMultiplayerStore } from './loot-dash-multiplayer.store';

describe('Loot Dash Multiplayer Store', () => {
  it('starts idle with default state', () => {
    const state = useLootDashMultiplayerStore.getState();
    assert.strictEqual(state.status, 'idle');
    assert.strictEqual(state.roomCode, null);
    assert.strictEqual(state.players.length, 0);
    assert.strictEqual(state.roundDurationSec, 90);
    assert.strictEqual(state.targetScore, 250);
  });

  it('adds and removes bots within capacity', () => {
    const store = useLootDashMultiplayerStore.getState();
    store.addBot();
    store.addBot();

    let state = useLootDashMultiplayerStore.getState();
    assert.strictEqual(state.players.length, 2);
    assert.strictEqual(state.players[0].isBot, true);
    assert.strictEqual(state.players[1].isBot, true);

    const botId = state.players[0].id;
    store.removeBot(botId);
    state = useLootDashMultiplayerStore.getState();
    assert.strictEqual(state.players.length, 1);
    assert.strictEqual(state.players[0].id !== botId, true);

    // Clean up
    store.removeBot(state.players[0].id);
  });

  it('updates match duration and target score correctly', () => {
    const store = useLootDashMultiplayerStore.getState();
    store.setRoundDuration(120);
    store.setTargetScore(400);

    const state = useLootDashMultiplayerStore.getState();
    assert.strictEqual(state.roundDurationSec, 120);
    assert.strictEqual(state.targetScore, 400);
  });
});
