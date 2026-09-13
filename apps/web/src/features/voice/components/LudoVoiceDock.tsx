'use client';

import React from 'react';
import { useLudoMultiplayerStore } from '@/stores/ludo-multiplayer.store';
import { VoiceChatDock } from './VoiceChatDock';

/** Ludo keeps its own room store, and seats up to six players in one mesh. */
export function LudoVoiceDock({ anchorClassName }: { anchorClassName?: string }) {
  const roomCode = useLudoMultiplayerStore((state) => state.roomCode);
  const transport = useLudoMultiplayerStore((state) => state.transport);

  if (!roomCode) return null;

  return (
    <VoiceChatDock roomCode={roomCode} transport={transport} anchorClassName={anchorClassName} />
  );
}
