'use client';

import { ArrowRight, Crown, RotateCcw } from 'lucide-react';
import React from 'react';

import { Badge, Button } from '@playdeck/ui';

import type { GuessTheLieRoundResult, LiePlayer } from '../types/guess-the-lie.types';

export interface LieGameOverModalProps {
  isFinalGameOver: boolean;
  currentRound: number;
  maxRounds: number;
  players: LiePlayer[];
  roundResult: GuessTheLieRoundResult | null;
  isHost: boolean;
  onNextRound: () => void;
  onRestart: () => void;
}

export const LieGameOverModal: React.FC<LieGameOverModalProps> = ({
  isFinalGameOver,
  currentRound,
  maxRounds,
  players,
  roundResult,
  isHost,
  onNextRound,
  onRestart,
}) => {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const champion = sortedPlayers[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
      <div className="flex flex-col gap-6 w-full max-w-2xl bg-[#0b1220] border border-indigo-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Title Header */}
        <div className="text-center">
          {isFinalGameOver ? (
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 bg-amber-500/20 rounded-2xl border border-amber-500/40 text-amber-400">
                <Crown className="w-8 h-8" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-amber-400 tracking-wide">
                Investigation Champion!
              </h2>
              <p className="text-sm text-slate-300">
                Match concluded! <strong className="text-amber-300">{champion?.displayName}</strong>{' '}
                wins the Master Detective award!
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Badge className="bg-indigo-950 text-indigo-300 border-indigo-800 text-xs px-3 py-1">
                Round {currentRound} of {maxRounds} Complete
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-black text-indigo-300">
                Round Points & Standings
              </h2>
            </div>
          )}
        </div>

        {/* Round Points Gained Badge Summary */}
        {roundResult && (
          <div className="p-4 rounded-2xl bg-[#121a2d] border border-slate-800">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-2">
              Points Earned This Round
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {players.map((p) => {
                const gained = roundResult.playerPointsEarned[p.id] ?? 0;
                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-[#162038] border border-slate-800/80 text-xs"
                  >
                    <span className="truncate max-w-[90px]">{p.displayName}</span>
                    <span
                      className={`font-mono font-bold ${gained > 0 ? 'text-emerald-400' : 'text-slate-500'}`}
                    >
                      +{gained}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div className="flex flex-col gap-2 bg-[#121a2d] p-4 rounded-2xl border border-slate-800 max-h-56 overflow-y-auto">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Overall Standings
          </span>
          {sortedPlayers.map((player, rank) => (
            <div
              key={player.id}
              className={`flex items-center justify-between p-2.5 rounded-xl border text-sm ${
                rank === 0
                  ? 'bg-amber-950/30 border-amber-500/40 text-amber-200 font-bold'
                  : 'bg-[#18233c] border-slate-800/80 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs w-4 text-slate-400">#{rank + 1}</span>
                <span className="text-lg">{player.avatar}</span>
                <span>{player.displayName}</span>
              </div>
              <span className="font-mono font-bold">{player.score} pts</span>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
          <Button
            variant="outline"
            onClick={onRestart}
            className="border-slate-700 text-slate-300 hover:bg-slate-800 flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Return to Lobby</span>
          </Button>

          {!isFinalGameOver && isHost && (
            <Button
              onClick={onNextRound}
              className="bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-bold flex items-center gap-2 px-5"
            >
              <span>Next Round</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
