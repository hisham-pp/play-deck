import assert from 'node:assert/strict';
import test, { describe } from 'node:test';
import {
  MAX_ISLAND_SEATS,
  useTinyIslandMultiplayerStore,
} from '@/stores/tiny-island-multiplayer.store';

describe('Tiny Island Multiplayer — Store & Seating', () => {
  test('initializes with 6 distinct seats and colors', () => {
    const store = useTinyIslandMultiplayerStore.getState();
    assert.equal(store.seats.length, MAX_ISLAND_SEATS);

    const colors = new Set(store.seats.map((s) => s.color));
    assert.equal(colors.size, MAX_ISLAND_SEATS);
  });

  test('creates room with 6-digit code and assigns host to seat 0', async () => {
    const store = useTinyIslandMultiplayerStore.getState();
    const code = await store.createRoom({ id: 'host-1', displayName: 'Captain Cook' });

    assert.match(code, /^\d{6}$/);
    const updated = useTinyIslandMultiplayerStore.getState();
    assert.equal(updated.roomCode, code);
    assert.equal(updated.isHost, true);
    assert.equal(updated.seats[0].playerId, 'host-1');
    assert.equal(updated.seats[0].isHost, true);

    // Clean up
    store.leaveRoom();
  });

  test('validates 6-digit room code on join and sets error on invalid code', async () => {
    const store = useTinyIslandMultiplayerStore.getState();
    const res = await store.joinRoomByCode('abc', { id: 'p2', displayName: 'Survivor 2' });

    assert.equal(res, false);
    assert.ok(useTinyIslandMultiplayerStore.getState().error !== null);

    // Clean up
    store.leaveRoom();
  });

  test('allows host to toggle bot status on open seats', async () => {
    const store = useTinyIslandMultiplayerStore.getState();
    await store.createRoom({ id: 'host-1', displayName: 'Host' });

    const initialBotState = useTinyIslandMultiplayerStore.getState().seats[2].isBot;
    store.toggleBot(2);
    const updatedBotState = useTinyIslandMultiplayerStore.getState().seats[2].isBot;

    assert.notEqual(initialBotState, updatedBotState);

    // Clean up
    store.leaveRoom();
  });
});
