'use client';

import React from 'react';
import { useMiniGolfMultiplayerStore } from '@/stores/mini-golf-multiplayer.store';
import { VoiceChatDock } from './VoiceChatDock';

/** Mini Golf multiplayer voice chat dock, binding room transport to the WebRTC mesh. */
export function MiniGolfVoiceDock({ anchorClassName }: { anchorClassName?: string }) {
  const roomCode = useMiniGolfMultiplayerStore((state) => state.roomCode);
  const transport = useMiniGolfMultiplayerStore((state) => state.transport);

  if (!roomCode) return null;

  return (
    <VoiceChatDock roomCode={roomCode} transport={transport} anchorClassName={anchorClassName} />
  );
}
