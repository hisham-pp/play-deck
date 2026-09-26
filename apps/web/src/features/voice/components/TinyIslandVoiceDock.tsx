'use client';

import React from 'react';
import { useTinyIslandMultiplayerStore } from '@/stores/tiny-island-multiplayer.store';
import { VoiceChatDock } from './VoiceChatDock';

export interface TinyIslandVoiceDockProps {
  anchorClassName?: string;
  variant?: 'floating' | 'inline';
  defaultOpen?: boolean;
}

/** Tiny Island multiplayer voice chat dock, binding room transport to the WebRTC mesh. */
export function TinyIslandVoiceDock({
  anchorClassName,
  variant,
  defaultOpen,
}: TinyIslandVoiceDockProps = {}) {
  const roomCode = useTinyIslandMultiplayerStore((state) => state.roomCode);
  const transport = useTinyIslandMultiplayerStore((state) => state.transport);

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
