'use client';

import React from 'react';

import type { SupabaseTransportService } from '@/features/multiplayer/services/supabase-transport.service';
import { useTrustMultiplayerStore } from '@/stores/trust-or-betray-multiplayer.store';

import { VoiceChatDock } from './VoiceChatDock';

export interface TrustOrBetrayVoiceDockProps {
  roomCode?: string | null;
  transport?: SupabaseTransportService | null;
  anchorClassName?: string;
  variant?: 'floating' | 'inline';
  defaultOpen?: boolean;
}

/**
 * WebRTC voice chat dock for Trust or Betray.
 * Relays audio for tactical negotiations, accusations, bluffs, and trial defenses.
 */
export function TrustOrBetrayVoiceDock({
  roomCode: propRoomCode,
  transport: propTransport,
  anchorClassName,
  variant,
  defaultOpen,
}: TrustOrBetrayVoiceDockProps = {}) {
  const storeRoomCode = useTrustMultiplayerStore((state) => state.roomCode);
  const storeTransport = useTrustMultiplayerStore((state) => state.transport);

  const roomCode = propRoomCode ?? storeRoomCode;
  const transport = propTransport ?? storeTransport;

  if (!roomCode) return null;

  return (
    <VoiceChatDock
      roomCode={roomCode}
      transport={transport}
      anchorClassName={anchorClassName}
      variant={variant}
      defaultOpen={defaultOpen}
    />
  );
}
