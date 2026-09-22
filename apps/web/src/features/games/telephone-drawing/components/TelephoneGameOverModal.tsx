'use client';

import { Crown, RotateCcw } from 'lucide-react';
import React from 'react';

import { Badge, Button } from '@playdeck/ui';

import type { TelephonePlayer } from '../types/telephone-drawing.types';

export interface TelephoneGameOverModalProps {
  players: TelephonePlayer[];
  isHost: boolean;
  onPlayAgain: () => void;
  onReturnToLobby: () => void;
}

export const TelephoneGameOverModal: React.FC<TelephoneGameOverModalProps> = ({
  players,
  isHost,
  onPlayAgain,
  onReturnToLobby,
}) => {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const winner = sorted[0];

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto p-6 bg-[#0c1322]/95 border border-amber-900/50 rounded-2xl shadow-2xl text-slate-100">
      {/* Header */}
      <div className="text-center space-y-2 border-b border-amber-900/30 pb-4">
        <div className="inline-flex p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 mb-2">
          <Crown className="w-8 h-8" />
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-amber-400">Chain Concluded!</h2>
        <p className="text-sm text-slate-400">
          The doodles have settled and the comedy champions have been crowned!
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
            <div className="text-xs text-slate-400 font-mono">TOTAL SCORE</div>
            <div className="text-3xl font-black text-amber-300">{winner.score} pts</div>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="space-y-2">
        <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 px-1">
          Final Standings
        </h4>
        <div className="space-y-1.5">
          {sorted.map((p, idx) => (
            <div
              key={p.id}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-sm"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-slate-500 w-5">#{idx + 1}</span>
                <span className="text-xl">{p.avatar}</span>
                <div>
                  <span className="font-bold text-slate-200">{p.displayName}</span>
                  {p.awardsReceived.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {p.awardsReceived.map((a) => (
                        <span
                          key={a}
                          className="text-[10px] text-amber-300/80 bg-amber-950/40 px-1 rounded border border-amber-900/30"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <span className="font-mono font-bold text-amber-300">{p.score} pts</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-amber-900/30">
        <Button
          variant="outline"
          size="sm"
          onClick={onReturnToLobby}
          className="w-full sm:w-auto border-slate-700 text-slate-300 hover:text-white"
        >
          Return to Lobby
        </Button>

        {isHost ? (
          <Button
            variant="primary"
            size="lg"
            onClick={onPlayAgain}
            className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-8 shadow-lg shadow-amber-500/20"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Play Next Chain
          </Button>
        ) : (
          <span className="text-xs text-slate-400">Waiting for host to start next chain...</span>
        )}
      </div>
    </div>
  );
};
