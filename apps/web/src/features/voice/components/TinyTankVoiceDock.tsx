'use client';

import React from 'react';
import type { SupabaseTransportService } from '@/features/multiplayer/services/supabase-transport.service';
import { useTinyTankMultiplayerStore } from '@/stores/tiny-tank-multiplayer.store';
import { VoiceChatDock } from './VoiceChatDock';

export interface TinyTankVoiceDockProps {
  roomCode?: string | null;
  transport?: SupabaseTransportService | null;
  anchorClassName?: string;
}

/**
 * WebRTC voice chat dock for Tiny Tank Arena.
 * Relays audio for tactical coordination, explosion screams, and victory callouts.
 */
export function TinyTankVoiceDock({
  roomCode: propRoomCode,
  transport: propTransport,
  anchorClassName,
}: TinyTankVoiceDockProps) {
  const storeRoomCode = useTinyTankMultiplayerStore((state) => state.roomCode);
  const storeTransport = useTinyTankMultiplayerStore((state) => state.transport);

  const roomCode = propRoomCode ?? storeRoomCode;
  const transport = propTransport ?? storeTransport;

  if (!roomCode) return null;

  return (
    <VoiceChatDock roomCode={roomCode} transport={transport} anchorClassName={anchorClassName} />
  );
}
