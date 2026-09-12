'use client';

import { Cpu } from 'lucide-react';
import React from 'react';
import { cn } from '@/lib/utils';
import type { PlayerMark } from '../types/tic-tac-toe.types';

export interface TicTacToePlayerCardProps {
  mark: PlayerMark;
  name: string;
  avatar: string;
  roleTag: string;
  score: number;
  isActive: boolean;
  isMe: boolean;
  isAiThinking?: boolean;
  opponentId?: string;
  friendStatus?: 'none' | 'pending' | 'friends';
  onAddFriend?: (opponentId: string) => void;
}

export function TicTacToePlayerCard({
  mark,
  name,
  avatar,
  roleTag,
  score,
  isActive,
  isMe,
  isAiThinking = false,
  opponentId,
  friendStatus = 'none',
  onAddFriend,
}: TicTacToePlayerCardProps) {
  const isX = mark === 'X';

  return (
    <div
      className={cn(
        'w-full p-3 sm:p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-between text-center min-h-[160px] sm:min-h-[190px] md:min-h-[250px]',
        'bg-surface-raised/90 border-surface-border',
        isActive &&
          isX &&
          'border-amber-500/70 bg-amber-500/[0.07] shadow-[0_0_20px_rgba(245,158,11,0.2)] ring-1 ring-amber-500/30',
        isActive &&
          !isX &&
          'border-cyan-500/70 bg-cyan-500/[0.07] shadow-[0_0_20px_rgba(6,182,212,0.2)] ring-1 ring-cyan-500/30',
      )}
    >
      {/* Top: Mark Badge & Role Tag */}
      <div className="w-full flex items-center justify-between gap-1 mb-1">
        <span
          className={cn(
            'px-2 py-0.5 rounded font-mono font-black text-xs border',
            isX
              ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
              : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
          )}
        >
          {mark}
        </span>
        <span className="text-[10px] font-mono uppercase font-semibold text-deck-400 truncate max-w-[90px]">
          {roleTag}
        </span>
      </div>

      {/* Center: Avatar & Player Name */}
      <div className="flex flex-col items-center gap-1 my-1">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-surface-base border border-surface-border flex items-center justify-center text-xl sm:text-2xl shadow-inner">
          {avatar}
        </div>
        <span
          className="text-xs sm:text-sm font-bold text-deck-100 max-w-[120px] sm:max-w-[140px] truncate"
          title={name}
        >
          {name}
        </span>
        {!isMe && opponentId && (
          <div className="mt-0.5">
            {friendStatus === 'friends' ? (
              <span className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                Friends ✓
              </span>
            ) : friendStatus === 'pending' ? (
              <span className="text-[10px] text-amber-400 font-medium px-2 py-0.5 bg-amber-500/10 rounded-full border border-amber-500/20">
                Requested ⏳
              </span>
            ) : (
              <button
                type="button"
                onClick={() => onAddFriend?.(opponentId)}
                className="text-[10px] text-deck-300 hover:text-white font-medium px-2 py-0.5 bg-surface-base hover:bg-surface-overlay border border-surface-border rounded-full transition-colors"
              >
                + Add Friend
              </button>
            )}
          </div>
        )}
      </div>

      {/* Score */}
      <div className="flex flex-col items-center my-0.5">
        <span
          className={cn(
            'text-2xl sm:text-3xl md:text-4xl font-black font-display leading-none',
            isX ? 'text-amber-400' : 'text-cyan-400',
          )}
        >
          {score}
        </span>
        <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-deck-500 font-mono mt-0.5">
          Wins
        </span>
      </div>

      {/* Bottom: Turn Status Indicator */}
      <div className="mt-1">
        {isActive ? (
          isAiThinking ? (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-[10px] font-bold text-cyan-300 animate-pulse font-mono">
              <Cpu className="w-3 h-3 animate-spin" />
              <span>Thinking...</span>
            </div>
          ) : isMe ? (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-bold text-emerald-400 animate-pulse font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>YOUR TURN</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] font-bold text-amber-300 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>THEIR TURN</span>
            </div>
          )
        ) : (
          <span className="text-[10px] text-deck-600 font-mono">WAITING</span>
        )}
      </div>
    </div>
  );
}
