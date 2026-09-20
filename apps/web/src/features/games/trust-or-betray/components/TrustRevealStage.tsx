'use client';

import React from 'react';

import type { RoundResult, TrustPlayer } from '../types/trust-or-betray.types';

export interface TrustRevealStageProps {
  roundResult?: RoundResult;
  players: TrustPlayer[];
  timeRemaining: number;
}

export function TrustRevealStage({
  roundResult,
  players,
  timeRemaining: _timeRemaining,
}: TrustRevealStageProps) {
  if (!roundResult) return null;

  const outcome = roundResult.outcome;

  let outcomeTitle = '✦ UNANIMOUS TRUST';
  let outcomeDesc = 'All active operatives cooperated! Pot distributed evenly with streak bonus.';
  let outcomeColor = 'text-emerald-400 border-emerald-500/40 bg-emerald-950/30';

  if (outcome === 'solo_betray') {
    outcomeTitle = '⚠️ LONE SABOTAGE HEIST';
    outcomeDesc = 'A solitary betrayer plundered the entire group reward pool + 50 PT solo bonus!';
    outcomeColor = 'text-rose-400 border-rose-500/40 bg-rose-950/30';
  } else if (outcome === 'failed_betray') {
    outcomeTitle = '💥 SABOTAGE COLLISION';
    outcomeDesc =
      'Multiple operatives attempted betrayal! The mission imploded and all points were lost.';
    outcomeColor = 'text-amber-400 border-amber-500/40 bg-amber-950/30';
  } else if (outcome === 'mutual_ruin') {
    outcomeTitle = '💀 MUTUAL RUIN';
    outcomeDesc = 'Complete breakdown of order. Every active operative chose betrayal!';
    outcomeColor = 'text-purple-400 border-purple-500/40 bg-purple-950/30';
  }

  return (
    <div className="w-full flex flex-col gap-6 animate-fadeIn">
      {/* Outcome Banner */}
      <div
        className={`p-5 rounded-2xl border text-center ${outcomeColor} shadow-xl backdrop-blur-md`}
      >
        <div className="text-xs uppercase font-mono tracking-widest font-black opacity-80">
          Mission Outcome
        </div>
        <h2 className="text-2xl font-black mt-1 tracking-tight">{outcomeTitle}</h2>
        <p className="text-xs mt-1 max-w-xl mx-auto opacity-90">{outcomeDesc}</p>
      </div>

      {/* Operatives Reveal Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {players.map((p) => {
          const choice = roundResult.choices[p.id];
          const delta = roundResult.scoreDeltas[p.id] ?? 0;
          const isCoop = choice === 'cooperate';

          return (
            <div
              key={p.id}
              className={`p-4 rounded-2xl border flex flex-col justify-between gap-4 transition-all duration-300 ${
                p.isExiled
                  ? 'bg-slate-900/40 border-slate-800 opacity-60'
                  : isCoop
                    ? 'bg-slate-900/90 border-emerald-500/40 shadow-lg shadow-emerald-950/20'
                    : 'bg-slate-900/90 border-rose-500/40 shadow-lg shadow-rose-950/20'
              }`}
            >
              {/* Top: Avatar & Name */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl border border-slate-700/60"
                  style={{ backgroundColor: `${p.color}20` }}
                >
                  {p.avatar}
                </div>
                <div className="overflow-hidden">
                  <div className="text-sm font-bold text-slate-100 truncate">{p.name}</div>
                  <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
                    <span>Score: {p.score}</span>
                    {p.isExiled && (
                      <span className="text-rose-400 font-bold uppercase">(Exiled)</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Middle: Choice Reveal Card */}
              {p.isExiled ? (
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-500 font-mono">
                  SITTING OUT (EXILED)
                </div>
              ) : (
                <div
                  className={`p-3 rounded-xl border text-center transition-all duration-300 ${
                    isCoop
                      ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300'
                      : 'bg-rose-950/50 border-rose-500/50 text-rose-300'
                  }`}
                >
                  <div className="text-[10px] uppercase font-mono tracking-wider font-bold">
                    Voted
                  </div>
                  <div className="text-base font-black tracking-wider flex items-center justify-center gap-1.5 mt-0.5">
                    <span>{isCoop ? '🤝' : '🗡️'}</span>
                    <span>{isCoop ? 'COOPERATE' : 'BETRAY'}</span>
                  </div>
                  <div className="text-xs font-mono font-black mt-1 text-amber-300">
                    {delta > 0 ? `+${delta} PTS` : '+0 PTS'}
                  </div>
                </div>
              )}

              {/* Bottom: Trust Meter */}
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                  <span className="uppercase">Trust: {p.trustLevel}</span>
                  <span>{p.trustRating}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      p.trustRating >= 60
                        ? 'bg-emerald-500'
                        : p.trustRating >= 40
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                    }`}
                    style={{ width: `${p.trustRating}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
