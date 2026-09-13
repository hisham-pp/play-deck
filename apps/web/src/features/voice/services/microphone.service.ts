import type { MicPermissionState } from '@playdeck/game-types';
import { VOICE_AUDIO_CONSTRAINTS } from '../voice.constants';

export interface MicAcquireResult {
  stream: MediaStream | null;
  permission: MicPermissionState;
  error: string | null;
}

const UNDEFINED_TYPE = 'undefined';
const DENIED_MESSAGE =
  'Microphone access was blocked. Allow it in your browser site settings to talk.';

let activeStream: MediaStream | null = null;

export function isVoiceChatSupported(): boolean {
  if (typeof window === UNDEFINED_TYPE || typeof navigator === UNDEFINED_TYPE) return false;
  if (typeof RTCPeerConnection === UNDEFINED_TYPE) return false;
  return Boolean(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

/** `getUserMedia` is only exposed on secure origins (https, or localhost in dev). */
export function isSecureVoiceContext(): boolean {
  if (typeof window === UNDEFINED_TYPE) return false;
  return window.isSecureContext !== false;
}

function classifyError(error: unknown): MicAcquireResult {
  const name = error instanceof DOMException ? error.name : '';

  if (name === 'NotAllowedError' || name === 'SecurityError') {
    return { stream: null, permission: 'denied', error: DENIED_MESSAGE };
  }
  if (name === 'NotFoundError' || name === 'OverconstrainedError') {
    return {
      stream: null,
      permission: 'unknown',
      error: 'No microphone was found on this device.',
    };
  }
  if (name === 'NotReadableError') {
    return {
      stream: null,
      permission: 'granted',
      error: 'Your microphone is already in use by another app.',
    };
  }
  return { stream: null, permission: 'unknown', error: 'Could not start the microphone.' };
}

function hasLiveTrack(stream: MediaStream | null): stream is MediaStream {
  return Boolean(stream && stream.getAudioTracks().some((track) => track.readyState === 'live'));
}

export async function acquireMicrophone(): Promise<MicAcquireResult> {
  if (!isVoiceChatSupported()) {
    return {
      stream: null,
      permission: 'unsupported',
      error: 'This browser does not support voice chat.',
    };
  }
  if (!isSecureVoiceContext()) {
    return {
      stream: null,
      permission: 'unsupported',
      error: 'Voice chat needs a secure (https) connection.',
    };
  }
  if (hasLiveTrack(activeStream)) {
    return { stream: activeStream, permission: 'granted', error: null };
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: VOICE_AUDIO_CONSTRAINTS,
      video: false,
    });
    activeStream = stream;
    return { stream, permission: 'granted', error: null };
  } catch (error) {
    return classifyError(error);
  }
}

/** Mute at the track level: the peer connection stays up, it just carries silence. */
export function setMicrophoneEnabled(enabled: boolean): void {
  activeStream?.getAudioTracks().forEach((track) => {
    track.enabled = enabled;
  });
}

export function releaseMicrophone(): void {
  activeStream?.getTracks().forEach((track) => track.stop());
  activeStream = null;
}
