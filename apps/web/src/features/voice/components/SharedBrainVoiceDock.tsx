'use client';

import React from 'react';
import type { SupabaseTransportService } from '@/features/multiplayer/services/supabase-transport.service';
import { useSharedBrainMultiplayerStore } from '@/stores/shared-brain-multiplayer.store';
import { VoiceChatDock } from './VoiceChatDock';

export interface SharedBrainVoiceDockProps {
  roomCode?: string | null;
  transport?: SupabaseTransportService | null;
  anchorClassName?: string;
}

/**
 * WebRTC voice chat integration for Shared Brain.
 * Essential for instantaneous verbal coordination between Navigator and Motor.
 */
export function SharedBrainVoiceDock({
  roomCode: propRoomCode,
  transport: propTransport,
  anchorClassName,
}: SharedBrainVoiceDockProps) {
  const storeRoomCode = useSharedBrainMultiplayerStore((state) => state.roomCode);
  const storeTransport = useSharedBrainMultiplayerStore((state) => state.transport);

  const roomCode = propRoomCode ?? storeRoomCode;
  const transport = propTransport ?? storeTransport;

  if (!roomCode) return null;

  return (
    <VoiceChatDock roomCode={roomCode} transport={transport} anchorClassName={anchorClassName} />
  );
}
