'use client';

import React from 'react';
import { useGiantMultiplayerStore } from '@/stores/giant-multiplayer.store';
import { VoiceChatDock } from './VoiceChatDock';

/**
 * Don't Wake the Giant runs its own room store, and seats up to six players in
 * one mesh. Whispering is the point of the game, so the dock rides along with
 * the chamber rather than being an optional extra.
 */
export function GiantVoiceDock({ anchorClassName }: { anchorClassName?: string }) {
  const roomCode = useGiantMultiplayerStore((state) => state.roomCode);
  const transport = useGiantMultiplayerStore((state) => state.transport);

  if (!roomCode) return null;

  return (
    <VoiceChatDock roomCode={roomCode} transport={transport} anchorClassName={anchorClassName} />
  );
}
