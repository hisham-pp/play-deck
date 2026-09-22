'use client';

import { CheckCircle2, Sparkles } from 'lucide-react';
import React from 'react';

import type { WhoAmIPlayer } from '../types/who-am-i.types';

export interface WhoAmIHeadbandProps {
  player: WhoAmIPlayer;
  isLocalPlayer: boolean;
  isActiveTurn: boolean;
}

export const WhoAmIHeadband: React.FC<WhoAmIHeadbandProps> = ({
  player,
  isLocalPlayer,
  isActiveTurn,
}) => {
  const isHidden = isLocalPlayer && !player.isSolved;

  return (
    <div
      className={`relative flex flex-col items-center p-4 rounded-2xl border transition-all duration-300 ${
        isActiveTurn
          ? 'bg-amber-950/40 border-amber-400 ring-2 ring-amber-400/50 shadow-xl shadow-amber-500/10 scale-105'
          : player.isSolved
            ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
            : 'bg-[#0c1322]/90 border-slate-800 text-slate-300'
      }`}
    >
      {/* Active Turn Indicator */}
      {isActiveTurn && (
        <div className="absolute -top-3 px-3 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] tracking-wider uppercase flex items-center gap-1 shadow">
          <Sparkles className="w-3 h-3" />
          <span>Active Turn</span>
        </div>
      )}

      {/* Solved Stamp */}
      {player.isSolved && (
        <div className="absolute top-2 right-2 flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Solved!</span>
        </div>
      )}

      {/* Headband Card Above Avatar */}
      <div
        className={`w-full mb-3 p-3 rounded-xl border text-center transition-all ${
          isHidden
            ? 'bg-gradient-to-br from-indigo-950/60 via-slate-900 to-indigo-950/60 border-indigo-500/40 shadow-inner'
            : 'bg-[#141c2e] border-amber-500/30 shadow-md'
        }`}
      >
        <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
          ✦ HEADBAND IDENTITY ✦
        </div>

        {isHidden ? (
          <div className="py-2 flex flex-col items-center">
            <div className="text-3xl font-black text-indigo-300 tracking-widest animate-pulse flex items-center gap-1">
              <span>? ? ?</span>
            </div>
            <span className="text-[10px] text-indigo-400/80 mt-1">
              Ask questions to deduce who you are!
            </span>
          </div>
        ) : (
          <div className="py-1 flex flex-col items-center">
            <span className="text-3xl mb-1">{player.identity.icon}</span>
            <div className="text-base sm:text-lg font-black text-amber-200 truncate max-w-[180px]">
              {player.identity.name}
            </div>
            <div className="text-[10px] text-slate-400 capitalize mt-0.5">
              {player.identity.category.replace('-', ' ')}
            </div>
          </div>
        )}
      </div>

      {/* Player Profile & Stats */}
      <div className="flex items-center gap-2.5 w-full">
        <span className="text-2xl p-1.5 rounded-xl bg-slate-900 border border-slate-800">
          {player.avatar}
        </span>
        <div className="min-w-0 flex-1">
          <div className="font-bold text-sm truncate text-slate-100 flex items-center gap-1">
            {player.displayName}
            {isLocalPlayer && (
              <span className="text-[9px] text-amber-300 bg-amber-500/20 px-1 py-0.2 rounded border border-amber-500/30">
                YOU
              </span>
            )}
          </div>
          <div className="text-xs text-slate-400 flex items-center justify-between mt-0.5">
            <span>
              Score: <strong className="text-amber-300">{player.score}</strong>
            </span>
            <span>Q: {player.questionsAsked}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
