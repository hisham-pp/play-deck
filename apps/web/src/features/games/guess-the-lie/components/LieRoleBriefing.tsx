'use client';

import { Clock, Eye, ShieldCheck, Skull } from 'lucide-react';
import React from 'react';

import { Badge } from '@playdeck/ui';

import type { LiePlayerRole, LiePrompt } from '../types/guess-the-lie.types';

export interface LieRoleBriefingProps {
  role: LiePlayerRole;
  prompt: LiePrompt;
  timeLeft: number;
}

export const LieRoleBriefing: React.FC<LieRoleBriefingProps> = ({ role, prompt, timeLeft }) => {
  const isLiar = role === 'liar';

  return (
    <div className="flex flex-col items-center justify-center min-h-[450px] w-full max-w-xl mx-auto p-6 bg-[#0b1220]/95 border border-slate-800 rounded-3xl shadow-2xl text-slate-100 text-center animate-in fade-in zoom-in-95 duration-200 select-none">
      {/* Timer Pill */}
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700 text-slate-400 text-xs font-mono mb-6">
        <Clock className="w-3.5 h-3.5" />
        <span>Starting in {timeLeft}s</span>
      </div>

      {/* Role Card */}
      <div
        className={`flex flex-col items-center p-8 rounded-2xl border w-full transition-all shadow-2xl ${
          isLiar
            ? 'bg-rose-950/40 border-rose-500/60 shadow-rose-950/40'
            : 'bg-emerald-950/40 border-emerald-500/60 shadow-emerald-950/40'
        }`}
      >
        <div
          className={`p-4 rounded-2xl border mb-4 ${
            isLiar
              ? 'bg-rose-500/20 border-rose-500 text-rose-400'
              : 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
          }`}
        >
          {isLiar ? (
            <Skull className="w-12 h-12 animate-pulse" />
          ) : (
            <ShieldCheck className="w-12 h-12" />
          )}
        </div>

        <Badge
          variant="outline"
          className={`text-xs uppercase tracking-widest px-3 py-0.5 mb-2 font-black ${
            isLiar ? 'border-rose-400 text-rose-300' : 'border-emerald-400 text-emerald-300'
          }`}
        >
          {isLiar ? 'Classified Role' : 'Your Assignment'}
        </Badge>

        <h2 className="text-3xl font-black tracking-wide mb-2 text-white">
          {isLiar ? 'You are THE LIAR!' : 'You are a TRUTH-TELLER!'}
        </h2>

        <p className="text-sm text-slate-300 max-w-md leading-relaxed mt-1">
          {isLiar
            ? 'You are the only player who must lie! Invent a convincing, plausible falsehood to trick the room.'
            : 'Submit a 100% genuine truthful answer. Later, you must listen and identify whose answer is fake!'}
        </p>

        {/* Prompt Preview */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 w-full text-left">
          <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
            <Eye className="w-3.5 h-3.5 text-indigo-400" />
            <span>Category: {prompt.category}</span>
          </div>
          <p className="text-sm font-semibold text-indigo-200 italic">"{prompt.question}"</p>
        </div>
      </div>
    </div>
  );
};
