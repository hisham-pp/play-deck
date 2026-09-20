'use client';

import { ArrowRight, Crown, RotateCcw } from 'lucide-react';
import React from 'react';

import { Badge, Button } from '@playdeck/ui';

import type { WrongAnswersPlayer } from '../types/wrong-answers.types';

export interface WrongAnswersGameOverModalProps {
  players: WrongAnswersPlayer[];
  isHost: boolean;
  onPlayAgain: () => void;
  onReturnToLobby: () => void;
}

export const WrongAnswersGameOverModal: React.FC<WrongAnswersGameOverModalProps> = ({
  players,
  isHost,
  onPlayAgain,
  onReturnToLobby,
}) => {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const winner = sorted[0];

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto p-6 bg-[#0c1322]/95 border border-amber-900/50 rounded-2xl shadow-2xl text-slate-100">
      <div className="text-center space-y-2 border-b border-amber-900/30 pb-4">
        <div className="inline-flex p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 mb-2">
          <Crown className="w-8 h-8" />
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-amber-400">Show Concluded!</h2>
        <p className="text-sm text-slate-400">
          The crowds have voted and the comedy master has been crowned!
        </p>
      </div>

      {/* Winner Spotlight */}
      {winner && (
        <div className="p-5 rounded-2xl bg-amber-950/40 border border-amber-500/60 shadow-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-4xl p-2 rounded-2xl bg-amber-500/20 border border-amber-500/40">
              {winner.avatar}
            </span>
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
                Grand Champion
              </span>
              <h3 className="text-2xl font-black text-white">{winner.displayName}</h3>
              <div className="flex flex-wrap gap-1 mt-1">
                {winner.awardsReceived.map((award) => (
                  <Badge key={award} variant="warning" className="text-[10px] py-0 px-1.5">
                    {award}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-3xl font-black text-amber-400 font-mono">{winner.score}</span>
            <span className="text-xs text-slate-400 block">Total Points</span>
          </div>
        </div>
      )}

      {/* Full Leaderboard */}
      <div className="space-y-2">
        <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
          Final Standings
        </h4>

        <div className="space-y-1.5">
          {sorted.map((p, idx) => (
            <div
              key={p.id}
              className="flex items-center justify-between p-3 rounded-xl bg-[#11192d] border border-slate-800"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-slate-400 w-5">#{idx + 1}</span>
                <span className="text-xl">{p.avatar}</span>
                <div>
                  <span className="text-sm font-bold text-slate-200">{p.displayName}</span>
                  {p.awardsReceived.length > 0 && (
                    <div className="flex gap-1 mt-0.5">
                      {p.awardsReceived.map((a) => (
                        <span
                          key={a}
                          className="text-[9px] px-1.5 py-0.2 bg-amber-950/60 border border-amber-800/40 text-amber-400 rounded-md font-mono"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <span className="font-mono font-bold text-sm text-amber-400">{p.score} pts</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-amber-900/30">
        {isHost ? (
          <Button
            onClick={onPlayAgain}
            className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-950"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again</span>
          </Button>
        ) : (
          <p className="flex-1 text-center text-xs text-slate-400 py-2">
            Waiting for host to restart or choose a new game...
          </p>
        )}

        <Button
          onClick={onReturnToLobby}
          variant="outline"
          className="border-slate-700 hover:border-slate-500 py-2.5 rounded-xl flex items-center justify-center gap-2"
        >
          <span>Return to Lobby</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
