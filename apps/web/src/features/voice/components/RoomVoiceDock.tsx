'use client';

import React from 'react';
import { useMultiplayerStore } from '@/stores/multiplayer.store';
import { VoiceChatDock } from './VoiceChatDock';

/** Voice for the games that share `multiplayer.store` (Tic-Tac-Toe, Connect Four, Pen Fight). */
export function RoomVoiceDock({ anchorClassName }: { anchorClassName?: string }) {
  const roomCode = useMultiplayerStore((state) => state.roomCode);
  const getTransport = useMultiplayerStore((state) => state.getTransport);

  if (!roomCode) return null;

  return (
    <VoiceChatDock
      roomCode={roomCode}
      transport={getTransport()}
      anchorClassName={anchorClassName}
    />
  );
}
