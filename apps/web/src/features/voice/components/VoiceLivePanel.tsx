'use client';

import React from 'react';
import type { VoiceParticipant } from '@playdeck/game-types';
import { hasRelayConfigured } from '../services/ice-servers';
import { VoiceControlBar } from './VoiceControlBar';
import { VoiceParticipantRow } from './VoiceParticipantRow';

interface VoiceLivePanelProps {
  participants: VoiceParticipant[];
  connectedCount: number;
  isMuted: boolean;
  isDeafened: boolean;
  isPushToTalk: boolean;
  isTalkKeyHeld: boolean;
  onToggleMute: () => void;
  onToggleDeafen: () => void;
  onTogglePushToTalk: () => void;
  onLeave: () => void;
}

function EmptyRoomHint() {
  return (
    <p className="px-3 pb-2 text-[11px] text-deck-500">
      {hasRelayConfigured()
        ? 'Waiting for someone else to join voice…'
        : 'Waiting for someone else to join voice. Strict networks may need a TURN relay.'}
    </p>
  );
}

export function VoiceLivePanel({ participants, connectedCount, ...controls }: VoiceLivePanelProps) {
  return (
    <>
      <ul className="max-h-52 space-y-0.5 overflow-y-auto p-2">
        {participants.map((participant) => (
          <VoiceParticipantRow key={participant.peerId} participant={participant} />
        ))}
      </ul>

      {connectedCount === 0 && <EmptyRoomHint />}

      <VoiceControlBar {...controls} />
    </>
  );
}
