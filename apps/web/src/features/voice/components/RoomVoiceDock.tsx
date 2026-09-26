'use client';

import React from 'react';
import { useMultiplayerStore } from '@/stores/multiplayer.store';
import { VoiceChatDock } from './VoiceChatDock';

export interface RoomVoiceDockProps {
  anchorClassName?: string;
  variant?: 'floating' | 'inline';
  defaultOpen?: boolean;
}

/** Voice for the games that share `multiplayer.store` (Tic-Tac-Toe, Connect Four, Pen Fight, Pong, Carrom, etc.). */
export function RoomVoiceDock({ anchorClassName, variant, defaultOpen }: RoomVoiceDockProps = {}) {
  const roomCode = useMultiplayerStore((state) => state.roomCode);
  const getTransport = useMultiplayerStore((state) => state.getTransport);

  if (!roomCode) return null;

  return (
    <VoiceChatDock
      roomCode={roomCode}
      transport={getTransport()}
      anchorClassName={anchorClassName}
      variant={variant}
      defaultOpen={defaultOpen}
    />
  );
}
