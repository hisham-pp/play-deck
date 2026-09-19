import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { useGravityShiftMultiplayerStore } from './gravity-shift-multiplayer.store';

describe('Gravity Shift Multiplayer Store', () => {
  it('starts idle with default state', () => {
    const state = useGravityShiftMultiplayerStore.getState();
    assert.strictEqual(state.status, 'idle');
    assert.strictEqual(state.roomCode, null);
    assert.strictEqual(state.players.length, 0);
    assert.strictEqual(state.selectedCourseId, 'neon-circuit');
  });

  it('adds and removes bots correctly', () => {
    const store = useGravityShiftMultiplayerStore.getState();
    store.addBot();
    store.addBot();

    let state = useGravityShiftMultiplayerStore.getState();
    assert.strictEqual(state.players.length, 2);
    assert.strictEqual(state.players[0].isBot, true);
    assert.strictEqual(state.players[1].isBot, true);

    const botId = state.players[0].id;
    store.removeBot(botId);
    state = useGravityShiftMultiplayerStore.getState();
    assert.strictEqual(state.players.length, 1);
    assert.strictEqual(state.players[0].id !== botId, true);

    // Clean up
    store.removeBot(state.players[0].id);
  });

  it('updates selected course and gravity', () => {
    const store = useGravityShiftMultiplayerStore.getState();
    store.selectCourse('gravity-well');
    assert.strictEqual(useGravityShiftMultiplayerStore.getState().selectedCourseId, 'gravity-well');

    store.setGravity('left');
    assert.strictEqual(useGravityShiftMultiplayerStore.getState().currentGravity, 'left');
  });
});
