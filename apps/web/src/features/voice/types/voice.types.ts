import type { VoicePeerStatus } from '@playdeck/game-types';

export interface VoiceIdentity {
  id: string;
  displayName: string;
  avatar: string;
}

export interface VoiceRemotePeer {
  peerId: string;
  displayName: string;
  avatar: string;
  status: VoicePeerStatus;
  /** True when that player has muted their own microphone. */
  isMuted: boolean;
  stream: MediaStream | null;
}
