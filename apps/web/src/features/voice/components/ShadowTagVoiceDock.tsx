'use client';

import React from 'react';
import { useShadowTagMultiplayerStore } from '@/stores/shadow-tag-multiplayer.store';
import { VoiceChatDock } from './VoiceChatDock';

export interface ShadowTagVoiceDockProps {
  anchorClassName?: string;
  variant?: 'floating' | 'inline';
  defaultOpen?: boolean;
}

/** Shadow Tag runs its own room store, and seats up to six players in one mesh. */
export function ShadowTagVoiceDock({
  anchorClassName,
  variant,
  defaultOpen,
}: ShadowTagVoiceDockProps = {}) {
  const roomCode = useShadowTagMultiplayerStore((state) => state.roomCode);
  const transport = useShadowTagMultiplayerStore((state) => state.transport);

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
