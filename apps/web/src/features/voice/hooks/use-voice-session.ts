'use client';

import { useCallback, useEffect } from 'react';
import type { SupabaseTransportService } from '@/features/multiplayer/services/supabase-transport.service';
import { useVoiceChatStore } from '@/stores/voice-chat.store';
import { isVoiceChatSupported } from '../services/microphone.service';
import type { VoiceIdentity } from '../types/voice.types';

interface UseVoiceSessionOptions {
  roomCode: string | null;
  transport: SupabaseTransportService | null;
  localPlayer: VoiceIdentity | null;
}

/**
 * Ludo swaps its lobby out for the board without leaving the room, and a game
 * screen can remount on a re-render. Teardown is therefore deferred by a beat
 * and cancelled if another dock for the same room appears, so a live call is
 * never dropped by a component swap — while genuinely leaving still frees the mic.
 */
const TEARDOWN_GRACE_MS = 250;
const pendingLeaves = new Map<string, ReturnType<typeof setTimeout>>();

function cancelPendingLeave(roomCode: string): void {
  const pending = pendingLeaves.get(roomCode);
  if (!pending) return;
  clearTimeout(pending);
  pendingLeaves.delete(roomCode);
}

/**
 * Owns the lifecycle of one room's voice session: joining on demand, tearing
 * down when the room changes or the surface unmounts, and keeping the mesh in
 * step with channel presence.
 */
export function useVoiceSession({ roomCode, transport, localPlayer }: UseVoiceSessionOptions) {
  const status = useVoiceChatStore((state) => state.status);
  const activeRoomCode = useVoiceChatStore((state) => state.roomCode);
  const join = useVoiceChatStore((state) => state.join);
  const leave = useVoiceChatStore((state) => state.leave);
  const syncRoster = useVoiceChatStore((state) => state.syncRoster);

  const isSupported = isVoiceChatSupported();
  const isActive = status !== 'off' && status !== 'error' && activeRoomCode === roomCode;

  const connect = useCallback(() => {
    if (!roomCode || !transport || !localPlayer) return;
    void join(roomCode, transport, localPlayer);
  }, [join, roomCode, transport, localPlayer]);

  // Presence is the roster of record; every sync repairs peers we never reached.
  useEffect(() => {
    if (!isActive || !transport) return;

    const toIds = (players: { playerId: string }[]) => players.map((player) => player.playerId);
    syncRoster(toIds(transport.getPresence()));

    return transport.onPresence((players) => syncRoster(toIds(players)));
  }, [isActive, transport, syncRoster]);

  useEffect(() => {
    if (!roomCode) return;
    cancelPendingLeave(roomCode);

    return () => {
      const timer = setTimeout(() => {
        pendingLeaves.delete(roomCode);
        if (useVoiceChatStore.getState().roomCode === roomCode) leave();
      }, TEARDOWN_GRACE_MS);
      pendingLeaves.set(roomCode, timer);
    };
  }, [roomCode, leave]);

  return { connect, leave, isSupported, isActive };
}
