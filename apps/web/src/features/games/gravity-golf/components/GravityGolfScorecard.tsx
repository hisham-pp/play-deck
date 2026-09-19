'use client';

import React from 'react';
import { COSMIC_HOLES } from '../engine/holes-catalog';
import { calculateStarRating, calculateTotalScore } from '../engine/scoring';
import type { HoleScore } from '../types/gravity-golf.types';

interface GravityGolfScorecardProps {
  scores: Record<number, HoleScore>;
  currentHoleNumber: number;
  onSelectHole: (holeNumber: number) => void;
}

export function GravityGolfScorecard({
  scores,
  currentHoleNumber,
  onSelectHole,
}: GravityGolfScorecardProps) {
  const summary = calculateTotalScore(scores);

  return (
    <div className="w-full p-4 rounded-xl border border-surface-border bg-surface-raised/90 backdrop-blur-md">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-deck-300 font-mono">
          Galactic Scorecard
        </h3>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-deck-400">
            Total Fields: <strong className="text-white">{summary.totalStrokes}</strong>
          </span>
          <span className="text-deck-400">
            Stars: <strong className="text-amber-400">★ {summary.starsEarned}</strong>
          </span>
          <span
            className={`font-bold ${
              summary.totalParDiff < 0
                ? 'text-emerald-400'
                : summary.totalParDiff === 0
                  ? 'text-blue-400'
                  : 'text-rose-400'
            }`}
          >
            {summary.totalParDiff > 0 ? `+${summary.totalParDiff}` : summary.totalParDiff}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-9 gap-1.5 overflow-x-auto pb-1 text-center">
        {COSMIC_HOLES.map((h) => {
          const score = scores[h.number];
          const isCurrent = h.number === currentHoleNumber;
          const stars = score ? calculateStarRating(score.strokes, score.par) : 0;

          return (
            <button
              key={h.id}
              type="button"
              onClick={() => onSelectHole(h.number)}
              className={`p-2 rounded-lg border text-xs flex flex-col items-center justify-between transition-colors cursor-pointer ${
                isCurrent
                  ? 'border-amber-500 bg-amber-500/10 text-white'
                  : score
                    ? 'border-surface-border bg-surface-overlay text-deck-200 hover:border-deck-600'
                    : 'border-surface-border/50 bg-surface-base/40 text-deck-500 hover:border-surface-border'
              }`}
            >
              <span className="text-[10px] font-mono text-deck-400">H{h.number}</span>
              <span className="text-[10px] text-deck-500">P{h.par}</span>
              <span className="font-bold text-sm my-0.5">{score ? score.strokes : '-'}</span>
              <span className="text-[10px] text-amber-400">
                {stars > 0 ? '★'.repeat(stars) : '·'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
