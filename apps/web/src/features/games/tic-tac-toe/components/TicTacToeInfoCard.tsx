'use client';

import { Check, Copy, Globe, Sparkles, Users } from 'lucide-react';
import React, { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { MODE_LOCAL_2P, MODE_MULTIPLAYER, MODE_SINGLE } from '../engine/tic-tac-toe-constants';
import type { AIDifficulty, GameMode } from '../types/tic-tac-toe.types';

export interface TicTacToeInfoCardProps {
  round: number;
  ties: number;
  mode: GameMode;
  roomCode: string | null;
  aiDifficulty: AIDifficulty;
}

const BTN_TYPE = 'button';
const ICON_CLASS = 'w-3.5 h-3.5';

export function TicTacToeInfoCard({
  round,
  ties,
  mode,
  roomCode,
  aiDifficulty,
}: TicTacToeInfoCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    if (!roomCode) return;
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard fallback
    }
  };

  return (
    <div className="w-full flex flex-col gap-2.5 p-3 rounded-2xl bg-surface-raised/80 border border-surface-border shadow-arcade text-xs">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-deck-400 uppercase tracking-widest font-mono">
          Match Info
        </span>
        <Badge
          variant="outline"
          size="sm"
          className="font-mono text-[11px] border-surface-border text-deck-300"
        >
          ROUND {round}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-surface-base/80 border border-surface-border">
          <span className="text-[10px] uppercase tracking-wider text-deck-500 font-semibold">
            Ties
          </span>
          <span className="text-base font-black font-mono text-deck-200">{ties}</span>
        </div>

        <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-surface-base/80 border border-surface-border">
          <span className="text-[10px] uppercase tracking-wider text-deck-500 font-semibold">
            Mode
          </span>
          <div className="flex items-center gap-1 mt-0.5">
            {mode === MODE_SINGLE && <Sparkles className={`${ICON_CLASS} text-amber-400`} />}
            {mode === MODE_LOCAL_2P && <Users className={`${ICON_CLASS} text-sky-400`} />}
            {mode === MODE_MULTIPLAYER && <Globe className={`${ICON_CLASS} text-emerald-400`} />}
            <span className="text-xs font-bold font-mono uppercase text-deck-200">
              {mode === MODE_SINGLE ? 'AI' : mode === MODE_LOCAL_2P ? 'Local' : 'Online'}
            </span>
          </div>
        </div>
      </div>

      {mode === MODE_SINGLE && (
        <div className="flex items-center justify-between p-2 rounded-xl bg-surface-overlay/50 border border-surface-border text-[11px]">
          <span className="text-deck-400 font-medium">Difficulty:</span>
          <Badge variant="arcade" size="sm" className="capitalize text-[10px] px-2 py-0.5">
            {aiDifficulty}
          </Badge>
        </div>
      )}

      {mode === MODE_MULTIPLAYER && roomCode && (
        <button
          type={BTN_TYPE}
          onClick={handleCopyCode}
          className="flex items-center justify-between p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-mono font-semibold transition-colors cursor-pointer"
          title="Click to copy room code"
        >
          <div className="flex items-center gap-1.5">
            <Globe className={ICON_CLASS} />
            <span>#{roomCode}</span>
          </div>
          {copied ? (
            <Check className="w-3.5 h-3.5 text-emerald-300" />
          ) : (
            <Copy className="w-3.5 h-3.5 text-deck-400" />
          )}
        </button>
      )}
    </div>
  );
}
