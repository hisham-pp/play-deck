'use client';

import { ArrowRight, RotateCcw, Sparkles, Star } from 'lucide-react';
import React from 'react';
import { calculateStarRating, getGolfScoreTerm } from '../engine/scoring';
import type { HoleDefinition } from '../types/gravity-golf.types';

interface GravityGolfVictoryModalProps {
  isOpen: boolean;
  hole: HoleDefinition;
  strokes: number;
  onNextHole: () => void;
  onReplay: () => void;
  onClose: () => void;
  hasNextHole: boolean;
}

export function GravityGolfVictoryModal({
  isOpen,
  hole,
  strokes,
  onNextHole,
  onReplay,
  onClose,
  hasNextHole,
}: GravityGolfVictoryModalProps) {
  if (!isOpen) return null;

  const scoreTerm = getGolfScoreTerm(strokes, hole.par);
  const stars = calculateStarRating(strokes, hole.par);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md p-6 rounded-2xl border border-surface-border bg-surface-raised shadow-2xl text-center flex flex-col items-center gap-5">
        {/* Header Icon */}
        <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <Sparkles className="w-7 h-7" />
        </div>

        <div>
          <span className="text-xs font-semibold text-deck-400 uppercase tracking-wider font-mono">
            Hole {hole.number} Completed
          </span>
          <h3 className="text-2xl font-black text-white font-display mt-0.5">{hole.name}</h3>
        </div>

        {/* Stars */}
        <div className="flex items-center gap-3 my-1">
          {[1, 2, 3].map((starIdx) => (
            <Star
              key={starIdx}
              className={`w-8 h-8 transition-all ${
                starIdx <= stars
                  ? 'text-amber-400 fill-amber-400 scale-110 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                  : 'text-deck-700'
              }`}
            />
          ))}
        </div>

        {/* Score Term Badge & Metrics */}
        <div className="w-full p-4 rounded-xl border border-surface-border bg-surface-overlay flex flex-col items-center gap-2">
          <div
            className={`px-3 py-1 rounded-full border text-xs font-bold ${scoreTerm.badgeColor}`}
          >
            {scoreTerm.label}
          </div>
          <p className="text-xs text-deck-400">{scoreTerm.description}</p>

          <div className="grid grid-cols-2 gap-4 w-full mt-2 pt-2 border-t border-surface-border text-center">
            <div>
              <div className="text-[11px] text-deck-400 uppercase">Gravity Fields</div>
              <div className="text-xl font-black text-white">{strokes}</div>
            </div>
            <div>
              <div className="text-[11px] text-deck-400 uppercase">Hole Par</div>
              <div className="text-xl font-black text-deck-300">{hole.par}</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full mt-2">
          <button
            type="button"
            onClick={onReplay}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-surface-border bg-surface-overlay text-deck-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Replay</span>
          </button>

          {hasNextHole ? (
            <button
              type="button"
              onClick={onNextHole}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-deck-950 text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-arcade"
            >
              <span>Next Hole</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-arcade"
            >
              <span>Course Clear!</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
