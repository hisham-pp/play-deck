'use client';

import React from 'react';
import type { SupabaseTransportService } from '@/features/multiplayer/services/supabase-transport.service';
import { useMagnetMayhemMultiplayerStore } from '@/stores/magnet-mayhem-multiplayer.store';
import { VoiceChatDock } from './VoiceChatDock';

export interface MagnetMayhemVoiceDockProps {
  roomCode?: string | null;
  transport?: SupabaseTransportService | null;
  anchorClassName?: string;
}

/**
 * WebRTC voice chat dock for Magnet Mayhem.
 * Relays audio for chaotic physics moments, slingshot callouts, and competitive trash talk.
 */
export function MagnetMayhemVoiceDock({
  roomCode: propRoomCode,
  transport: propTransport,
  anchorClassName,
}: MagnetMayhemVoiceDockProps) {
  const storeRoomCode = useMagnetMayhemMultiplayerStore((state) => state.roomCode);
  const storeTransport = useMagnetMayhemMultiplayerStore((state) => state.transport);

  const roomCode = propRoomCode ?? storeRoomCode;
  const transport = propTransport ?? storeTransport;

  if (!roomCode) return null;

  return (
    <VoiceChatDock roomCode={roomCode} transport={transport} anchorClassName={anchorClassName} />
  );
}
