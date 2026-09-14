import type { VoiceParticipant } from '@playdeck/game-types';
import type { VoiceRemotePeer } from '../types/voice.types';

export interface ParticipantsInput {
  localPeerId: string | null;
  localName: string;
  localAvatar: string;
  isLocalMuted: boolean;
  isLive: boolean;
  remotePeers: VoiceRemotePeer[];
  levels: Record<string, number>;
  speaking: Record<string, boolean>;
  localLevelKey: string;
}

/** Flattens the local player and every mesh peer into one list the UI can map over. */
export function buildParticipants(input: ParticipantsInput): VoiceParticipant[] {
  const participants: VoiceParticipant[] = [];

  if (input.localPeerId) {
    participants.push({
      peerId: input.localPeerId,
      displayName: input.localName,
      avatar: input.localAvatar,
      isLocal: true,
      status: input.isLive ? 'connected' : 'connecting',
      isMuted: input.isLocalMuted,
      isSpeaking: Boolean(input.speaking[input.localLevelKey]),
      audioLevel: input.levels[input.localLevelKey] ?? 0,
    });
  }

  input.remotePeers.forEach((peer) => {
    participants.push({
      peerId: peer.peerId,
      displayName: peer.displayName,
      avatar: peer.avatar,
      isLocal: false,
      status: peer.status,
      isMuted: peer.isMuted,
      isSpeaking:
        peer.status === 'connected' && !peer.isMuted && Boolean(input.speaking[peer.peerId]),
      audioLevel: input.levels[peer.peerId] ?? 0,
    });
  });

  return participants;
}

export function countConnected(peers: VoiceRemotePeer[]): number {
  return peers.filter((peer) => peer.status === 'connected').length;
}
