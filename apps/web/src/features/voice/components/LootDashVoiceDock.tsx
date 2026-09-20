'use client';

import React from 'react';
import type { SupabaseTransportService } from '@/features/multiplayer/services/supabase-transport.service';
import { useLootDashMultiplayerStore } from '@/stores/loot-dash-multiplayer.store';
import { VoiceChatDock } from './VoiceChatDock';

export interface LootDashVoiceDockProps {
  roomCode?: string | null;
  transport?: SupabaseTransportService | null;
  anchorClassName?: string;
}

/**
 * WebRTC voice chat dock for Loot Dash.
 * Relays audio for tactical coordination, steal reactions, and victory screams.
 */
export function LootDashVoiceDock({
  roomCode: propRoomCode,
  transport: propTransport,
  anchorClassName,
}: LootDashVoiceDockProps) {
  const storeRoomCode = useLootDashMultiplayerStore((state) => state.roomCode);
  const storeTransport = useLootDashMultiplayerStore((state) => state.transport);

  const roomCode = propRoomCode ?? storeRoomCode;
  const transport = propTransport ?? storeTransport;

  if (!roomCode) return null;

  return (
    <VoiceChatDock roomCode={roomCode} transport={transport} anchorClassName={anchorClassName} />
  );
}
