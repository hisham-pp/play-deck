'use client';

import React from 'react';
import { useBombFactoryMultiplayerStore } from '@/stores/bomb-factory-multiplayer.store';
import { VoiceChatDock } from './VoiceChatDock';

/**
 * Bomb Factory cannot be played without talking — no player holds a whole
 * blueprint — so the dock rides along with its own room store from the lobby on.
 */
export function BombFactoryVoiceDock({ anchorClassName }: { anchorClassName?: string }) {
  const roomCode = useBombFactoryMultiplayerStore((state) => state.roomCode);
  const transport = useBombFactoryMultiplayerStore((state) => state.transport);

  if (!roomCode) return null;

  return (
    <VoiceChatDock roomCode={roomCode} transport={transport} anchorClassName={anchorClassName} />
  );
}
