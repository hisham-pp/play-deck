'use client';

import { Flame, Home, RefreshCw, Trophy } from 'lucide-react';
import React from 'react';

import { Button, Card, CardContent, CardHeader, CardTitle } from '@playdeck/ui';

import type { LavaPlayer } from '../types/floor-is-lava.types';

export interface FloorIsLavaVictoryModalProps {
  players: LavaPlayer[];
  localPlayerId: string | null;
  survivalTimeMs: number;
  onPlayAgain: () => void;
  onReturnToLobby: () => void;
}

export function FloorIsLavaVictoryModal({
  players,
  localPlayerId,
  survivalTimeMs,
  onPlayAgain,
  onReturnToLobby,
}: FloorIsLavaVictoryModalProps) {
  // Sort players by eliminationRank (1st, 2nd, etc.)
  const sorted = [...players].sort((a, b) => {
    const rankA = a.eliminationRank ?? (a.isAlive ? 1 : 99);
    const rankB = b.eliminationRank ?? (b.isAlive ? 1 : 99);
    return rankA - rankB;
  });

  const winner = sorted[0];
  const isLocalWinner = winner?.id === localPlayerId;
  const isDraw = !winner || (!winner.isAlive && sorted.every((p) => !p.isAlive));

  const formatTime = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <Card className="w-full max-w-md border-red-500/40 bg-[#111827] shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-14 h-14 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center mb-2">
            {isLocalWinner ? (
              <Trophy className="w-7 h-7 text-amber-400" />
            ) : (
              <Flame className="w-7 h-7 text-red-500" />
            )}
          </div>
          <CardTitle className="text-2xl font-black text-slate-100">
            {isDraw ? 'ALL PLAYERS MELTED' : isLocalWinner ? 'SOLE SURVIVOR!' : 'MATCH OVER'}
          </CardTitle>
          <p className="text-xs text-slate-400">
            {isDraw
              ? 'The arena fully collapsed with no survivors!'
              : isLocalWinner
                ? `You conquered the lava and outlasted all rivals for ${formatTime(survivalTimeMs)}!`
                : `${winner?.name || 'A rival'} survived the molten collapse.`}
          </p>
        </CardHeader>

        <CardContent className="space-y-4 pt-2">
          {/* Standings List */}
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {sorted.map((p, idx) => {
              const rank = p.eliminationRank ?? idx + 1;
              const isMe = p.id === localPlayerId;

              return (
                <div
                  key={p.id}
                  className={`flex items-center justify-between p-2.5 rounded-xl border ${
                    isMe ? 'border-orange-500/50 bg-orange-950/20' : 'border-[#232f45] bg-[#1c2438]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs ${
                        rank === 1 && p.isAlive
                          ? 'bg-amber-400 text-slate-950'
                          : rank === 2
                            ? 'bg-slate-300 text-slate-950'
                            : rank === 3
                              ? 'bg-amber-700 text-white'
                              : 'bg-[#232f45] text-slate-400'
                      }`}
                    >
                      {rank}
                    </span>
                    <span className="text-base">{p.avatar}</span>
                    <span className="text-sm font-bold text-slate-200">
                      {p.name} {isMe && '(You)'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-slate-400 font-mono">
                      {p.isBot ? 'AI Bot' : 'Player'}
                    </span>
                    <span
                      className={`font-semibold ${p.isAlive ? 'text-emerald-400' : 'text-red-400'}`}
                    >
                      {p.isAlive ? 'SURVIVOR' : 'MELTED'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onReturnToLobby}
              className="flex-1 border-[#232f45] text-slate-300 hover:bg-[#1c2438]"
            >
              <Home className="w-4 h-4 mr-1.5" />
              Lobby
            </Button>
            <Button
              onClick={onPlayAgain}
              className="flex-1 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-bold"
            >
              <RefreshCw className="w-4 h-4 mr-1.5" />
              Play Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
