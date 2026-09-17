/**
 * Voice chat domain contracts.
 *
 * These types are intentionally DOM-free so the package stays framework and
 * platform agnostic. The session/candidate shapes are structurally compatible
 * with `RTCSessionDescriptionInit` and `RTCIceCandidateInit`, so browser code
 * can pass them straight into a peer connection without conversion.
 */

export type VoiceSignalKind = 'hello' | 'offer' | 'answer' | 'candidate' | 'peer-state' | 'bye';

export interface VoiceSessionDescription {
  type: 'offer' | 'answer' | 'pranswer' | 'rollback';
  sdp?: string;
}

export interface VoiceIceCandidate {
  candidate: string;
  sdpMid?: string | null;
  sdpMLineIndex?: number | null;
  usernameFragment?: string | null;
}

export type VoiceSignalPayload =
  | { type: 'session-description'; description: VoiceSessionDescription }
  | { type: 'ice-candidate'; candidate: VoiceIceCandidate }
  | { type: 'peer-state'; isMuted: boolean }
  | { type: 'none' };

export interface VoiceSignal {
  kind: VoiceSignalKind;
  roomCode: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  /** `null` addresses every peer in the room; otherwise only the named peer reacts. */
  targetId: string | null;
  payload: VoiceSignalPayload;
  sentAt: number;
}

/** Transport-agnostic signalling surface the voice mesh runs on top of. */
export interface VoiceSignalChannel {
  sendVoiceSignal(signal: VoiceSignal): void;
  onVoiceSignal(handler: (signal: VoiceSignal) => void): () => void;
}

export type VoicePeerStatus = 'connecting' | 'connected' | 'reconnecting' | 'failed' | 'closed';

/** Lifecycle of the local player's own participation in room voice. */
export type VoiceSessionStatus = 'off' | 'requesting-mic' | 'connecting' | 'live' | 'error';

export type MicPermissionState = 'unknown' | 'granted' | 'denied' | 'unsupported';

export interface VoiceParticipant {
  peerId: string;
  displayName: string;
  avatar: string;
  isLocal: boolean;
  status: VoicePeerStatus;
  /** Whether this participant has muted their own microphone. */
  isMuted: boolean;
  isSpeaking: boolean;
  /** Normalised 0–1 short-term loudness, for meters. */
  audioLevel: number;
}
