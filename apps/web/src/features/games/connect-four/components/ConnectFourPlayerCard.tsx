'use client';

import { Bot } from 'lucide-react';
import React from 'react';
import { Avatar } from '@playdeck/ui';
import { DISC_RED } from '../engine/connect-four-constants';
import type { ConnectFourDisc } from '../types/connect-four.types';

export interface ConnectFourPlayerCardProps {
  name: string;
  avatar?: string;
  score: number;
  disc: ConnectFourDisc;
  isActive: boolean;
  isAiThinking?: boolean;
  roleLabel: string;
  isAI?: boolean;
}

export function ConnectFourPlayerCard({
  name,
  avatar,
  score,
  disc,
  isActive,
  isAiThinking = false,
  roleLabel,
  isAI = false,
}: ConnectFourPlayerCardProps) {
  const isRed = disc === DISC_RED;

  return (
    <div
      className={`w-full flex flex-col gap-2.5 p-3 sm:p-4 rounded-2xl border transition-all ${
        isActive
          ? isRed
            ? 'bg-rose-500/10 border-rose-500/50 ring-1 ring-rose-500/30 shadow-arcade'
            : 'bg-amber-500/10 border-amber-500/50 ring-1 ring-amber-500/30 shadow-arcade'
          : 'bg-surface-raised border-surface-border opacity-85'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative">
            <Avatar
              src={avatar}
              fallback={isAI ? 'AI' : name[0] || (isRed ? '1' : '2')}
              size="md"
              className={
                isRed
                  ? 'border-2 border-rose-400/50'
                  : 'border-2 border-amber-400/50 bg-deck-800 text-amber-300 font-bold'
              }
            />
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-deck-950 ${
                isRed ? 'bg-rose-500' : 'bg-amber-400'
              }`}
            />
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              {isAI && <Bot className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
              <span className="text-xs sm:text-sm font-bold truncate text-deck-950 dark:text-white font-display">
                {name}
              </span>
            </div>
            <span
              className={`text-[10px] font-semibold tracking-wide uppercase ${
                isRed ? 'text-rose-400' : 'text-amber-400'
              }`}
            >
              {roleLabel}
            </span>
          </div>
        </div>

        {isActive && (
          <span
            className={`w-2 h-2 rounded-full animate-ping ${isRed ? 'bg-rose-500' : 'bg-amber-400'}`}
          />
        )}
      </div>

      <div className="flex items-baseline justify-between pt-2 border-t border-surface-border/50">
        <span className="text-[10px] uppercase font-mono font-medium text-deck-400">Wins</span>
        <div
          className={`font-mono text-2xl sm:text-3xl font-black ${
            isRed ? 'text-rose-400' : 'text-amber-400'
          }`}
        >
          {score}
        </div>
      </div>

      {isAiThinking && (
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-amber-400 animate-pulse pt-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span>Calculating...</span>
        </div>
      )}
    </div>
  );
}
