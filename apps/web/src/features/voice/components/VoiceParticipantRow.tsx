'use client';

import { Loader2, MicOff, TriangleAlert } from 'lucide-react';
import React from 'react';
import type { VoiceParticipant } from '@playdeck/game-types';

const ICON_XS = 'h-3.5 w-3.5';

function StatusIcon({ participant }: { participant: VoiceParticipant }) {
  if (participant.isMuted) {
    return <MicOff className={`${ICON_XS} text-deck-500`} aria-label="Muted" />;
  }
  if (participant.status === 'failed') {
    return <TriangleAlert className={`${ICON_XS} text-rose-400`} aria-label="Connection failed" />;
  }
  if (participant.status !== 'connected') {
    return <Loader2 className={`${ICON_XS} animate-spin text-amber-400`} aria-label="Connecting" />;
  }
  return null;
}

/** Meter width is capped so a shout does not overflow the row. */
function levelWidth(audioLevel: number): string {
  return `${Math.min(100, Math.round(audioLevel * 320))}%`;
}

export function VoiceParticipantRow({ participant }: { participant: VoiceParticipant }) {
  const isRinging = participant.isSpeaking && !participant.isMuted;

  return (
    <li className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-surface-raised">
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm transition-all ${
          isRinging
            ? 'border-emerald-400 bg-emerald-500/15 shadow-[0_0_0_2px_rgba(52,211,153,0.35)]'
            : 'border-surface-border bg-surface-raised'
        }`}
      >
        {participant.avatar}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="truncate text-xs font-semibold text-deck-900 dark:text-deck-100">
            {participant.displayName}
          </span>
          {participant.isLocal && (
            <span className="rounded bg-surface-overlay px-1 text-[9px] font-bold uppercase tracking-wide text-deck-500">
              You
            </span>
          )}
        </span>

        <span className="mt-1 block h-1 w-full overflow-hidden rounded-full bg-surface-overlay">
          <span
            className={`block h-full rounded-full transition-all duration-100 ${
              isRinging ? 'bg-emerald-400' : 'bg-transparent'
            }`}
            style={{ width: isRinging ? levelWidth(participant.audioLevel) : '0%' }}
          />
        </span>
      </span>

      <StatusIcon participant={participant} />
    </li>
  );
}
