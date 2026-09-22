'use client';

import React from 'react';

import type { SaboteurPlayer } from '../types/secret-saboteur.types';

export interface SaboteurGameOverModalProps {
  winner: 'crew' | 'saboteur' | null;
  winReason: string;
  players: SaboteurPlayer[];
  localPlayerId: string;
  reactorProgress: number;
  meltdownStrikes: number;
  onPlayAgain: () => void;
  onReturnLobby: () => void;
}

export function SaboteurGameOverModal({
  winner,
  winReason,
  players,
  localPlayerId,
  reactorProgress,
  meltdownStrikes,
  onPlayAgain,
  onReturnLobby,
}: SaboteurGameOverModalProps) {
  const localPlayer = players.find((p) => p.id === localPlayerId);
  const saboteur = players.find((p) => p.role === 'saboteur');
  const crewWon = winner === 'crew';

  const localIsWinner =
    (crewWon && localPlayer?.role !== 'saboteur') || (!crewWon && localPlayer?.role === 'saboteur');

  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 w-full">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        {/* Banner */}
        <div
          className="p-8 text-center"
          style={{ background: crewWon ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)' }}
        >
          <div className="text-5xl mb-2">{crewWon ? '⚛️' : '☢️'}</div>
          <h2 className="text-2xl font-black text-slate-100 tracking-tight mb-1">
            {crewWon ? 'REACTOR SECURED' : 'MELTDOWN TRIGGERED'}
          </h2>
          <p className="text-sm text-slate-400 mb-3">{winReason}</p>
          <div
            className="text-lg font-black"
            style={{ color: localIsWinner ? '#10b981' : '#ef4444' }}
          >
            {localIsWinner ? '🏆 VICTORY' : '💀 DEFEAT'}
          </div>
        </div>

        <div className="p-6 flex flex-col gap-5">
          {/* Saboteur confession */}
          {saboteur && (
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 text-sm">
              <div className="text-xs text-slate-500 font-mono uppercase mb-2">
                ☢️ The Saboteur was
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{saboteur.avatar}</span>
                <span className="font-bold text-slate-100">{saboteur.name}</span>
                {saboteur.isDetained && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-red-950/50 text-red-400 border border-red-500/30">
                    🔒 Detained
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-950/60 rounded-xl p-3 text-center border border-slate-800">
              <div className="text-xl font-black text-amber-400">{reactorProgress}%</div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">Reactor</div>
            </div>
            <div className="bg-slate-950/60 rounded-xl p-3 text-center border border-slate-800">
              <div className="text-xl font-black text-red-400">{meltdownStrikes}/3</div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">Meltdowns</div>
            </div>
            <div className="bg-slate-950/60 rounded-xl p-3 text-center border border-slate-800">
              <div className="text-xl font-black text-slate-300">
                {players.filter((p) => p.isDetained).length}
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">Detained</div>
            </div>
          </div>

          {/* Operatives breakdown */}
          <div className="flex flex-col gap-1.5">
            {players.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-2 text-xs px-3 py-2 rounded-xl bg-slate-950/40 border border-slate-800/60"
              >
                <span>{p.avatar}</span>
                <span className="text-slate-300 flex-1">{p.name}</span>
                <span
                  className="font-bold uppercase text-[10px]"
                  style={{
                    color:
                      p.role === 'saboteur'
                        ? '#ef4444'
                        : p.role === 'inspector'
                          ? '#f59e0b'
                          : '#06b6d4',
                  }}
                >
                  {p.role}
                </span>
                {p.isDetained && <span>🔒</span>}
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              id="play-again-btn"
              onClick={onPlayAgain}
              className="flex-1 py-3 rounded-xl font-bold text-sm bg-amber-500 hover:bg-amber-400 text-slate-900 transition-all shadow-lg shadow-amber-500/20"
            >
              ⚡ Play Again
            </button>
            <button
              id="return-lobby-btn"
              onClick={onReturnLobby}
              className="flex-1 py-3 rounded-xl font-semibold text-sm border border-slate-700 text-slate-400 hover:bg-slate-800 transition-all"
            >
              Lobby
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
