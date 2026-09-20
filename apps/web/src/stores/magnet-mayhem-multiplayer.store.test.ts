import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { useMagnetMayhemMultiplayerStore } from './magnet-mayhem-multiplayer.store';

describe('Magnet Mayhem Multiplayer Store', () => {
  it('starts idle with default state', () => {
    const state = useMagnetMayhemMultiplayerStore.getState();
    assert.strictEqual(state.status, 'idle');
    assert.strictEqual(state.roomCode, null);
    assert.strictEqual(state.players.length, 0);
    assert.strictEqual(state.roundDurationSec, 60);
  });

  it('adds and removes bots within capacity', () => {
    const store = useMagnetMayhemMultiplayerStore.getState();
    store.addBot();
    store.addBot();

    let state = useMagnetMayhemMultiplayerStore.getState();
    assert.strictEqual(state.players.length, 2);
    assert.strictEqual(state.players[0].isBot, true);
    assert.strictEqual(state.players[1].isBot, true);

    const botId = state.players[0].id;
    store.removeBot(botId);
    state = useMagnetMayhemMultiplayerStore.getState();
    assert.strictEqual(state.players.length, 1);
    assert.strictEqual(state.players[0].id !== botId, true);

    // Clean up
    store.removeBot(state.players[0].id);
  });

  it('updates round duration correctly', () => {
    const store = useMagnetMayhemMultiplayerStore.getState();
    store.setRoundDuration(90);
    assert.strictEqual(useMagnetMayhemMultiplayerStore.getState().roundDurationSec, 90);
  });
});
