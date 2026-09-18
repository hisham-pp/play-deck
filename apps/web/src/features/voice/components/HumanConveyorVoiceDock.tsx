'use client';

import React from 'react';
import { useHumanConveyorMultiplayerStore } from '@/stores/human-conveyor-multiplayer.store';
import { VoiceChatDock } from './VoiceChatDock';

/** Human Conveyor Belt multiplayer voice chat dock, binding room transport to the WebRTC mesh. */
export function HumanConveyorVoiceDock({ anchorClassName }: { anchorClassName?: string }) {
  const roomCode = useHumanConveyorMultiplayerStore((state) => state.roomCode);
  const transport = useHumanConveyorMultiplayerStore((state) => state.transport);

  if (!roomCode) return null;

  return (
    <VoiceChatDock roomCode={roomCode} transport={transport} anchorClassName={anchorClassName} />
  );
}
