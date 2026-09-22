'use client';

import React from 'react';

import type { WordSearchPlayer } from '../types/word-search.types';

interface Props {
  players: WordSearchPlayer[];
  localPlayerId: string | null;
}

const PLAYER_COLORS = ['#f59e0b', '#06b6d4', '#a78bfa', '#34d399', '#fb923c', '#f472b6'];

export function PlayerScoreBoard({ players, localPlayerId }: Props) {
  const sorted = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-3">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Scores</h3>
      <div className="space-y-1.5">
        {sorted.map((player, rank) => {
          const color = PLAYER_COLORS[players.indexOf(player) % PLAYER_COLORS.length];
          const isMe = player.id === localPlayerId;

          return (
            <div
              key={player.id}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-lg ${isMe ? 'bg-slate-800/60' : ''}`}
            >
              <span className="text-xs text-slate-500 w-4 shrink-0 font-mono">#{rank + 1}</span>
              <span className="text-base leading-none shrink-0">{player.avatar}</span>
              <span className="text-xs font-medium truncate flex-1" style={{ color }}>
                {player.displayName}
                {player.isBot && (
                  <span className="ml-1 text-[9px] bg-slate-700 text-slate-400 px-1 rounded">
                    BOT
                  </span>
                )}
              </span>
              <div className="text-right shrink-0">
                <div className="text-xs font-bold text-white">{player.score}</div>
                <div className="text-[10px] text-slate-500">{player.foundWordsCount}w</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
