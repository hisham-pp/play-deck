import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { useSharedBrainMultiplayerStore } from './shared-brain-multiplayer.store';

describe('Shared Brain Multiplayer Store', () => {
  it('starts idle with empty players and pairs', () => {
    const state = useSharedBrainMultiplayerStore.getState();
    assert.equal(state.status, 'idle');
    assert.equal(state.roomCode, null);
    assert.equal(state.players.length, 0);
    assert.equal(state.pairs.length, 0);
  });

  it('forms pairs when bots are added', () => {
    const store = useSharedBrainMultiplayerStore.getState();
    store.addBot(); // Bot 1 (navigator)
    store.addBot(); // Bot 2 (motor) -> forms Pair 1

    let state = useSharedBrainMultiplayerStore.getState();
    assert.equal(state.players.length, 2);
    assert.equal(state.pairs.length, 1);
    assert.equal(state.pairs[0].pairId, 'team-1');
    assert.equal(state.pairs[0].navigatorName, state.players[0].name);
    assert.equal(state.pairs[0].motorName, state.players[1].name);

    // Swap roles of the first bot
    store.swapRole(state.players[0].id);
    state = useSharedBrainMultiplayerStore.getState();
    assert.equal(state.players[0].role, 'motor');

    // Clean up bots
    store.removeBot(state.players[0].id);
    store.removeBot(state.players[1].id);
    state = useSharedBrainMultiplayerStore.getState();
    assert.equal(state.players.length, 0);
    assert.equal(state.pairs.length, 0);
  });

  it('can select different courses', () => {
    const store = useSharedBrainMultiplayerStore.getState();
    store.selectCourse('cortex-canyon');
    const state = useSharedBrainMultiplayerStore.getState();
    assert.equal(state.selectedCourseId, 'cortex-canyon');
  });
});
