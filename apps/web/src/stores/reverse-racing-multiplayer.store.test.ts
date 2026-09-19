import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { useReverseRacingMultiplayerStore } from './reverse-racing-multiplayer.store';

describe('Reverse Racing Multiplayer Store', () => {
  it('starts idle with empty player list', () => {
    const state = useReverseRacingMultiplayerStore.getState();
    assert.equal(state.status, 'idle');
    assert.equal(state.roomCode, null);
    assert.equal(state.players.length, 0);
  });

  it('can add and remove AI bots in lobby', () => {
    const store = useReverseRacingMultiplayerStore.getState();
    store.addBot();

    let state = useReverseRacingMultiplayerStore.getState();
    assert.equal(state.players.length, 1);
    assert.equal(state.players[0].isBot, true);

    const botId = state.players[0].id;
    store.removeBot(botId);

    state = useReverseRacingMultiplayerStore.getState();
    assert.equal(state.players.length, 0);
  });
});
