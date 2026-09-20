import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { useTinyTankMultiplayerStore } from './tiny-tank-multiplayer.store';

describe('Tiny Tank Multiplayer Store', () => {
  it('starts idle with default state', () => {
    const state = useTinyTankMultiplayerStore.getState();
    assert.strictEqual(state.status, 'idle');
    assert.strictEqual(state.roomCode, null);
    assert.strictEqual(state.players.length, 0);
    assert.strictEqual(state.roundDurationSec, 90);
  });

  it('adds and removes bots within capacity', () => {
    const store = useTinyTankMultiplayerStore.getState();
    store.addBot();
    store.addBot();

    let state = useTinyTankMultiplayerStore.getState();
    assert.strictEqual(state.players.length, 2);
    assert.strictEqual(state.players[0].isBot, true);
    assert.strictEqual(state.players[1].isBot, true);

    const botId = state.players[0].id;
    store.removeBot(botId);
    state = useTinyTankMultiplayerStore.getState();
    assert.strictEqual(state.players.length, 1);
    assert.strictEqual(state.players[0].id !== botId, true);

    // Clean up
    store.removeBot(state.players[0].id);
  });

  it('updates round duration correctly', () => {
    const store = useTinyTankMultiplayerStore.getState();
    store.setRoundDuration(120);
    assert.strictEqual(useTinyTankMultiplayerStore.getState().roundDurationSec, 120);
  });
});
