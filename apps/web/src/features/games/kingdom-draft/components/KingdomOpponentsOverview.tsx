'use client';

import React from 'react';

import { GRID_SIZE } from '../engine/kingdom-engine';
import type { KingdomPlayer } from '../types/kingdom-draft.types';

export interface KingdomOpponentsOverviewProps {
  opponents: KingdomPlayer[];
}

export function KingdomOpponentsOverview({ opponents }: KingdomOpponentsOverviewProps) {
  if (opponents.length === 0) return null;

  return (
    <div className="w-full max-w-5xl mx-auto mt-6 bg-[#111827] border border-[#232f45] rounded-2xl p-5 shadow-lg">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
        Rival Realms Overview
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {opponents.map((opp) => (
          <div
            key={opp.id}
            className="p-3 rounded-xl bg-[#182032] border border-[#232f45] flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#232f45]">
              <div className="flex items-center gap-2">
                <span>{opp.avatar}</span>
                <span className="text-xs font-bold text-white truncate max-w-[90px]">
                  {opp.name}
                </span>
              </div>
              <span className="font-mono text-xs font-bold text-emerald-400">{opp.score} pts</span>
            </div>

            {/* Mini 3x3 Grid */}
            <div className="grid grid-cols-3 gap-1 aspect-square bg-[#0f1422] p-1.5 rounded-lg border border-[#232f45]/60 shadow-inner">
              {Array.from({ length: GRID_SIZE }).map((_, r) =>
                Array.from({ length: GRID_SIZE }).map((__, c) => {
                  const tile = opp.grid[r]?.[c];
                  return (
                    <div
                      key={`${r}-${c}`}
                      className={`rounded flex items-center justify-center text-sm ${
                        tile ? 'bg-[#1c2438] border border-[#2b3954]' : 'bg-[#141b2b]'
                      }`}
                    >
                      {tile?.icon ?? ''}
                    </div>
                  );
                }),
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
