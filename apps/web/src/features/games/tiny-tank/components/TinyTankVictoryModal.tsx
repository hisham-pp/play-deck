'use client';

import React from 'react';
import type { TinyTankArenaState } from '../types/tiny-tank.types';

interface TinyTankVictoryModalProps {
  arenaState: TinyTankArenaState;
  localPlayerId: string;
  onRematch: () => void;
  onReturnToLobby: () => void;
}

export function TinyTankVictoryModal({
  arenaState,
  localPlayerId,
  onRematch,
  onReturnToLobby,
}: TinyTankVictoryModalProps) {
  const isWinner = arenaState.winnerId === localPlayerId;
  const statsList = Object.values(arenaState.stats).sort((a, b) => b.score - a.score);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl flex flex-col gap-5 text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="text-center">
          <span className="text-4xl mb-2 block">{isWinner ? '🏆' : '💥'}</span>
          <h2
            className={`text-2xl font-black tracking-wide ${
              isWinner ? 'text-amber-400' : 'text-red-400'
            }`}
          >
            {isWinner ? 'VICTORY IN THE ARENA!' : 'TACTICAL DEFEAT!'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isWinner
              ? 'Outstanding marksmanship, Commander! You are the last tank standing.'
              : `Combat concluded. Winner: ${arenaState.winnerName ?? 'Enemy Squadron'}`}
          </p>
        </div>

        {/* Scoreboard */}
        <div className="flex flex-col gap-2 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            AFTER-ACTION REPORT
          </span>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 text-[10px] uppercase">
                  <th className="py-1.5 px-2">Commander</th>
                  <th className="py-1.5 px-2 text-center">Kills</th>
                  <th className="py-1.5 px-2 text-center">Damage</th>
                  <th className="py-1.5 px-2 text-center">Accuracy</th>
                  <th className="py-1.5 px-2 text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {statsList.map((st) => {
                  const accuracy =
                    st.shotsFired > 0 ? Math.round((st.shotsHit / st.shotsFired) * 100) : 0;
                  const isLocal = st.playerId === localPlayerId;

                  return (
                    <tr
                      key={st.playerId}
                      className={
                        isLocal ? 'bg-amber-500/10 font-bold text-amber-300' : 'text-slate-300'
                      }
                    >
                      <td className="py-2 px-2 flex items-center gap-1.5">
                        <span>{st.playerId === arenaState.winnerId ? '👑' : '•'}</span>
                        <span>{st.playerName}</span>
                      </td>
                      <td className="py-2 px-2 text-center font-mono">{st.kills}</td>
                      <td className="py-2 px-2 text-center font-mono">{st.damageDealt}</td>
                      <td className="py-2 px-2 text-center font-mono">{accuracy}%</td>
                      <td className="py-2 px-2 text-right font-mono font-bold">{st.score}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onReturnToLobby}
            className="flex-1 py-3 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
          >
            Return to Lobby
          </button>
          <button
            type="button"
            onClick={onRematch}
            className="flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-lg shadow-amber-500/20 border border-amber-300/40 transition-all"
          >
            Deploy Rematch
          </button>
        </div>
      </div>
    </div>
  );
}
