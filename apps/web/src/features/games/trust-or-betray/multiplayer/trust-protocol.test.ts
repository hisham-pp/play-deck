import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  isTrustChatPayload,
  isTrustChoicePayload,
  isTrustStartPayload,
  isTrustVotePayload,
  TRUST_EVENTS,
} from './trust-protocol';

describe('trust-protocol', () => {
  it('defines all required protocol event names', () => {
    assert.strictEqual(TRUST_EVENTS.start, 'TRUST_START');
    assert.strictEqual(TRUST_EVENTS.choice, 'TRUST_CHOICE');
    assert.strictEqual(TRUST_EVENTS.vote, 'TRUST_VOTE');
    assert.strictEqual(TRUST_EVENTS.chat, 'TRUST_CHAT');
    assert.strictEqual(TRUST_EVENTS.sync, 'TRUST_SYNC');
    assert.strictEqual(TRUST_EVENTS.restart, 'TRUST_RESTART');
  });

  it('validates start payload structure', () => {
    assert.strictEqual(isTrustStartPayload({ players: [], totalRounds: 5, seed: 'test' }), true);
    assert.strictEqual(isTrustStartPayload({ players: 'invalid' }), false);
    assert.strictEqual(isTrustStartPayload(null), false);
  });

  it('validates choice payload', () => {
    assert.strictEqual(isTrustChoicePayload({ playerId: 'p1', choice: 'cooperate' }), true);
    assert.strictEqual(isTrustChoicePayload({ playerId: 'p1', choice: 'betray' }), true);
    assert.strictEqual(isTrustChoicePayload({ playerId: 'p1', choice: 'cheat' }), false);
  });

  it('validates vote payload', () => {
    assert.strictEqual(isTrustVotePayload({ voterId: 'p1', accusedId: 'p2' }), true);
    assert.strictEqual(isTrustVotePayload({ voterId: 'p1', accusedId: null }), true);
    assert.strictEqual(isTrustVotePayload({ voterId: 123, accusedId: 'p2' }), false);
  });

  it('validates chat payload', () => {
    assert.strictEqual(
      isTrustChatPayload({
        message: {
          id: '1',
          senderId: 'p1',
          senderName: 'Agent',
          text: 'Hello',
          timestamp: '12:00',
        },
      }),
      true,
    );
    assert.strictEqual(isTrustChatPayload({ message: null }), false);
  });
});
