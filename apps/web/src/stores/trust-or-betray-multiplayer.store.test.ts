import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { useTrustMultiplayerStore } from './trust-or-betray-multiplayer.store';

describe('Trust or Betray Multiplayer Store', () => {
  it('starts idle with default state', () => {
    const state = useTrustMultiplayerStore.getState();
    assert.strictEqual(state.status, 'idle');
    assert.strictEqual(state.roomCode, null);
    assert.strictEqual(state.players.length, 0);
    assert.strictEqual(state.roundCount, 5);
  });

  it('adds and removes bot operatives within capacity', () => {
    const store = useTrustMultiplayerStore.getState();
    store.addBot();
    store.addBot();

    let state = useTrustMultiplayerStore.getState();
    assert.strictEqual(state.players.length, 2);
    assert.strictEqual(state.players[0].isBot, true);
    assert.strictEqual(state.players[1].isBot, true);

    const firstBotId = state.players[0].id;
    store.removeBot(firstBotId);
    state = useTrustMultiplayerStore.getState();
    assert.strictEqual(state.players.length, 1);
    assert.notStrictEqual(state.players[0].id, firstBotId);

    // Clean up
    store.removeBot(state.players[0].id);
  });

  it('updates round count and status correctly', () => {
    const store = useTrustMultiplayerStore.getState();
    store.setRoundCount(7);
    store.setStatus('lobby');

    const state = useTrustMultiplayerStore.getState();
    assert.strictEqual(state.roundCount, 7);
    assert.strictEqual(state.status, 'lobby');
  });
});
