'use client';

import React from 'react';
import { useGravityGolfMultiplayerStore } from '@/stores/gravity-golf-multiplayer.store';
import { VoiceChatDock } from './VoiceChatDock';

/**
 * Voice chat integration for Gravity Golf.
 * Discuss orbital slingshots and laugh at black hole captures over full mesh WebRTC audio.
 */
export function GravityGolfVoiceDock({ anchorClassName }: { anchorClassName?: string }) {
  const roomCode = useGravityGolfMultiplayerStore((state) => state.roomCode);
  const transport = useGravityGolfMultiplayerStore((state) => state.transport);

  if (!roomCode) return null;

  return (
    <VoiceChatDock roomCode={roomCode} transport={transport} anchorClassName={anchorClassName} />
  );
}
