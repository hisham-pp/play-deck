'use client';

import React from 'react';

import type { WordPlacement, WordSearchPlayer } from '../types/word-search.types';

interface Props {
  placements: WordPlacement[];
  players: WordSearchPlayer[];
  localPlayerId: string | null;
}

const PLAYER_COLORS = ['#f59e0b', '#06b6d4', '#a78bfa', '#34d399', '#fb923c', '#f472b6'];

function getPlayerColor(players: WordSearchPlayer[], id: string): string {
  const idx = players.findIndex((p) => p.id === id);
  return PLAYER_COLORS[idx < 0 ? 0 : idx % PLAYER_COLORS.length];
}

export function WordList({ placements, players, localPlayerId }: Props) {
  const total = placements.length;
  const found = placements.filter((p) => p.found).length;

  return (
    <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-4 flex flex-col h-full max-h-[480px]">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
        <h3 className="text-sm font-semibold text-slate-300">
          Words{' '}
          <span className="text-amber-400">
            {found}/{total}
          </span>
        </h3>
        <span className="text-xs text-slate-500">Find them all!</span>
      </div>

      <div className="overflow-y-auto flex-1 space-y-1 pr-1">
        {[...placements]
          .sort((a, b) => a.word.localeCompare(b.word))
          .map((p) => {
            const color = p.claimedBy ? getPlayerColor(players, p.claimedBy) : null;
            const claimPlayer = p.claimedBy ? players.find((pl) => pl.id === p.claimedBy) : null;
            const isMine = p.claimedBy === localPlayerId;

            return (
              <div
                key={p.word}
                className="flex items-center gap-2 px-2 py-1 rounded-md"
                style={
                  p.found
                    ? {
                        backgroundColor: (color ?? '#f59e0b') + '22',
                        borderLeft: `3px solid ${color ?? '#f59e0b'}`,
                      }
                    : { borderLeft: '3px solid transparent' }
                }
              >
                <span
                  className={`text-xs font-mono tracking-wide ${
                    p.found
                      ? isMine
                        ? 'line-through text-amber-300'
                        : 'line-through text-slate-400'
                      : 'text-slate-200'
                  }`}
                >
                  {p.word}
                </span>
                {p.found && claimPlayer && (
                  <span className="ml-auto text-[10px] text-slate-400 truncate max-w-[60px]">
                    {claimPlayer.avatar}
                  </span>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}
