'use client';

import { ArrowRight, Crown, Laugh, RotateCcw, Trophy } from 'lucide-react';
import React from 'react';

import { Badge, Button } from '@playdeck/ui';

import type { ArchitectAwardResult, ArchitectPlayer } from '../types/bad-architect.types';

export interface ArchitectGameOverModalProps {
  isFinalGameOver: boolean;
  currentRound: number;
  maxRounds: number;
  players: ArchitectPlayer[];
  awards: ArchitectAwardResult | null;
  nextArchitect: ArchitectPlayer | null;
  isHost: boolean;
  onNextRound: () => void;
  onRestart: () => void;
}

export const ArchitectGameOverModal: React.FC<ArchitectGameOverModalProps> = ({
  isFinalGameOver,
  currentRound,
  maxRounds,
  players,
  awards,
  nextArchitect,
  isHost,
  onNextRound,
  onRestart,
}) => {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const champion = sortedPlayers[0];

  const closestWinner = players.find((p) => p.id === awards?.closestMatchPlayerId);
  const funniestWinner = players.find((p) => p.id === awards?.funniestDisasterPlayerId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="flex flex-col gap-6 w-full max-w-2xl bg-[#0c1222] border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Title Header */}
        <div className="text-center">
          {isFinalGameOver ? (
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 bg-amber-500/20 rounded-2xl border border-amber-500/40 text-amber-400">
                <Crown className="w-8 h-8" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-amber-400 tracking-wide">
                Construction Champion!
              </h2>
              <p className="text-sm text-slate-300">
                Tournament complete!{' '}
                <strong className="text-amber-300">{champion?.displayName}</strong> wins the master
                architect badge!
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Badge className="bg-sky-950 text-sky-300 border-sky-800 text-xs px-3 py-1">
                Round {currentRound} of {maxRounds} Complete
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-black text-amber-400">
                Round Awards & Leaderboard
              </h2>
            </div>
          )}
        </div>

        {/* Round Awards Ribbon */}
        {awards && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Closest Match */}
            <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-400">
                <Trophy className="w-6 h-6" />
              </div>
              <div className="truncate">
                <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                  Closest Match (+300 pts)
                </div>
                <div className="font-extrabold text-sm text-white truncate flex items-center gap-1.5 mt-0.5">
                  <span>{closestWinner?.avatar ?? '🏆'}</span>
                  <span>{closestWinner?.displayName ?? 'Nobody'}</span>
                </div>
              </div>
            </div>

            {/* Funniest Disaster */}
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-rose-500/20 text-rose-400">
                <Laugh className="w-6 h-6" />
              </div>
              <div className="truncate">
                <div className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-bold">
                  Funniest Disaster (+200 pts)
                </div>
                <div className="font-extrabold text-sm text-white truncate flex items-center gap-1.5 mt-0.5">
                  <span>{funniestWinner?.avatar ?? '🤡'}</span>
                  <span>{funniestWinner?.displayName ?? 'Nobody'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scoreboard */}
        <div className="flex flex-col gap-2 bg-[#121929] p-4 rounded-2xl border border-slate-800 max-h-56 overflow-y-auto">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Standings
          </span>
          {sortedPlayers.map((player, rank) => (
            <div
              key={player.id}
              className={`flex items-center justify-between p-2.5 rounded-xl border text-sm ${
                rank === 0
                  ? 'bg-amber-950/30 border-amber-500/40 text-amber-200 font-bold'
                  : 'bg-[#182238] border-slate-800/80 text-slate-300'
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

        {/* Next Architect Teaser (if not game over) */}
        {!isFinalGameOver && nextArchitect && (
          <div className="text-center p-3 rounded-xl bg-sky-950/40 border border-sky-800/40 text-xs text-slate-300">
            Next Lead Architect:{' '}
            <strong className="text-sky-400">
              {nextArchitect.avatar} {nextArchitect.displayName}
            </strong>
          </div>
        )}

        {/* Actions */}
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
              className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold flex items-center gap-2 px-5"
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
