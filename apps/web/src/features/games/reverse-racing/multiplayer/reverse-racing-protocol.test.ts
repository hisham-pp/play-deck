import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createRREnvelope, RR_MSG } from './reverse-racing-protocol';

describe('Reverse Racing Protocol', () => {
  it('creates typed envelopes with timestamps and sender ID', () => {
    const envelope = createRREnvelope(
      RR_MSG.START_RACE,
      { seed: 12345, sabotageChain: [['p1', 'p2']], startTime: 1000 },
      'p1',
    );

    assert.equal(envelope.type, RR_MSG.START_RACE);
    assert.equal(envelope.senderId, 'p1');
    assert.equal(envelope.payload.seed, 12345);
    assert.ok(envelope.timestamp > 0);
  });
});
