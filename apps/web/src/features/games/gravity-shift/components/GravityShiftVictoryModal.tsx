'use client';

import { Home, RefreshCw, Trophy } from 'lucide-react';
import React from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@playdeck/ui';
import type { GravityShiftPlayer } from '../types/gravity-shift.types';

export interface GravityShiftVictoryModalProps {
  players: GravityShiftPlayer[];
  localPlayerId: string | null;
  onPlayAgain: () => void;
  onReturnToLobby: () => void;
}

export function GravityShiftVictoryModal({
  players,
  localPlayerId,
  onPlayAgain,
  onReturnToLobby,
}: GravityShiftVictoryModalProps) {
  const sorted = [...players].sort((a, b) => {
    if (a.rank && b.rank) return a.rank - b.rank;
    if (a.rank) return -1;
    if (b.rank) return 1;
    return b.character.checkpointsPassed - a.character.checkpointsPassed;
  });

  const winner = sorted[0];
  const isLocalWinner = winner?.id === localPlayerId;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <Card className="w-full max-w-md border-amber-500/40 bg-[#111827] shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mb-2">
            <Trophy className="w-6 h-6 text-amber-400" />
          </div>
          <CardTitle className="text-2xl font-black text-slate-100">
            {isLocalWinner ? 'VICTORY!' : 'RACE FINISHED'}
          </CardTitle>
          <p className="text-xs text-slate-400">
            {isLocalWinner
              ? 'You crossed the gravitational singularity in 1st place!'
              : `${winner?.name || 'A racer'} took the checkered vortex!`}
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
                    isMe ? 'border-amber-400/50 bg-amber-950/20' : 'border-[#232f45] bg-[#1c2438]'
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
                    <span className="text-sm font-bold text-slate-200">
                      {p.name} {isMe && '(You)'}
                    </span>
                  </div>

                  <span className="text-xs font-mono text-slate-400">
                    {p.character.finishTimeMs ? 'FINISHED' : `CP ${p.character.checkpointsPassed}`}
                  </span>
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
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-lg shadow-amber-500/20"
            >
              <RefreshCw className="w-4 h-4 mr-1.5" />
              Race Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
