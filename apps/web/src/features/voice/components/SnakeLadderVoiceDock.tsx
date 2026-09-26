'use client';

import React from 'react';
import { useSnakeLadderMultiplayerStore } from '@/stores/snake-ladder-multiplayer.store';
import { VoiceChatDock } from './VoiceChatDock';

export interface SnakeLadderVoiceDockProps {
  anchorClassName?: string;
  variant?: 'floating' | 'inline';
  defaultOpen?: boolean;
}

/** Snake & Ladder keeps its own room store, and seats up to four players in one mesh. */
export function SnakeLadderVoiceDock({
  anchorClassName,
  variant,
  defaultOpen,
}: SnakeLadderVoiceDockProps = {}) {
  const roomCode = useSnakeLadderMultiplayerStore((state) => state.roomCode);
  const transport = useSnakeLadderMultiplayerStore((state) => state.transport);

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
