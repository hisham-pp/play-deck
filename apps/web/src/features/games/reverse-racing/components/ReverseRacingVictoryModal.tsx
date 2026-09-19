'use client';

import { RotateCcw, Trophy } from 'lucide-react';
import React from 'react';
import { Badge, Button, Modal } from '@playdeck/ui';
import type { RaceStandings } from '../types/reverse-racing.types';

interface ReverseRacingVictoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  standings: RaceStandings[];
  localPlayerId: string;
  onRestart: () => void;
  onExit: () => void;
}

export function ReverseRacingVictoryModal({
  isOpen,
  onClose,
  standings,
  localPlayerId,
  onRestart,
  onExit,
}: ReverseRacingVictoryModalProps) {
  if (!isOpen) return null;

  const winner = standings[0];
  const isLocalWinner = winner?.player.id === localPlayerId;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isLocalWinner ? '🏁 VICTORY! FIRST PLACE!' : '🏁 RACE COMPLETE'}
      size="lg"
    >
      <div className="space-y-5">
        {/* Banner */}
        <div className="flex flex-col items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-center">
          <Trophy className="mb-2 h-12 w-12 text-amber-400" />
          <h2 className="text-xl font-extrabold tracking-tight text-deck-100">
            {winner ? `${winner.player.name} Won the Grand Prix!` : 'Race Finished'}
          </h2>
          <p className="mt-1 text-xs text-deck-300">
            {isLocalWinner
              ? 'Flawless driving and ruthless sabotage secured your championship!'
              : 'Study your opponent tracks and retaliate in the next heat.'}
          </p>
        </div>

        {/* Standings Table */}
        <div className="overflow-hidden rounded-lg border border-deck-border bg-deck-900">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-deck-border bg-deck-800/80 text-xs uppercase text-deck-400">
              <tr>
                <th className="px-3 py-2.5">Rank</th>
                <th className="px-3 py-2.5">Racer</th>
                <th className="px-3 py-2.5">Time</th>
                <th className="px-3 py-2.5">Crashes</th>
                <th className="px-3 py-2.5">Sabotage Pts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-deck-border/60 font-mono text-xs">
              {standings.map((s) => {
                const isLocal = s.player.id === localPlayerId;
                const timeSec = (s.finishTimeMs / 1000).toFixed(2);

                return (
                  <tr
                    key={s.player.id}
                    className={`transition-colors ${
                      isLocal ? 'bg-amber-500/10 font-bold' : 'hover:bg-deck-800/40'
                    }`}
                  >
                    <td className="px-3 py-2.5">
                      {s.rank === 1 ? (
                        <span className="text-amber-400">🥇 1st</span>
                      ) : s.rank === 2 ? (
                        <span className="text-slate-300">🥈 2nd</span>
                      ) : s.rank === 3 ? (
                        <span className="text-amber-600">🥉 3rd</span>
                      ) : (
                        <span className="text-deck-400">{s.rank}th</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 font-sans">
                      <div className="flex items-center gap-2">
                        <span
                          className="flex h-5 w-5 items-center justify-center rounded-full text-xs"
                          style={{ backgroundColor: s.player.color }}
                        >
                          {s.player.avatar || '🏎️'}
                        </span>
                        <span className={isLocal ? 'text-amber-400' : 'text-deck-200'}>
                          {s.player.name}
                        </span>
                        {isLocal && (
                          <Badge variant="outline" size="sm">
                            YOU
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-deck-200">{timeSec}s</td>
                    <td className="px-3 py-2.5 text-rose-400">{s.crashesSuffered}</td>
                    <td className="px-3 py-2.5 text-amber-400">+{s.sabotageScore}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onExit}>
            Leave to Lobby
          </Button>
          <Button
            variant="primary"
            onClick={onRestart}
            className="bg-amber-500 font-bold text-deck-950 hover:bg-amber-400"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Race Again
          </Button>
        </div>
      </div>
    </Modal>
  );
}
