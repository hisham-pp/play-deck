'use client';

import React from 'react';
import type { LootDashArenaState } from '../types/loot-dash.types';

interface LootDashVictoryModalProps {
  arenaState: LootDashArenaState;
  localPlayerId: string;
  onRematch: () => void;
  onReturnToLobby: () => void;
}

export function LootDashVictoryModal({
  arenaState,
  localPlayerId,
  onRematch,
  onReturnToLobby,
}: LootDashVictoryModalProps) {
  const isWinner = arenaState.winnerId === localPlayerId;
  const statsList = Object.values(arenaState.stats).sort((a, b) => b.score - a.score);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl flex flex-col gap-5 text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="text-center">
          <span className="text-4xl mb-2 block">{isWinner ? '👑' : '💨'}</span>
          <h2
            className={`text-2xl font-black tracking-wide ${
              isWinner ? 'text-amber-400' : 'text-slate-200'
            }`}
          >
            {isWinner ? 'ARENA CHAMPION!' : 'ROUND CONCLUDED!'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isWinner
              ? 'Speed, cunning, and glorious riches! You claimed top prize in the dash.'
              : `Winner: ${arenaState.winnerName ?? 'Another Sprinter'}`}
          </p>
        </div>

        {/* Scoreboard */}
        <div className="flex flex-col gap-2 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            FINAL SCOREBOARD
          </span>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 text-[10px] uppercase">
                  <th className="py-1.5 px-2">Runner</th>
                  <th className="py-1.5 px-2 text-center">Loot</th>
                  <th className="py-1.5 px-2 text-center">Traps</th>
                  <th className="py-1.5 px-2 text-center">Steals</th>
                  <th className="py-1.5 px-2 text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {statsList.map((st, idx) => {
                  const isLocal = st.playerId === localPlayerId;
                  return (
                    <tr
                      key={st.playerId}
                      className={
                        isLocal ? 'bg-amber-500/10 font-bold text-amber-300' : 'text-slate-300'
                      }
                    >
                      <td className="py-2 px-2 flex items-center gap-1.5">
                        <span>{idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '•'}</span>
                        <span>{st.playerName}</span>
                      </td>
                      <td className="py-2 px-2 text-center font-mono">{st.lootCollected}</td>
                      <td className="py-2 px-2 text-center font-mono">{st.trapsTriggered}</td>
                      <td className="py-2 px-2 text-center font-mono">{st.stealsCount}</td>
                      <td className="py-2 px-2 text-right font-mono font-bold">{st.score}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onReturnToLobby}
            className="flex-1 py-3 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all cursor-pointer"
          >
            Return to Lobby
          </button>
          <button
            type="button"
            onClick={onRematch}
            className="flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider bg-linear-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-lg shadow-amber-500/20 border border-amber-300/40 transition-all cursor-pointer"
          >
            Run Again
          </button>
        </div>
      </div>
    </div>
  );
}
