'use client';

import React, { useState } from 'react';

import { checkSecretObjective, GRID_SIZE } from '../engine/kingdom-engine';
import type { KingdomPlayer } from '../types/kingdom-draft.types';

export interface KingdomSecretObjectiveCardProps {
  player: KingdomPlayer | null;
}

export function KingdomSecretObjectiveCard({ player }: KingdomSecretObjectiveCardProps) {
  const [revealed, setRevealed] = useState(true);

  if (!player || !player.secretObjective) return null;

  const obj = player.secretObjective;
  const isFulfilled = checkSecretObjective(player);

  // Count matching tiles on grid
  let matchCount = 0;
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const card = player.grid[r]?.[c];
      if (card && card.category === obj.targetCategory) {
        matchCount++;
      }
    }
  }

  return (
    <div className="w-full max-w-xl mx-auto bg-[#111827] border border-[#232f45] rounded-2xl p-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">📜</span>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Your Secret Ambition
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono font-bold">
            +{obj.bonusPoints} pts
          </span>
        </div>

        <button
          type="button"
          onClick={() => setRevealed((prev) => !prev)}
          className="text-xs text-slate-400 hover:text-white font-mono"
        >
          {revealed ? 'Hide [👁️]' : 'Show [🔒]'}
        </button>
      </div>

      {revealed ? (
        <div className="mt-3 p-3 rounded-xl bg-[#182032] border border-[#232f45]">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-bold text-amber-400">{obj.title}</h4>
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                isFulfilled
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-slate-700/50 text-slate-400'
              }`}
            >
              {isFulfilled ? 'FULFILLED (Ready)' : `${matchCount}/3 Tiles`}
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{obj.description}</p>
        </div>
      ) : (
        <div className="mt-2 py-2 text-center text-xs text-slate-600 font-mono italic">
          Secret objective hidden. Click Show to view.
        </div>
      )}
    </div>
  );
}
