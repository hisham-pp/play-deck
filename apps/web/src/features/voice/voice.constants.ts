export const VOICE_SIGNAL_EVENT = 'voice-signal';

/** Browsers apply these on the capture graph, before the audio ever hits the wire. */
export const VOICE_AUDIO_CONSTRAINTS: MediaTrackConstraints = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
};

/** Normalised RMS above which a participant counts as talking. */
export const SPEAKING_THRESHOLD = 0.045;

/** Hold the "speaking" ring this long after the level drops, so it stops flickering. */
export const SPEAKING_RELEASE_MS = 320;

export const LEVEL_SAMPLE_INTERVAL_MS = 120;

/** Ludo seats six, which is the widest mesh we ever build. */
export const MAX_MESH_PEERS = 6;

export const PUSH_TO_TALK_KEY = 'v';

export const DEFAULT_STUN_URLS = [
  'stun:stun.l.google.com:19302',
  'stun:stun1.l.google.com:19302',
] as const;
