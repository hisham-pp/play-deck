import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createGolfEnvelope, GOLF_MSG, isValidGolfEnvelope } from './gravity-golf-protocol';

describe('Gravity Golf Multiplayer Protocol', () => {
  it('creates valid envelope stamped with sender and timestamp', () => {
    const envelope = createGolfEnvelope(
      GOLF_MSG.PLACE_OBJECT,
      {
        object: {
          id: 'obj-1',
          type: 'attractor',
          position: { x: 200, y: 300 },
          radius: 25,
          strength: 1,
        },
        senderId: 'player-1',
      },
      'player-1',
    );

    assert.equal(envelope.type, GOLF_MSG.PLACE_OBJECT);
    assert.equal(envelope.senderId, 'player-1');
    assert.ok(envelope.sentAt > 0);
    assert.equal(isValidGolfEnvelope(envelope), true);
  });

  it('rejects invalid or malformed envelopes', () => {
    assert.equal(isValidGolfEnvelope(null), false);
    assert.equal(isValidGolfEnvelope(undefined), false);
    assert.equal(isValidGolfEnvelope('string'), false);
    assert.equal(isValidGolfEnvelope({ type: 'GOLF_SEATS' }), false); // missing senderId and sentAt
  });
});
