'use client';

import { Check, Heart, Shield, Sparkles, Swords } from 'lucide-react';
import React from 'react';
import type { LevelUpEvent } from '../engine/progression';

interface LevelUpModalProps {
  event: LevelUpEvent;
  onDismiss: () => void;
}

export function LevelUpModal({ event, onDismiss }: LevelUpModalProps) {
  const { stats, newLevel, bonusAtk, bonusDef } = event;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl border border-amber-500/60 bg-gradient-to-b from-[#1c2438] to-[#0b101b] p-6 shadow-[0_0_50px_rgba(245,158,11,0.25)] text-center space-y-4">
        {/* Glow Crown Emblem */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 text-slate-950 shadow-lg shadow-amber-500/40 ring-4 ring-amber-400/30">
          <Sparkles className="w-8 h-8" />
        </div>

        <div>
          <div className="text-[11px] uppercase tracking-[0.25em] font-mono text-amber-400 font-bold">
            Ascent Mastery Increased!
          </div>
          <h2 className="text-2xl font-black text-white mt-1">Level {newLevel} Reached!</h2>
          <p className="text-xs text-amber-200/90 font-medium mt-0.5">{stats.title}</p>
        </div>

        {/* Stat Growth Breakdown */}
        <div className="rounded-2xl border border-surface-border bg-slate-950/70 p-3.5 space-y-2 text-xs">
          <div className="flex items-center justify-between py-1 border-b border-white/5">
            <span className="flex items-center gap-1.5 text-deck-300">
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              <span>Max Health & Restoration:</span>
            </span>
            <span className="font-mono font-bold text-emerald-400">
              {stats.maxHealth} HP (Full Heal!)
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-white/5">
            <span className="flex items-center gap-1.5 text-deck-300">
              <Swords className="w-3.5 h-3.5 text-amber-400" />
              <span>Base Attack Power:</span>
            </span>
            <span className="font-mono font-bold text-amber-300">+{bonusAtk} Permanent</span>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="flex items-center gap-1.5 text-deck-300">
              <Shield className="w-3.5 h-3.5 text-sky-400" />
              <span>Defense Armor Buffer:</span>
            </span>
            <span className="font-mono font-bold text-sky-300">+{bonusDef} Permanent</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onDismiss}
          className="w-full rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-amber-500/25 cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Check className="w-4 h-4" />
          <span>Claim Power & Continue Climb</span>
        </button>
      </div>
    </div>
  );
}
