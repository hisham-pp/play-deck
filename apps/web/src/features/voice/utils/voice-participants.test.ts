import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { VoiceRemotePeer } from '../types/voice.types';
import { buildParticipants, countConnected } from './voice-participants';

const REMOTE: VoiceRemotePeer = {
  peerId: 'player_b',
  displayName: 'Pilot Beta',
  avatar: '🚀',
  status: 'connected',
  isMuted: false,
  stream: null,
};

function build(overrides: Partial<Parameters<typeof buildParticipants>[0]> = {}) {
  return buildParticipants({
    localPeerId: 'player_a',
    localName: 'Pilot Alpha',
    localAvatar: '👾',
    isLocalMuted: false,
    isLive: true,
    remotePeers: [REMOTE],
    levels: { local: 0.3, player_b: 0.5 },
    speaking: { local: true, player_b: true },
    localLevelKey: 'local',
    ...overrides,
  });
}

describe('Voice participant Tests', () => {
  it('lists the local player first, flagged as local', () => {
    const [local, remote] = build();

    assert.equal(local.peerId, 'player_a');
    assert.equal(local.isLocal, true);
    assert.equal(remote.peerId, 'player_b');
    assert.equal(remote.isLocal, false);
  });

  it('omits the local row until an identity is known', () => {
    const participants = build({ localPeerId: null });
    assert.equal(participants.length, 1);
    assert.equal(participants[0].peerId, 'player_b');
  });

  it('never shows a muted peer as speaking', () => {
    const [, remote] = build({ remotePeers: [{ ...REMOTE, isMuted: true }] });
    assert.equal(remote.isSpeaking, false);
  });

  it('never shows a peer that is still connecting as speaking', () => {
    const [, remote] = build({ remotePeers: [{ ...REMOTE, status: 'connecting' }] });
    assert.equal(remote.isSpeaking, false);
  });

  it('counts only fully connected peers', () => {
    const peers: VoiceRemotePeer[] = [
      REMOTE,
      { ...REMOTE, peerId: 'player_c', status: 'connecting' },
      { ...REMOTE, peerId: 'player_d', status: 'failed' },
    ];
    assert.equal(countConnected(peers), 1);
  });
});
