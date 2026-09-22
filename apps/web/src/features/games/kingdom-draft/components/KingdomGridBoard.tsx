'use client';

import React from 'react';

import { calculateGridScore, calculateTileSynergy, GRID_SIZE } from '../engine/kingdom-engine';
import type { GridCoord, KingdomPlayer } from '../types/kingdom-draft.types';

export interface KingdomGridBoardProps {
  player: KingdomPlayer | null;
  onPlaceCard: (coord: GridCoord) => void;
}

export function KingdomGridBoard({ player, onPlaceCard }: KingdomGridBoardProps) {
  if (!player) return null;

  const scoreData = calculateGridScore(player.grid);
  const unplaced = player.unplacedCard;

  return (
    <div className="w-full max-w-xl mx-auto bg-[#111827] border border-[#232f45] rounded-2xl p-6 shadow-xl flex flex-col items-center">
      {/* Kingdom Header */}
      <div className="w-full flex items-center justify-between mb-4 border-b border-[#232f45] pb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">{player.avatar}</span>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              {player.name}'s Kingdom
            </h3>
            <div className="text-[11px] font-mono text-slate-400">3x3 Realm Grid</div>
          </div>
        </div>

        <div className="text-right font-mono">
          <div className="text-xs text-slate-400">Realm Value</div>
          <div className="text-xl font-black text-emerald-400">{scoreData.totalScore} pts</div>
        </div>
      </div>

      {/* Unplaced Tile Prompt */}
      {unplaced && (
        <div className="w-full mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{unplaced.icon}</span>
            <div>
              <div className="text-xs font-bold text-white">{unplaced.name}</div>
              <div className="text-[10px] text-emerald-300 font-mono">
                Click an empty tile on your grid to build!
              </div>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-amber-400">
            +{unplaced.basePoints} pts
          </span>
        </div>
      )}

      {/* 3x3 Grid */}
      <div className="grid grid-cols-3 gap-2.5 w-full aspect-square max-w-md p-2 bg-[#090d16] border border-[#232f45] rounded-2xl shadow-inner">
        {Array.from({ length: GRID_SIZE }).map((_, r) =>
          Array.from({ length: GRID_SIZE }).map((__, c) => {
            const card = player.grid[r]?.[c];
            const isVacant = card === null;
            const synergy = card ? calculateTileSynergy(player.grid, r, c) : 0;

            return (
              <div
                key={`${r}-${c}`}
                onClick={() => {
                  if (isVacant && unplaced) onPlaceCard({ row: r, col: c });
                }}
                className={`rounded-xl border flex flex-col items-center justify-between p-2.5 transition-all text-center relative ${
                  card
                    ? 'bg-[#182032] border-[#2b3954] shadow-sm'
                    : unplaced
                      ? 'bg-emerald-500/5 border-dashed border-emerald-500/60 hover:bg-emerald-500/15 cursor-pointer animate-pulse'
                      : 'bg-[#111827]/40 border-[#1f293d] border-dashed'
                }`}
              >
                {card ? (
                  <>
                    <div className="w-full flex items-center justify-between text-[9px] font-mono">
                      <span className="text-amber-400 font-bold">+{card.basePoints}</span>
                      {synergy > 0 && (
                        <span className="text-emerald-400 font-bold bg-emerald-500/20 px-1 rounded">
                          +{synergy} syn
                        </span>
                      )}
                    </div>

                    <div className="text-3xl my-auto drop-shadow">{card.icon}</div>

                    <div className="text-[10px] font-bold text-white truncate w-full">
                      {card.name}
                    </div>
                  </>
                ) : (
                  <div className="my-auto text-center">
                    <span className="text-slate-600 text-xs font-mono">
                      {unplaced ? 'Build Here' : 'Empty'}
                    </span>
                  </div>
                )}
              </div>
            );
          }),
        )}
      </div>

      {/* Score Subtotal Breakdown */}
      <div className="w-full flex items-center justify-around mt-4 pt-3 border-t border-[#232f45] text-xs font-mono">
        <span className="text-slate-400">
          Base: <strong className="text-white">{scoreData.basePoints}</strong>
        </span>
        <span className="text-slate-400">
          Synergies: <strong className="text-emerald-400">+{scoreData.synergyPoints}</strong>
        </span>
      </div>
    </div>
  );
}
