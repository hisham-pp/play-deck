import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { VoiceSignal } from '@playdeck/game-types';
import {
  createSignal,
  isSignalForLocalPeer,
  mapConnectionState,
  shouldInitiateOffer,
} from './voice-negotiation';

const IDENTITY = {
  roomCode: '123456',
  senderId: 'player_a',
  senderName: 'Pilot Alpha',
  senderAvatar: '👾',
};

function signalFrom(overrides: Partial<VoiceSignal>): VoiceSignal {
  return { ...createSignal(IDENTITY, 'hello', null), ...overrides };
}

describe('Voice negotiation Tests', () => {
  it('picks exactly one offerer for a pair, from either side', () => {
    assert.equal(shouldInitiateOffer('player_a', 'player_b'), true);
    assert.equal(shouldInitiateOffer('player_b', 'player_a'), false);
  });

  it('never lets a peer offer to itself', () => {
    assert.equal(shouldInitiateOffer('player_a', 'player_a'), false);
  });

  it('agrees on a single offerer across every pair in a six seat mesh', () => {
    const seats = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'];
    seats.forEach((local) => {
      seats
        .filter((remote) => remote !== local)
        .forEach((remote) => {
          const offers = shouldInitiateOffer(local, remote);
          const remoteOffers = shouldInitiateOffer(remote, local);
          assert.notEqual(offers, remoteOffers, `${local}/${remote} must not both offer`);
        });
    });
  });

  it('accepts broadcast and directly addressed signals', () => {
    const broadcast = signalFrom({ targetId: null });
    const direct = signalFrom({ targetId: 'player_b' });

    assert.equal(isSignalForLocalPeer(broadcast, 'player_b', '123456'), true);
    assert.equal(isSignalForLocalPeer(direct, 'player_b', '123456'), true);
  });

  it('drops signals for another peer, another room, or echoed from itself', () => {
    const forSomeoneElse = signalFrom({ targetId: 'player_c' });
    const otherRoom = signalFrom({ roomCode: '999999' });
    const ownEcho = signalFrom({ senderId: 'player_b' });

    assert.equal(isSignalForLocalPeer(forSomeoneElse, 'player_b', '123456'), false);
    assert.equal(isSignalForLocalPeer(otherRoom, 'player_b', '123456'), false);
    assert.equal(isSignalForLocalPeer(ownEcho, 'player_b', '123456'), false);
  });

  it('stamps signals with the sender identity and a timestamp', () => {
    const signal = createSignal(IDENTITY, 'offer', 'player_b', {
      type: 'session-description',
      description: { type: 'offer', sdp: 'v=0' },
    });

    assert.equal(signal.kind, 'offer');
    assert.equal(signal.targetId, 'player_b');
    assert.equal(signal.senderName, 'Pilot Alpha');
    assert.equal(signal.payload.type, 'session-description');
    assert.ok(signal.sentAt > 0);
  });

  it('treats a dropped connection as recoverable and a failed one as broken', () => {
    assert.equal(mapConnectionState('connected'), 'connected');
    assert.equal(mapConnectionState('disconnected'), 'reconnecting');
    assert.equal(mapConnectionState('failed'), 'failed');
    assert.equal(mapConnectionState('closed'), 'closed');
    assert.equal(mapConnectionState('new'), 'connecting');
  });
});
