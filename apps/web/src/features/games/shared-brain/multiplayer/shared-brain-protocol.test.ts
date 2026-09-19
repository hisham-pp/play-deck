import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createSBEnvelope, SB_MSG } from './shared-brain-protocol';

describe('Shared Brain Protocol', () => {
  it('creates typed envelopes with timestamp and sender ID', () => {
    const envelope = createSBEnvelope(
      SB_MSG.INPUT_EVENT,
      {
        pairId: 'pair-1',
        senderRole: 'navigator',
        inputs: { moveRight: true },
      },
      'p1',
    );

    assert.equal(envelope.type, SB_MSG.INPUT_EVENT);
    assert.equal(envelope.senderId, 'p1');
    assert.equal(envelope.payload.pairId, 'pair-1');
    assert.ok(envelope.timestamp > 0);
  });
});
