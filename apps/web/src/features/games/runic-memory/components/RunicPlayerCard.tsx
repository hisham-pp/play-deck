'use client';

import { Bot, Flame, Sparkles } from 'lucide-react';
import React from 'react';
import { Avatar } from '@playdeck/ui';

interface RunicPlayerCardProps {
  name: string;
  avatar?: string;
  score: number;
  matches: number;
  combo?: number;
  isActive: boolean;
  isAI?: boolean;
  isAiThinking?: boolean;
  roleTag?: string;
  turnLabel?: string;
}

export function RunicPlayerCard({
  name,
  avatar = '🧙‍♂️',
  score,
  matches,
  combo = 0,
  isActive,
  isAI = false,
  isAiThinking = false,
  roleTag,
  turnLabel,
}: RunicPlayerCardProps) {
  return (
    <div
      className={`relative p-4 rounded-xl border transition-all duration-300 flex flex-col gap-3 ${
        isActive
          ? 'bg-surface-raised border-amber-500/60 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/30'
          : 'bg-surface-overlay border-surface-border opacity-85'
      }`}
    >
      {/* Player Identity Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar fallback={avatar} size="md" className="border border-surface-border" />
            {isActive && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-amber-400 ring-2 ring-deck-950 animate-pulse" />
            )}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-deck-900 dark:text-white line-clamp-1">
                {name}
              </span>
              {isAI && <Bot className="w-3.5 h-3.5 text-purple-400" />}
            </div>
            {roleTag && (
              <span className="text-[10px] font-mono uppercase tracking-wider text-deck-500">
                {roleTag}
              </span>
            )}
          </div>
        </div>

        {turnLabel && isActive && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-400 border border-amber-400/30">
            {turnLabel}
          </span>
        )}
      </div>

      {/* AI Thinking Indicator */}
      {isAiThinking && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-500/15 border border-purple-500/30 text-[11px] text-purple-300 animate-pulse">
          <Sparkles className="w-3 h-3" />
          <span>Divining ancient runes...</span>
        </div>
      )}

      {/* Stats Display */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-surface-border/60">
        <div className="flex flex-col">
          <span className="text-[10px] font-semibold text-deck-500 uppercase tracking-wider">
            Pairs
          </span>
          <span className="text-lg font-black text-deck-900 dark:text-white font-mono">
            {matches}
          </span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-semibold text-deck-500 uppercase tracking-wider">
            Score
          </span>
          <span className="text-lg font-black text-amber-400 font-mono">{score}</span>
        </div>
      </div>

      {/* Combo Streak Banner */}
      {combo > 1 && (
        <div className="flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-bold">
          <Flame className="w-3.5 h-3.5 animate-bounce" />
          <span>
            Combo ×{combo}! (+{(combo - 1) * 50} pts)
          </span>
        </div>
      )}
    </div>
  );
}
