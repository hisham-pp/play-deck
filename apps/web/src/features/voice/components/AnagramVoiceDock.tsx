'use client';

import React from 'react';
import { useAnagramMultiplayerStore } from '@/stores/anagram-multiplayer.store';
import { VoiceChatDock } from './VoiceChatDock';

/** Anagram Sprint keeps its own room store, and seats up to eight racers in one mesh. */
export function AnagramVoiceDock({ anchorClassName }: { anchorClassName?: string }) {
  const roomCode = useAnagramMultiplayerStore((state) => state.roomCode);
  const transport = useAnagramMultiplayerStore((state) => state.transport);

  if (!roomCode) return null;

  return (
    <VoiceChatDock roomCode={roomCode} transport={transport} anchorClassName={anchorClassName} />
  );
}
