'use client';

import React from 'react';
import { useTinyIslandMultiplayerStore } from '@/stores/tiny-island-multiplayer.store';
import { VoiceChatDock } from './VoiceChatDock';

/** Tiny Island multiplayer voice chat dock, binding room transport to the WebRTC mesh. */
export function TinyIslandVoiceDock({ anchorClassName }: { anchorClassName?: string }) {
  const roomCode = useTinyIslandMultiplayerStore((state) => state.roomCode);
  const transport = useTinyIslandMultiplayerStore((state) => state.transport);

  if (!roomCode) return null;

  return (
    <VoiceChatDock roomCode={roomCode} transport={transport} anchorClassName={anchorClassName} />
  );
}
