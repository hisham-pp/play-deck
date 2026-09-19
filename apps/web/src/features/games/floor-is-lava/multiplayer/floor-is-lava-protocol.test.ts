import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { FIL_MSG } from './floor-is-lava-protocol';
import type { FILPushActionPayload, FILWireEnvelope } from './floor-is-lava-protocol';

describe('floor-is-lava-protocol', () => {
  it('defines correct message constants', () => {
    assert.strictEqual(FIL_MSG.ROSTER, 'FIL_ROSTER');
    assert.strictEqual(FIL_MSG.START_GAME, 'FIL_START_GAME');
    assert.strictEqual(FIL_MSG.PLAYER_SYNC, 'FIL_PLAYER_SYNC');
    assert.strictEqual(FIL_MSG.PUSH_ACTION, 'FIL_PUSH_ACTION');
    assert.strictEqual(FIL_MSG.POWERUP_EVENT, 'FIL_POWERUP_EVENT');
    assert.strictEqual(FIL_MSG.ELIMINATION, 'FIL_ELIMINATION');
    assert.strictEqual(FIL_MSG.RESTART, 'FIL_RESTART');
  });

  it('correctly types wire envelopes', () => {
    const pushPayload: FILPushActionPayload = {
      pusherId: 'player-1',
      targetId: 'player-2',
      force: 420,
    };

    const envelope: FILWireEnvelope<FILPushActionPayload> = {
      type: FIL_MSG.PUSH_ACTION,
      payload: pushPayload,
      senderId: 'player-1',
    };

    assert.strictEqual(envelope.type, 'FIL_PUSH_ACTION');
    assert.strictEqual(envelope.payload.targetId, 'player-2');
  });
});
