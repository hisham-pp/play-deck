'use client';

import React from 'react';

import type { SupabaseTransportService } from '@/features/multiplayer/services/supabase-transport.service';
import { useFloorIsLavaMultiplayerStore } from '@/stores/floor-is-lava-multiplayer.store';

import { VoiceChatDock } from './VoiceChatDock';

export interface FloorIsLavaVoiceDockProps {
  roomCode?: string | null;
  transport?: SupabaseTransportService | null;
  anchorClassName?: string;
}

/**
 * WebRTC voice chat integration for Floor Is Lava.
 * Essential for panic, alliances, betrayal, and hilarious screams as tiles dissolve into magma!
 */
export function FloorIsLavaVoiceDock({
  roomCode: propRoomCode,
  transport: propTransport,
  anchorClassName,
}: FloorIsLavaVoiceDockProps) {
  const storeRoomCode = useFloorIsLavaMultiplayerStore((state) => state.roomCode);
  const storeTransport = useFloorIsLavaMultiplayerStore((state) => state.transport);

  const roomCode = propRoomCode ?? storeRoomCode;
  const transport = propTransport ?? storeTransport;

  if (!roomCode) return null;

  return (
    <VoiceChatDock roomCode={roomCode} transport={transport} anchorClassName={anchorClassName} />
  );
}
