'use client';

import { Check, Laugh, Trophy } from 'lucide-react';
import React, { useState } from 'react';

import { Badge, Button } from '@playdeck/ui';

import type {
  ArchitectPlayer,
  ArchitectVote,
  Blueprint,
  Grid8x8,
} from '../types/bad-architect.types';

export interface ArchitectVotingStageProps {
  blueprint: Blueprint;
  builders: ArchitectPlayer[];
  submissions: Record<string, Grid8x8>;
  votes: ArchitectVote[];
  localPlayerId: string;
  isHost: boolean;
  onCastVote: (award: ArchitectVote['award'], targetBuilderId: string) => void;
  onFinalizeRound: () => void;
}

export const ArchitectVotingStage: React.FC<ArchitectVotingStageProps> = ({
  blueprint,
  builders,
  submissions,
  votes,
  localPlayerId,
  isHost,
  onCastVote,
  onFinalizeRound,
}) => {
  const [activeCategory, setActiveCategory] = useState<ArchitectVote['award']>('closest_match');

  const myClosestVote = votes.find(
    (v) => v.voterId === localPlayerId && v.award === 'closest_match',
  )?.targetBuilderId;

  const myFunniestVote = votes.find(
    (v) => v.voterId === localPlayerId && v.award === 'funniest_disaster',
  )?.targetBuilderId;

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto p-4 sm:p-6 bg-[#0c1222]/95 border border-sky-800/40 rounded-2xl shadow-2xl text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-sky-800/30 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl sm:text-3xl font-black text-amber-400">Cast Your Votes!</h2>
            <Badge variant="outline" className="border-amber-500/40 text-amber-300">
              Awards Stage
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Pick the closest masterpiece and the most hilarious disaster!
          </p>
        </div>

        {isHost && (
          <Button
            onClick={onFinalizeRound}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-amber-950 flex items-center gap-2"
          >
            <Trophy className="w-4 h-4" />
            <span>Tally & Award Points</span>
          </Button>
        )}
      </div>

      {/* Category Toggle Tabs */}
      <div className="grid grid-cols-2 gap-3 max-w-md mx-auto w-full">
        <button
          onClick={() => setActiveCategory('closest_match')}
          className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-sm transition-all ${
            activeCategory === 'closest_match'
              ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md'
              : 'bg-[#121929] border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>Closest Match</span>
          {myClosestVote && <Check className="w-4 h-4 text-emerald-400 ml-1" />}
        </button>

        <button
          onClick={() => setActiveCategory('funniest_disaster')}
          className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-sm transition-all ${
            activeCategory === 'funniest_disaster'
              ? 'bg-rose-500/20 border-rose-400 text-rose-300 shadow-md'
              : 'bg-[#121929] border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <Laugh className="w-4 h-4 text-rose-400" />
          <span>Funniest Disaster</span>
          {myFunniestVote && <Check className="w-4 h-4 text-emerald-400 ml-1" />}
        </button>
      </div>

      {/* Category Info Header */}
      <div className="text-center">
        {activeCategory === 'closest_match' ? (
          <p className="text-xs sm:text-sm text-slate-300">
            Select the builder whose structure best matches{' '}
            <strong className="text-amber-400">{blueprint.name}</strong> (+300 pts)
          </p>
        ) : (
          <p className="text-xs sm:text-sm text-slate-300">
            Select the builder whose structure went the most comically off the rails (+200 pts)
          </p>
        )}
      </div>

      {/* Builder Cards for Voting */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {builders.map((builder) => {
          const isSelf = builder.id === localPlayerId;
          const grid = submissions[builder.id];
          const isVotedForThis =
            (activeCategory === 'closest_match' && myClosestVote === builder.id) ||
            (activeCategory === 'funniest_disaster' && myFunniestVote === builder.id);

          return (
            <div
              key={builder.id}
              className={`flex flex-col items-center p-4 rounded-xl border transition-all ${
                isVotedForThis
                  ? activeCategory === 'closest_match'
                    ? 'bg-amber-950/40 border-amber-400 shadow-lg shadow-amber-950/40 ring-1 ring-amber-400'
                    : 'bg-rose-950/40 border-rose-400 shadow-lg shadow-rose-950/40 ring-1 ring-rose-400'
                  : 'bg-[#131c33] border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Builder Header */}
              <div className="flex items-center justify-between w-full mb-3">
                <div className="flex items-center gap-2 truncate">
                  <span className="text-xl">{builder.avatar}</span>
                  <span className="font-bold text-sm text-slate-200 truncate">
                    {builder.displayName}
                  </span>
                </div>
                {isSelf && (
                  <Badge variant="neutral" className="text-[10px] bg-slate-800 text-slate-400">
                    You
                  </Badge>
                )}
              </div>

              {/* 8x8 Mini Canvas */}
              <div className="p-2 bg-[#080d1a] rounded-lg border border-slate-800 shadow-inner mb-4">
                <div className="grid grid-cols-8 gap-0.5 w-36 h-36">
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
                      Empty
                    </div>
                  )}
                </div>
              </div>

              {/* Vote Button */}
              <Button
                size="sm"
                onClick={() => onCastVote(activeCategory, builder.id)}
                disabled={isSelf}
                className={`w-full py-2 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  isVotedForThis
                    ? activeCategory === 'closest_match'
                      ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                      : 'bg-rose-500 text-white hover:bg-rose-400'
                    : 'bg-[#1f2a44] text-slate-200 hover:bg-[#283759]'
                } ${isSelf ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isVotedForThis ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Selected</span>
                  </>
                ) : (
                  <span>Vote {activeCategory === 'closest_match' ? 'Closest' : 'Funniest'}</span>
                )}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
