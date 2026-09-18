import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  GOLF_SEAT_CONFIGS,
  MAX_GOLF_SEATS,
  useMiniGolfMultiplayerStore,
} from '@/stores/mini-golf-multiplayer.store';

describe('Mini Golf Multiplayer — Store & Seating', () => {
  it('defines 4 distinct seat color and non-color glyph configurations', () => {
    assert.equal(GOLF_SEAT_CONFIGS.length, 4);
    assert.equal(MAX_GOLF_SEATS, 4);

    const colors = new Set(GOLF_SEAT_CONFIGS.map((c) => c.color));
    const glyphs = new Set(GOLF_SEAT_CONFIGS.map((c) => c.glyph));

    assert.equal(colors.size, 4, 'Seat colors must be unique');
    assert.equal(glyphs.size, 4, 'Seat glyphs must be unique for non-color accessibility');
  });

  it('correctly tracks course preset updates', () => {
    const store = useMiniGolfMultiplayerStore.getState();
    assert.equal(store.coursePreset, 'front-9');

    store.setCoursePreset('back-9');
    assert.equal(useMiniGolfMultiplayerStore.getState().coursePreset, 'back-9');

    store.setCoursePreset('full-18');
    assert.equal(useMiniGolfMultiplayerStore.getState().coursePreset, 'full-18');

    // Reset back
    store.setCoursePreset('front-9');
  });

  it('correctly evaluates isHost condition', () => {
    useMiniGolfMultiplayerStore.setState({ hostId: 'host-1', localPlayerId: 'host-1' });
    assert.equal(useMiniGolfMultiplayerStore.getState().isHost(), true);

    useMiniGolfMultiplayerStore.setState({ hostId: 'host-1', localPlayerId: 'guest-2' });
    assert.equal(useMiniGolfMultiplayerStore.getState().isHost(), false);

    // Reset
    useMiniGolfMultiplayerStore.getState().leaveRoom();
  });
});
