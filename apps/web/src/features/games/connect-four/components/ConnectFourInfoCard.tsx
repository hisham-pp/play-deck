'use client';

import { Bot, Trophy, Users } from 'lucide-react';
import React from 'react';
import { Badge } from '@playdeck/ui';
import { MODE_SINGLE } from '../engine/connect-four-constants';
import type { AIDifficulty, GameMode } from '../types/connect-four.types';

export interface ConnectFourInfoCardProps {
  round: number;
  mode: GameMode;
  difficulty: AIDifficulty;
  ties: number;
}

const ROW_BETWEEN = 'flex items-center justify-between';

export function ConnectFourInfoCard({ round, mode, difficulty, ties }: ConnectFourInfoCardProps) {
  const isSingle = mode === MODE_SINGLE;

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
          <Badge variant={isSingle ? 'arcade' : 'default'} size="sm" className="text-[10px]">
            {isSingle ? (
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
