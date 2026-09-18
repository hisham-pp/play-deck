import assert from 'node:assert/strict';
import test, { describe } from 'node:test';
import {
  MAX_CONVEYOR_SEATS,
  useHumanConveyorMultiplayerStore,
} from '@/stores/human-conveyor-multiplayer.store';

describe('Human Conveyor Multiplayer — Store & Seating', () => {
  test('initializes with 6 distinct seats, colors, and glyphs', () => {
    const store = useHumanConveyorMultiplayerStore.getState();
    assert.equal(store.seats.length, MAX_CONVEYOR_SEATS);

    const glyphs = new Set(store.seats.map((s) => s.glyph));
    assert.equal(glyphs.size, MAX_CONVEYOR_SEATS);

    const colors = new Set(store.seats.map((s) => s.color));
    assert.equal(colors.size, MAX_CONVEYOR_SEATS);
  });

  test('creates room with 6-digit code and assigns host to seat 0', async () => {
    const store = useHumanConveyorMultiplayerStore.getState();
    const code = await store.createRoom({ id: 'host-1', displayName: 'Host Player' });

    assert.match(code, /^\d{6}$/);
    const updated = useHumanConveyorMultiplayerStore.getState();
    assert.equal(updated.roomCode, code);
    assert.equal(updated.isHost, true);
    assert.equal(updated.seats[0].playerId, 'host-1');
    assert.equal(updated.seats[0].isHost, true);

    // Clean up
    store.leaveRoom();
  });

  test('validates 6-digit room code on join and sets error on invalid input', async () => {
    const store = useHumanConveyorMultiplayerStore.getState();
    const res = await store.joinRoomByCode('invalid', { id: 'p2', displayName: 'Player 2' });

    assert.equal(res, false);
    assert.ok(useHumanConveyorMultiplayerStore.getState().error !== null);

    // Clean up
    store.leaveRoom();
  });
});
