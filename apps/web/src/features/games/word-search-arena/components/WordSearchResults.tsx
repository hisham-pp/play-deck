'use client';

import React from 'react';

import { Button } from '@playdeck/ui';

import type { WordSearchPlayer } from '../types/word-search.types';

interface Props {
  players: WordSearchPlayer[];
  localPlayerId: string | null;
  onPlayAgain: () => void;
}

const PLAYER_COLORS = ['#f59e0b', '#06b6d4', '#a78bfa', '#34d399', '#fb923c', '#f472b6'];
const MEDALS = ['🥇', '🥈', '🥉'];

export function WordSearchResults({ players, localPlayerId, onPlayAgain }: Props) {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const winner = sorted[0];
  const localIsWinner = winner?.id === localPlayerId;

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto py-6">
      <div className="text-center">
        <div className="text-5xl mb-2">{localIsWinner ? '🏆' : '🔍'}</div>
        <h2 className="text-2xl font-bold text-white">
          {localIsWinner ? 'You Win!' : `${winner?.displayName ?? 'Player'} Wins!`}
        </h2>
        <p className="text-slate-400 text-sm mt-1">All words have been found!</p>
      </div>

      <div className="w-full bg-slate-900/80 rounded-xl border border-slate-800 overflow-hidden">
        {sorted.map((player, rank) => {
          const color = PLAYER_COLORS[players.indexOf(player) % PLAYER_COLORS.length];
          const isMe = player.id === localPlayerId;
          return (
            <div
              key={player.id}
              className={`flex items-center gap-3 px-4 py-3 border-b border-slate-800/50 last:border-0 ${isMe ? 'bg-slate-800/40' : ''}`}
            >
              <span className="text-xl w-7 text-center">{MEDALS[rank] ?? `#${rank + 1}`}</span>
              <span className="text-xl">{player.avatar}</span>
              <div className="flex-1">
                <div className="text-sm font-semibold" style={{ color }}>
                  {player.displayName}
                  {isMe && <span className="ml-1.5 text-xs text-slate-500">(you)</span>}
                </div>
                <div className="text-xs text-slate-500">{player.foundWordsCount} words found</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-white">{player.score} pts</div>
              </div>
            </div>
          );
        })}
      </div>

      <Button variant="arcade" size="lg" onClick={onPlayAgain} className="w-full">
        🔄 Play Again
      </Button>
    </div>
  );
}
