'use client';

import { HelpCircle, RotateCcw, Sparkles, Users, Volume2, VolumeX } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

const PLAYER_OPTIONS = [2, 3, 4] as const;

interface UnoHeaderProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenRules: () => void;
  onRestart: (count?: number) => void;
  playerCount: number;
  onSelectPlayerCount: (count: number) => void;
  lastActionMessage: string;
}

export function UnoHeader({
  soundEnabled,
  onToggleSound,
  onOpenRules,
  onRestart,
  playerCount,
  onSelectPlayerCount,
  lastActionMessage,
}: UnoHeaderProps) {
  return (
    <>
      {/* Top Header Bar */}
      <div className="mb-4 flex w-full max-w-5xl items-center justify-between gap-4 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-3">
          <Link
            href="/games"
            className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-400/90 transition-colors hover:text-amber-300"
          >
            ← Arcade Catalog
          </Link>
          <span className="text-slate-600">/</span>
          <h1 className="flex items-center gap-2 text-sm font-bold tracking-wide text-slate-200">
            <Sparkles className="h-4 w-4 text-amber-400" />
            UNO-Style Cards
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleSound}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700/60 bg-slate-800/50 text-slate-300 transition-colors hover:bg-slate-700"
            title={soundEnabled ? 'Mute' : 'Unmute'}
            aria-label="Toggle Sound"
          >
            {soundEnabled ? (
              <Volume2 className="h-4 w-4 text-amber-400" />
            ) : (
              <VolumeX className="h-4 w-4 text-slate-500" />
            )}
          </button>
          <button
            onClick={onOpenRules}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700/60 bg-slate-800/50 px-2.5 py-1 text-xs font-semibold text-slate-300 transition-colors hover:bg-slate-700"
          >
            <HelpCircle className="h-3.5 w-3.5 text-amber-400" />
            Rules
          </button>
          <button
            onClick={() => onRestart()}
            className="flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-400 transition-colors hover:bg-amber-500/20"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            New Deal
          </button>
        </div>
      </div>

      {/* Seating / Player Count Bar */}
      <div className="mb-4 flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800/80 bg-slate-900/60 p-2.5 backdrop-blur-md">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
          <Users className="h-4 w-4 text-amber-400" />
          <span>Table Seats:</span>
          {PLAYER_OPTIONS.map((count) => (
            <button
              key={count}
              onClick={() => {
                onSelectPlayerCount(count);
                onRestart(count);
              }}
              className={`rounded-lg px-2.5 py-1 transition-all ${
                playerCount === count
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {count} Players
            </button>
          ))}
        </div>

        {/* Turn & Action Toast */}
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{lastActionMessage}</span>
        </div>
      </div>
    </>
  );
}
