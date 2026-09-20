'use client';

import React from 'react';

import type { KingdomPlayer, ResourceCard } from '../types/kingdom-draft.types';

export interface KingdomDraftStageProps {
  draftPool: ResourceCard[];
  activePlayer: KingdomPlayer | null;
  isLocalTurn: boolean;
  round: number;
  pickInRound: number;
  totalRounds: number;
  onDraftCard: (cardId: string) => void;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  land: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  people: { bg: 'bg-sky-500/15', text: 'text-sky-400', border: 'border-sky-500/30' },
  food: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' },
  defense: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30' },
  gold: { bg: 'bg-yellow-500/15', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  culture: { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/30' },
};

export function KingdomDraftStage({
  draftPool,
  activePlayer,
  isLocalTurn,
  round,
  pickInRound,
  totalRounds,
  onDraftCard,
}: KingdomDraftStageProps) {
  return (
    <div className="w-full max-w-5xl mx-auto p-4 flex flex-col gap-4">
      {/* Top Status Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#111827] border border-[#232f45] px-6 py-3.5 rounded-xl shadow-lg">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs uppercase text-slate-400 font-bold">
            Round {round + 1} of {totalRounds}
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#1c2438] border border-[#2b3954] text-emerald-400 font-mono font-bold">
            Pick {pickInRound + 1} of 3
          </span>
        </div>

        {/* Turn Status Pill */}
        <div className="flex items-center gap-2">
          {isLocalTurn ? (
            <div className="px-4 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 font-bold text-xs uppercase tracking-wider animate-pulse flex items-center gap-1.5">
              <span>👉</span>
              <span>Your Turn to Draft!</span>
            </div>
          ) : (
            <div className="px-4 py-1.5 rounded-lg bg-[#1c2438] border border-[#2b3954] text-slate-300 font-medium text-xs flex items-center gap-1.5">
              <span>⏳</span>
              <span>
                <strong>{activePlayer?.name}</strong> is choosing...
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Shared Resource Pool Cards */}
      <div className="bg-[#111827] border border-[#232f45] rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Available Provinces & Resources ({draftPool.length} Cards)
          </h2>
          <span className="text-[11px] text-slate-400 font-mono">
            Draft order reverses each round (Snake Draft)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {draftPool.map((card) => {
            const style = CATEGORY_COLORS[card.category] ?? CATEGORY_COLORS.land!;
            return (
              <div
                key={card.id}
                className={`p-4 rounded-xl bg-[#182032] border transition-all flex flex-col justify-between ${
                  isLocalTurn
                    ? 'border-[#2b3954] hover:border-emerald-500 hover:scale-[1.02] shadow-sm cursor-pointer'
                    : 'border-[#232f45] opacity-90'
                }`}
                onClick={() => {
                  if (isLocalTurn) onDraftCard(card.id);
                }}
              >
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <span
                      className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${style.bg} ${style.text} ${style.border}`}
                    >
                      {card.category}
                    </span>
                    <span className="font-mono text-xs font-black text-amber-400">
                      +{card.basePoints} pts
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-3xl">{card.icon}</span>
                    <h3 className="text-sm font-bold text-white leading-tight">{card.name}</h3>
                  </div>

                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    <span className="text-emerald-400 font-medium">Synergy:</span>{' '}
                    {card.synergyDescription}
                  </p>
                </div>

                {isLocalTurn && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDraftCard(card.id);
                    }}
                    className="mt-3 w-full py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-extrabold text-xs uppercase tracking-wider shadow-md transition-all active:scale-95"
                  >
                    Draft Tile
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
