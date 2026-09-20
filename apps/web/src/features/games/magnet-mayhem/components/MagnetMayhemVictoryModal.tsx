'use client';

import { Home, RefreshCw, Trophy, Zap } from 'lucide-react';
import React from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@playdeck/ui';
import type { MagnetPlayer } from '../types/magnet-mayhem.types';

export interface MagnetMayhemVictoryModalProps {
  players: MagnetPlayer[];
  localPlayerId: string | null;
  onPlayAgain: () => void;
  onReturnToLobby: () => void;
}

export function MagnetMayhemVictoryModal({
  players,
  localPlayerId,
  onPlayAgain,
  onReturnToLobby,
}: MagnetMayhemVictoryModalProps) {
  // Sort players by score descending
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const winner = sorted[0];
  const isLocalWinner = winner?.id === localPlayerId;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <Card className="w-full max-w-md border-cyan-500/40 bg-[#111827] shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-14 h-14 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center mb-2">
            {isLocalWinner ? (
              <Trophy className="w-7 h-7 text-amber-400" />
            ) : (
              <Zap className="w-7 h-7 text-cyan-400" />
            )}
          </div>
          <CardTitle className="text-2xl font-black text-slate-100">
            {isLocalWinner ? 'MAGNETIC CHAMPION!' : 'MATCH COMPLETED'}
          </CardTitle>
          <p className="text-xs text-slate-400">
            {isLocalWinner
              ? `You dominated the arena with ${winner?.score ?? 0} points!`
              : `${winner?.name || 'A rival'} claimed victory with ${winner?.score ?? 0} points.`}
          </p>
        </CardHeader>

        <CardContent className="space-y-4 pt-2">
          {/* Standings List */}
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {sorted.map((p, idx) => {
              const rank = idx + 1;
              const isMe = p.id === localPlayerId;

              return (
                <div
                  key={p.id}
                  className={`flex items-center justify-between p-2.5 rounded-xl border ${
                    isMe ? 'border-cyan-500/50 bg-cyan-950/20' : 'border-[#232f45] bg-[#1c2438]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs ${
                        rank === 1
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
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-200">
                        {p.name} {isMe && '(You)'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        🎯 {p.targetHitCount} targets · 🧲 {p.slingshotCount} slingshots
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono font-black text-lg text-amber-400">{p.score}</span>
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
              className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold shadow-lg"
            >
              <RefreshCw className="w-4 h-4 mr-1.5" />
              Rematch
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
