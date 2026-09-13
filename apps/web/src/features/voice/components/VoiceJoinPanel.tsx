'use client';

import { Headset, Loader2 } from 'lucide-react';
import React from 'react';

interface VoiceJoinPanelProps {
  roomCode: string;
  error: string | null;
  isBusy: boolean;
  onConnect: () => void;
}

export function VoiceJoinPanel({ roomCode, error, isBusy, onConnect }: VoiceJoinPanelProps) {
  return (
    <div className="space-y-2 p-3">
      <p className="text-[11px] leading-relaxed text-deck-500">
        Talk to everyone in room{' '}
        <span className="font-mono font-bold text-amber-400">{roomCode}</span>.
      </p>

      {error && (
        <p role="alert" className="text-[11px] font-medium text-rose-400">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={onConnect}
        disabled={isBusy}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 px-3 py-2 text-xs font-bold text-deck-950 transition-colors hover:bg-amber-400 disabled:opacity-60"
      >
        {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Headset className="h-4 w-4" />}
        <span>{isBusy ? 'Asking for mic…' : 'Join voice'}</span>
      </button>
    </div>
  );
}
