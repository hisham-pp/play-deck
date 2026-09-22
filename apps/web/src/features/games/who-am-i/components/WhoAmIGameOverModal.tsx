'use client';

import { Crown, RotateCcw } from 'lucide-react';
import React from 'react';

import { Badge, Button } from '@playdeck/ui';

import type { WhoAmIPlayer } from '../types/who-am-i.types';

export interface WhoAmIGameOverModalProps {
  players: WhoAmIPlayer[];
  isHost: boolean;
  onPlayAgain: () => void;
  onReturnToLobby: () => void;
}

export const WhoAmIGameOverModal: React.FC<WhoAmIGameOverModalProps> = ({
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
        <h2 className="text-3xl sm:text-4xl font-black text-amber-400">Case Closed!</h2>
        <p className="text-sm text-slate-400">
          All mystery headbands have been revealed and the deductions are finalized!
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
              <div className="text-xs text-amber-300/80 mt-0.5">
                Was: <strong>{winner.identity.name}</strong> ({winner.identity.icon})
              </div>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {winner.awardsReceived.map((award) => (
                  <Badge key={award} variant="warning" className="text-[10px] py-0 px-1.5">
                    {award}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-400 font-mono">FINAL SCORE</div>
            <div className="text-3xl font-black text-amber-300">{winner.score} pts</div>
          </div>
        </div>
      )}

      {/* Full Leaderboard */}
      <div className="space-y-2">
        <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 px-1">
          Final Standings & Revealed Identities
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
                  <div className="font-bold text-slate-200 flex items-center gap-1.5">
                    <span>{p.displayName}</span>
                    <span className="text-xs font-normal text-amber-300/80">
                      ({p.identity.icon} {p.identity.name})
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">
                    Questions: {p.questionsAsked} | {p.isSolved ? 'Solved' : 'Unsolved'}
                  </div>
                </div>
              </div>

              <span className="font-mono font-bold text-amber-300">{p.score} pts</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
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
            Play Next Round
          </Button>
        ) : (
          <span className="text-xs text-slate-400">Waiting for host to start next round...</span>
        )}
      </div>
    </div>
  );
};
