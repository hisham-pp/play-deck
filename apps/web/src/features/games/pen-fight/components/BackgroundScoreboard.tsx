'use client';

import { Html } from '@react-three/drei';
import React from 'react';
import { TABLE_DEPTH } from '../engine/pen-fight-constants';
import type { PenFightState } from '../types/pen-fight.types';

interface BackgroundScoreboardProps {
  state: PenFightState;
}

export function BackgroundScoreboard({ state }: BackgroundScoreboardProps) {
  const p1 = state.players.p1;
  const p2 = state.players.p2;

  // Position board behind the table surface
  const boardZ = -TABLE_DEPTH / 2 - 0.7;
  const boardY = 1.35;

  return (
    <group position={[0, boardY, boardZ]}>
      {/* 3D Scoreboard Frame Backing */}
      <mesh receiveShadow position={[0, 0, -0.05]}>
        <boxGeometry args={[3.2, 1.4, 0.08]} />
        <meshStandardMaterial color="#111625" roughness={0.6} metalness={0.2} />
      </mesh>

      {/* Outer Glow / Trim Border */}
      <mesh position={[0, 0, -0.01]}>
        <boxGeometry args={[3.28, 1.48, 0.02]} />
        <meshStandardMaterial color="#3b82f6" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Scoreboard HTML Overlay placed in 3D */}
      <Html
        transform
        distanceFactor={2.4}
        position={[0, 0, 0.01]}
        className="pointer-events-none select-none"
      >
        <div className="flex w-[620px] flex-col items-center justify-between rounded-xl border border-amber-500/30 bg-[#090d16]/95 p-5 shadow-2xl backdrop-blur-md">
          {/* Header */}
          <div className="flex w-full items-center justify-between border-b border-amber-500/20 pb-2">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-amber-400">
                PEN FIGHT ARENA
              </span>
            </div>
            <div className="rounded bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-amber-300">
              ROUND {state.round} / {state.maxRounds}
            </div>
          </div>

          {/* Scores Row */}
          <div className="mt-3 flex w-full items-center justify-between px-2">
            {/* Player 1 */}
            <div
              className={`flex flex-col items-center gap-1 rounded-lg p-3 transition-all ${
                state.activePlayer === 'p1' && state.phase === 'aiming'
                  ? 'ring-2 ring-blue-500 bg-blue-500/10 scale-105'
                  : 'bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full border border-white/20 shadow-sm"
                  style={{ backgroundColor: p1.color }}
                />
                <span className="max-w-[130px] truncate text-sm font-bold text-slate-100">
                  {p1.displayName}
                </span>
              </div>
              <span className="font-mono text-4xl font-extrabold text-blue-400">
                {p1.roundWins}
              </span>
              {state.activePlayer === 'p1' && state.phase === 'aiming' && (
                <span className="animate-bounce font-mono text-[9px] font-bold text-blue-300 uppercase">
                  YOUR TURN
                </span>
              )}
            </div>

            {/* VS Divider */}
            <div className="flex flex-col items-center gap-1 px-4">
              <span className="font-mono text-xs font-black text-amber-500/80">VS</span>
              <div className="h-8 w-px bg-gradient-to-b from-transparent via-amber-500/40 to-transparent" />
            </div>

            {/* Player 2 */}
            <div
              className={`flex flex-col items-center gap-1 rounded-lg p-3 transition-all ${
                state.activePlayer === 'p2' && state.phase === 'aiming'
                  ? 'ring-2 ring-red-500 bg-red-500/10 scale-105'
                  : 'bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full border border-white/20 shadow-sm"
                  style={{ backgroundColor: p2.color }}
                />
                <span className="max-w-[130px] truncate text-sm font-bold text-slate-100">
                  {p2.displayName} {p2.isAI ? '(AI)' : ''}
                </span>
              </div>
              <span className="font-mono text-4xl font-extrabold text-red-400">{p2.roundWins}</span>
              {state.activePlayer === 'p2' && state.phase === 'aiming' && (
                <span className="animate-bounce font-mono text-[9px] font-bold text-red-300 uppercase">
                  ACTIVE
                </span>
              )}
            </div>
          </div>

          {/* Status footer */}
          <div className="mt-2 text-center font-mono text-[10px] uppercase text-slate-400">
            {state.phase === 'aiming' && `TURN: ${state.players[state.activePlayer].displayName}`}
            {state.phase === 'flicking' && '⚡ FLICK RELEASED'}
            {state.phase === 'settling' && '⏳ SETTLING PENS...'}
            {state.phase === 'round-over' && '🏆 ROUND COMPLETED'}
            {state.phase === 'match-over' && '🎉 MATCH COMPLETE'}
          </div>
        </div>
      </Html>
    </group>
  );
}
