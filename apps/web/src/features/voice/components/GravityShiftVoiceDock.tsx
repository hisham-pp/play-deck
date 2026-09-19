'use client';

import React from 'react';

import type { SupabaseTransportService } from '@/features/multiplayer/services/supabase-transport.service';
import { useGravityShiftMultiplayerStore } from '@/stores/gravity-shift-multiplayer.store';

import { VoiceChatDock } from './VoiceChatDock';

export interface GravityShiftVoiceDockProps {
  roomCode?: string | null;
  transport?: SupabaseTransportService | null;
  anchorClassName?: string;
}

/**
 * WebRTC voice chat integration for Gravity Shift.
 * Allows real-time banter, warnings, and reactions during high-speed 4-way gravity shifts.
 */
export function GravityShiftVoiceDock({
  roomCode: propRoomCode,
  transport: propTransport,
  anchorClassName,
}: GravityShiftVoiceDockProps) {
  const storeRoomCode = useGravityShiftMultiplayerStore((state) => state.roomCode);
  const storeTransport = useGravityShiftMultiplayerStore((state) => state.transport);

  const roomCode = propRoomCode ?? storeRoomCode;
  const transport = propTransport ?? storeTransport;

  if (!roomCode) return null;

  return (
    <VoiceChatDock roomCode={roomCode} transport={transport} anchorClassName={anchorClassName} />
  );
}
