'use client';

import React from 'react';
import { useElevatorMultiplayerStore } from '@/stores/elevator-multiplayer.store';
import { VoiceChatDock } from './VoiceChatDock';

/**
 * Voice for Unstable Elevator, which keeps its own room store and seats up to
 * four players in one mesh. Shouting "left, LEFT" is half the game.
 */
export interface ElevatorVoiceDockProps {
  anchorClassName?: string;
  variant?: 'floating' | 'inline';
  defaultOpen?: boolean;
}

export function ElevatorVoiceDock({
  anchorClassName,
  variant,
  defaultOpen,
}: ElevatorVoiceDockProps = {}) {
  const roomCode = useElevatorMultiplayerStore((state) => state.roomCode);
  const transport = useElevatorMultiplayerStore((state) => state.transport);

  if (!roomCode) return null;

  return (
    <VoiceChatDock
      roomCode={roomCode}
      transport={transport}
      anchorClassName={anchorClassName}
      variant={variant}
      defaultOpen={defaultOpen}
    />
  );
}
