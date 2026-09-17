import type { VoicePeerStatus, VoiceSignal, VoiceSignalPayload } from '@playdeck/game-types';

/**
 * Exactly one side of every pair sends the offer, chosen by comparing peer ids.
 * With no coin flip and no timers there is no glare, so the same rule scales
 * unchanged from a two player match to Ludo's six seat mesh.
 */
export function shouldInitiateOffer(localPeerId: string, remotePeerId: string): boolean {
  return localPeerId.localeCompare(remotePeerId) < 0;
}

/** A signal is ours to act on when it is for this room and addressed to us (or to everyone). */
export function isSignalForLocalPeer(
  signal: VoiceSignal,
  localPeerId: string,
  roomCode: string,
): boolean {
  if (signal.roomCode !== roomCode) return false;
  if (signal.senderId === localPeerId) return false;
  return signal.targetId === null || signal.targetId === localPeerId;
}

export function mapConnectionState(state: RTCPeerConnectionState): VoicePeerStatus {
  switch (state) {
    case 'connected':
      return 'connected';
    case 'disconnected':
      return 'reconnecting';
    case 'failed':
      return 'failed';
    case 'closed':
      return 'closed';
    default:
      return 'connecting';
  }
}

interface SignalIdentity {
  roomCode: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
}

export function createSignal(
  identity: SignalIdentity,
  kind: VoiceSignal['kind'],
  targetId: string | null,
  payload: VoiceSignalPayload = { type: 'none' },
): VoiceSignal {
  return {
    kind,
    roomCode: identity.roomCode,
    senderId: identity.senderId,
    senderName: identity.senderName,
    senderAvatar: identity.senderAvatar,
    targetId,
    payload,
    sentAt: Date.now(),
  };
}
