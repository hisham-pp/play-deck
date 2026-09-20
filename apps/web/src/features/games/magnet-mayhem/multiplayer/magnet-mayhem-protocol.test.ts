import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { decodeMagnetEnvelope, encodeMagnetEnvelope, MM_MSG } from './magnet-mayhem-protocol';

describe('Magnet Mayhem — Multiplayer Protocol', () => {
  it('encodes and decodes valid envelopes accurately', () => {
    const payload = {
      playerId: 'p1',
      aimAngle: 1.57,
      action: 'attract' as const,
    };

    const encoded = encodeMagnetEnvelope(MM_MSG.PLAYER_INPUT, payload, 'p1');
    const decoded = decodeMagnetEnvelope(encoded);

    assert.ok(decoded);
    assert.equal(decoded.type, MM_MSG.PLAYER_INPUT);
    assert.equal(decoded.senderId, 'p1');
    assert.deepEqual(decoded.payload, payload);
  });

  it('returns null on invalid wire messages', () => {
    assert.equal(decodeMagnetEnvelope('not-valid-json'), null);
    assert.equal(decodeMagnetEnvelope('{}'), null);
    assert.equal(decodeMagnetEnvelope('{"type": "MM_ROSTER"}'), null); // Missing senderId
  });
});
