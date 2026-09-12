'use client';

import { Check, Copy, Globe } from 'lucide-react';
import React, { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { MODE_MULTIPLAYER, MODE_SINGLE } from '../engine/tic-tac-toe-constants';
import type { AIDifficulty, GameMode } from '../types/tic-tac-toe.types';

export interface TicTacToeCenterHeaderProps {
  round: number;
  ties: number;
  mode: GameMode;
  roomCode: string | null;
  aiDifficulty: AIDifficulty;
}

export function TicTacToeCenterHeader({
  round,
  ties,
  mode,
  roomCode,
  aiDifficulty,
}: TicTacToeCenterHeaderProps) {
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
    <div className="w-full flex items-center justify-between px-1 py-1 gap-2 flex-wrap">
      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          size="sm"
          className="font-mono text-xs border-surface-border text-deck-400"
        >
          ROUND {round}
        </Badge>

        <Badge
          variant="neutral"
          size="sm"
          className="font-mono text-xs text-deck-400 bg-surface-raised border border-surface-border"
        >
          TIES: {ties}
        </Badge>
      </div>

      <div className="flex items-center gap-2">
        {mode === MODE_SINGLE && (
          <Badge variant="arcade" size="sm" className="capitalize text-[11px]">
            AI: {aiDifficulty}
          </Badge>
        )}

        {mode === MODE_MULTIPLAYER && roomCode && (
          <button
            type="button"
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-mono font-semibold transition-colors cursor-pointer"
            title="Click to copy room code"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Room #{roomCode}</span>
            {copied ? (
              <Check className="w-3 h-3 text-emerald-300" />
            ) : (
              <Copy className="w-3 h-3 text-deck-400" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
