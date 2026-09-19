'use client';

import React from 'react';
import type { SupabaseTransportService } from '@/features/multiplayer/services/supabase-transport.service';
import { useReverseRacingMultiplayerStore } from '@/stores/reverse-racing-multiplayer.store';
import { VoiceChatDock } from './VoiceChatDock';

export interface ReverseRacingVoiceDockProps {
  roomCode?: string | null;
  transport?: SupabaseTransportService | null;
  anchorClassName?: string;
}

/**
 * Voice chat integration for Reverse Racing.
 * Taunt your rivals and react in real-time to sudden roadblocks over full mesh WebRTC audio.
 */
export function ReverseRacingVoiceDock({
  roomCode: propRoomCode,
  transport: propTransport,
  anchorClassName,
}: ReverseRacingVoiceDockProps) {
  const storeRoomCode = useReverseRacingMultiplayerStore((state) => state.roomCode);
  const storeTransport = useReverseRacingMultiplayerStore((state) => state.transport);

  const roomCode = propRoomCode ?? storeRoomCode;
  const transport = propTransport ?? storeTransport;

  if (!roomCode) return null;

  return (
    <VoiceChatDock roomCode={roomCode} transport={transport} anchorClassName={anchorClassName} />
  );
}
