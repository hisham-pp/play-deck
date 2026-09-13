import { create } from 'zustand';
import type {
  MicPermissionState,
  VoiceSessionStatus,
  VoiceSignalChannel,
} from '@playdeck/game-types';
import { AudioLevelMonitor } from '@/features/voice/services/audio-level-monitor';
import {
  acquireMicrophone,
  releaseMicrophone,
  setMicrophoneEnabled,
} from '@/features/voice/services/microphone.service';
import { VoiceMesh } from '@/features/voice/services/voice-mesh.service';
import type { VoiceIdentity, VoiceRemotePeer } from '@/features/voice/types/voice.types';
import { resolveSpeaking } from '@/features/voice/utils/voice-levels';

export const LOCAL_LEVEL_KEY = 'local';

export interface VoiceChatState {
  status: VoiceSessionStatus;
  roomCode: string | null;
  localPeerId: string | null;
  permission: MicPermissionState;
  error: string | null;

  isMuted: boolean;
  /** Silences incoming audio without touching the microphone. */
  isDeafened: boolean;
  isPushToTalk: boolean;
  isTalkKeyHeld: boolean;

  remotePeers: VoiceRemotePeer[];
  levels: Record<string, number>;
  speaking: Record<string, boolean>;

  join: (
    roomCode: string,
    channel: VoiceSignalChannel,
    localPlayer: VoiceIdentity,
  ) => Promise<void>;
  leave: () => void;
  toggleMute: () => void;
  toggleDeafen: () => void;
  togglePushToTalk: () => void;
  setTalkKeyHeld: (held: boolean) => void;
  syncRoster: (peerIds: string[]) => void;
  dismissError: () => void;
}

interface MicGate {
  isMuted: boolean;
  isPushToTalk: boolean;
  isTalkKeyHeld: boolean;
}

/** Push-to-talk keeps the connection up and just gates the track. */
export function isMicOpen(gate: MicGate): boolean {
  if (gate.isMuted) return false;
  return !gate.isPushToTalk || gate.isTalkKeyHeld;
}

let mesh: VoiceMesh | null = null;
let monitor: AudioLevelMonitor | null = null;
let lastSpokeAt: Record<string, number> = {};

const IDLE_STATE = {
  status: 'off' as VoiceSessionStatus,
  roomCode: null,
  localPeerId: null,
  isMuted: false,
  isDeafened: false,
  isTalkKeyHeld: false,
  remotePeers: [] as VoiceRemotePeer[],
  levels: {} as Record<string, number>,
  speaking: {} as Record<string, boolean>,
};

function teardown(): void {
  mesh?.stop();
  mesh = null;
  monitor?.stop();
  monitor = null;
  releaseMicrophone();
  lastSpokeAt = {};
}

export const useVoiceChatStore = create<VoiceChatState>((set, get) => ({
  ...IDLE_STATE,
  permission: 'unknown',
  error: null,
  isPushToTalk: false,

  join: async (roomCode, channel, localPlayer) => {
    if (get().status !== 'off') {
      if (get().roomCode === roomCode) return;
      teardown();
    }

    set({
      ...IDLE_STATE,
      status: 'requesting-mic',
      roomCode,
      localPeerId: localPlayer.id,
      error: null,
    });

    const mic = await acquireMicrophone();
    if (!mic.stream) {
      set({ status: 'error', permission: mic.permission, error: mic.error });
      return;
    }

    // The join click may have landed while a previous leave() was in flight.
    if (get().roomCode !== roomCode) {
      releaseMicrophone();
      return;
    }

    setMicrophoneEnabled(isMicOpen(get()));

    monitor = new AudioLevelMonitor((levels) => {
      const now = Date.now();
      const speaking: Record<string, boolean> = {};
      Object.entries(levels).forEach(([key, level]) => {
        speaking[key] = resolveSpeaking(key, level, now, lastSpokeAt);
      });
      // A muted or un-keyed mic must never light up the local speaking ring.
      const localOpen = isMicOpen(get());
      speaking[LOCAL_LEVEL_KEY] = localOpen && Boolean(speaking[LOCAL_LEVEL_KEY]);
      set({ levels, speaking });
    });
    monitor.attach(LOCAL_LEVEL_KEY, mic.stream);

    mesh = new VoiceMesh({
      roomCode,
      localPlayer,
      channel,
      localStream: mic.stream,
      onPeersChanged: (peers) => {
        peers.forEach((peer) => {
          if (peer.stream) monitor?.attach(peer.peerId, peer.stream);
        });
        const activeIds = new Set(peers.map((peer) => peer.peerId));
        get().remotePeers.forEach((previous) => {
          if (!activeIds.has(previous.peerId)) monitor?.detach(previous.peerId);
        });
        set({ remotePeers: peers });
      },
    });
    mesh.start();

    set({ status: 'live', permission: 'granted', error: null });
  },

  leave: () => {
    teardown();
    set({ ...IDLE_STATE });
  },

  toggleMute: () => {
    const isMuted = !get().isMuted;
    set({ isMuted });
    setMicrophoneEnabled(isMicOpen(get()));
    mesh?.setMuted(isMuted);
  },

  toggleDeafen: () => {
    const isDeafened = !get().isDeafened;
    // Deafening also mutes: nobody expects to be heard while they cannot hear.
    const isMuted = isDeafened ? true : get().isMuted;
    set({ isDeafened, isMuted });
    setMicrophoneEnabled(isMicOpen(get()));
    mesh?.setMuted(isMuted);
  },

  togglePushToTalk: () => {
    set({ isPushToTalk: !get().isPushToTalk, isTalkKeyHeld: false });
    setMicrophoneEnabled(isMicOpen(get()));
  },

  setTalkKeyHeld: (held) => {
    if (get().isTalkKeyHeld === held) return;
    set({ isTalkKeyHeld: held });
    setMicrophoneEnabled(isMicOpen(get()));
  },

  syncRoster: (peerIds) => mesh?.syncRoster(peerIds),

  dismissError: () => set({ error: null, status: get().status === 'error' ? 'off' : get().status }),
}));
