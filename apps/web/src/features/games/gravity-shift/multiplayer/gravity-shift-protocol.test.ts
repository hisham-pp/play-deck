import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { GS_MSG } from './gravity-shift-protocol';
import type { GSGravityShiftPayload, GSWireEnvelope } from './gravity-shift-protocol';

describe('gravity-shift-protocol', () => {
  it('defines correct message constants', () => {
    assert.strictEqual(GS_MSG.ROSTER, 'GS_ROSTER');
    assert.strictEqual(GS_MSG.START_RACE, 'GS_START_RACE');
    assert.strictEqual(GS_MSG.POSITION_SYNC, 'GS_POSITION_SYNC');
    assert.strictEqual(GS_MSG.GRAVITY_SHIFT, 'GS_GRAVITY_SHIFT');
    assert.strictEqual(GS_MSG.CHECKPOINT, 'GS_CHECKPOINT');
    assert.strictEqual(GS_MSG.FINISH, 'GS_FINISH');
    assert.strictEqual(GS_MSG.RESTART, 'GS_RESTART');
  });

  it('correctly types wire envelopes', () => {
    const shiftPayload: GSGravityShiftPayload = {
      newGravity: 'left',
      shiftedBy: 'player-1',
      timestamp: 1000,
    };

    const envelope: GSWireEnvelope<GSGravityShiftPayload> = {
      type: GS_MSG.GRAVITY_SHIFT,
      payload: shiftPayload,
      senderId: 'player-1',
    };

    assert.strictEqual(envelope.type, 'GS_GRAVITY_SHIFT');
    assert.strictEqual(envelope.payload.newGravity, 'left');
  });
});
