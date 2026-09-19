import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { useFloorIsLavaMultiplayerStore } from './floor-is-lava-multiplayer.store';

describe('Floor Is Lava Multiplayer Store', () => {
  it('starts idle with default state', () => {
    const state = useFloorIsLavaMultiplayerStore.getState();
    assert.strictEqual(state.status, 'idle');
    assert.strictEqual(state.roomCode, null);
    assert.strictEqual(state.players.length, 0);
    assert.strictEqual(state.lavaSpeedMultiplier, 1.0);
  });

  it('adds and removes bots correctly', () => {
    const store = useFloorIsLavaMultiplayerStore.getState();
    store.addBot();
    store.addBot();

    let state = useFloorIsLavaMultiplayerStore.getState();
    assert.strictEqual(state.players.length, 2);
    assert.strictEqual(state.players[0].isBot, true);
    assert.strictEqual(state.players[1].isBot, true);

    const botId = state.players[0].id;
    store.removeBot(botId);
    state = useFloorIsLavaMultiplayerStore.getState();
    assert.strictEqual(state.players.length, 1);
    assert.strictEqual(state.players[0].id !== botId, true);

    // Clean up
    store.removeBot(state.players[0].id);
  });

  it('updates lava speed multiplier', () => {
    const store = useFloorIsLavaMultiplayerStore.getState();
    store.setLavaSpeed(1.5);
    assert.strictEqual(useFloorIsLavaMultiplayerStore.getState().lavaSpeedMultiplier, 1.5);
  });
});
