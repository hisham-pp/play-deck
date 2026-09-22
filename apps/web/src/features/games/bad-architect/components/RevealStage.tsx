'use client';

import { ArrowRight } from 'lucide-react';
import React from 'react';

import { Badge, Button } from '@playdeck/ui';

import { calculateSimilarityScore } from '../engine/architect-engine';
import type { Blueprint, Grid8x8, ArchitectPlayer } from '../types/bad-architect.types';

export interface RevealStageProps {
  blueprint: Blueprint;
  architect: ArchitectPlayer;
  builders: ArchitectPlayer[];
  submissions: Record<string, Grid8x8>;
  isHost: boolean;
  onAdvanceToVoting: () => void;
}

export const RevealStage: React.FC<RevealStageProps> = ({
  blueprint,
  architect,
  builders,
  submissions,
  isHost,
  onAdvanceToVoting,
}) => {
  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto p-4 sm:p-6 bg-[#0c1222]/95 border border-sky-800/40 rounded-2xl shadow-2xl text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-sky-800/30 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl sm:text-3xl font-black text-amber-400">The Grand Reveal!</h2>
            <Badge variant="outline" className="border-amber-500/40 text-amber-300">
              Curtain Unveiled
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Compare what {architect.displayName} described against what everyone actually built!
          </p>
        </div>

        {isHost && (
          <Button
            onClick={onAdvanceToVoting}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-amber-950"
          >
            <span>Proceed to Voting</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Blueprint Reference Banner */}
      <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-[#11192e] border border-sky-500/40 shadow-lg">
        {/* Blueprint Preview */}
        <div className="p-2 bg-[#080d1a] rounded-lg border border-sky-900/60 shadow-inner">
          <div className="grid grid-cols-8 gap-0.5 w-32 h-32">
            {blueprint.grid.map((row, rIdx) =>
              row.map((cell, cIdx) => (
                <div
                  key={`${rIdx}-${cIdx}`}
                  className="w-full h-full rounded-[1px]"
                  style={{ backgroundColor: cell ?? '#1a233a' }}
                />
              )),
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase tracking-wider text-sky-400 font-bold">
              Target Blueprint
            </span>
            <Badge className="bg-sky-950 text-sky-300 text-[10px] border-sky-800">
              {blueprint.difficulty}
            </Badge>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">{blueprint.name}</h3>
          <p className="text-xs text-slate-300 mt-1 max-w-lg">
            {blueprint.descriptionHints[0] ?? 'The intended architectural design.'}
          </p>
        </div>
      </div>

      {/* Gallery of Builder Submissions */}
      <div className="flex flex-col gap-3">
        <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          Builder Gallery ({builders.length})
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {builders.map((builder) => {
            const grid = submissions[builder.id];
            const similarity = grid ? calculateSimilarityScore(blueprint.grid, grid) : 0;

            return (
              <div
                key={builder.id}
                className="flex flex-col items-center p-4 rounded-xl bg-[#131c33] border border-slate-800 shadow-md transition-all hover:border-sky-500/30"
              >
                {/* Builder Header */}
                <div className="flex items-center justify-between w-full mb-3">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-xl">{builder.avatar}</span>
                    <span className="font-bold text-sm text-slate-200 truncate">
                      {builder.displayName}
                    </span>
                  </div>

                  <Badge
                    variant="outline"
                    className={`font-mono text-xs ${
                      similarity >= 70
                        ? 'border-emerald-500/50 text-emerald-400'
                        : similarity >= 40
                          ? 'border-amber-500/50 text-amber-400'
                          : 'border-rose-500/50 text-rose-400'
                    }`}
                  >
                    {similarity}% match
                  </Badge>
                </div>

                {/* 8x8 Mini Canvas */}
                <div className="p-2 bg-[#080d1a] rounded-lg border border-slate-800 shadow-inner mb-2">
                  <div className="grid grid-cols-8 gap-0.5 w-40 h-40 sm:w-44 sm:h-44">
                    {grid ? (
                      grid.map((row, rIdx) =>
                        row.map((cell, cIdx) => (
                          <div
                            key={`${rIdx}-${cIdx}`}
                            className="w-full h-full rounded-[1px]"
                            style={{ backgroundColor: cell ?? '#1a233a' }}
                          />
                        )),
                      )
                    ) : (
                      <div className="col-span-8 row-span-8 flex items-center justify-center text-xs text-slate-500">
                        No submission
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
