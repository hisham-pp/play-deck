'use client';

import { Bot, Check, Copy, Globe, Trophy, Users } from 'lucide-react';
import React, { useState } from 'react';
import { Badge } from '@playdeck/ui';
import { MODE_MULTIPLAYER, MODE_SINGLE } from '../engine/connect-four-constants';
import type { AIDifficulty, GameMode } from '../types/connect-four.types';

export interface ConnectFourInfoCardProps {
  round: number;
  mode: GameMode;
  difficulty: AIDifficulty;
  ties: number;
  roomCode?: string | null;
}

const ROW_BETWEEN = 'flex items-center justify-between';

export function ConnectFourInfoCard({
  round,
  mode,
  difficulty,
  ties,
  roomCode,
}: ConnectFourInfoCardProps) {
  const [copied, setCopied] = useState(false);
  const isSingle = mode === MODE_SINGLE;
  const isMultiplayer = mode === MODE_MULTIPLAYER;

  const handleCopyCode = () => {
    if (!roomCode) return;
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-surface-raised border border-surface-border rounded-2xl p-3 sm:p-4 shadow-sm flex flex-col gap-3">
      <div className={ROW_BETWEEN}>
        <span className="text-xs font-bold uppercase tracking-wider font-display text-deck-400">
          Match Info
        </span>
        <Badge
          variant="outline"
          size="sm"
          className="font-mono text-[10px] tracking-wider uppercase"
        >
          Round {round}
        </Badge>
      </div>

      <div className="flex flex-col gap-2 pt-1 border-t border-surface-border/50 text-xs">
        <div className={ROW_BETWEEN}>
          <span className="text-deck-500">Mode</span>
          <Badge
            variant={isSingle || isMultiplayer ? 'arcade' : 'default'}
            size="sm"
            className="text-[10px]"
          >
            {isMultiplayer ? (
              <span className="flex items-center gap-1">
                <Globe className="w-3 h-3 text-amber-400" /> Online 1v1
              </span>
            ) : isSingle ? (
              <span className="flex items-center gap-1">
                <Bot className="w-3 h-3" /> VS AI
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" /> Local 2P
              </span>
            )}
          </Badge>
        </div>

        {isMultiplayer && roomCode && (
          <div className={ROW_BETWEEN}>
            <span className="text-deck-500">Room Code</span>
            <button
              type="button"
              onClick={handleCopyCode}
              className="flex items-center gap-1 font-mono text-[11px] font-bold text-amber-400 hover:text-amber-300 transition-colors"
              title="Copy room code"
            >
              <span>{roomCode}</span>
              {copied ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3 text-deck-400" />
              )}
            </button>
          </div>
        )}

        {isSingle && (
          <div className={ROW_BETWEEN}>
            <span className="text-deck-500">Difficulty</span>
            <span className="font-mono text-[11px] font-bold text-amber-400 uppercase">
              {difficulty}
            </span>
          </div>
        )}

        <div className={ROW_BETWEEN}>
          <span className="text-deck-500 flex items-center gap-1">
            <Trophy className="w-3 h-3 text-deck-400" /> Draws / Ties
          </span>
          <span className="font-mono font-bold text-white text-xs">{ties}</span>
        </div>
      </div>
    </div>
  );
}
