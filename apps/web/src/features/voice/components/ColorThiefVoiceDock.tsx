'use client';

import React from 'react';
import { useColorThiefMultiplayerStore } from '@/stores/color-thief-multiplayer.store';
import { VoiceChatDock } from './VoiceChatDock';

/** Color Thief keeps its own room store, and seats up to six painters in one mesh. */
export function ColorThiefVoiceDock({ anchorClassName }: { anchorClassName?: string }) {
  const roomCode = useColorThiefMultiplayerStore((state) => state.roomCode);
  const transport = useColorThiefMultiplayerStore((state) => state.transport);

  if (!roomCode) return null;

  return (
    <VoiceChatDock roomCode={roomCode} transport={transport} anchorClassName={anchorClassName} />
  );
}
