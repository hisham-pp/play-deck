'use client';

import React, { useEffect, useState } from 'react';

import type { PlayerChoice } from '../types/trust-or-betray.types';

export interface TrustChoicePhaseProps {
  onLockIn: (choice: PlayerChoice) => void;
  hasLockedIn: boolean;
  timeRemaining: number;
}

export function TrustChoicePhase({
  onLockIn,
  hasLockedIn,
  timeRemaining: _timeRemaining,
}: TrustChoicePhaseProps) {
  const [selected, setSelected] = useState<PlayerChoice | null>(null);

  // Keyboard navigation [C] for cooperate, [B] for betray, Enter to confirm
  useEffect(() => {
    if (hasLockedIn) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'c') {
        setSelected('cooperate');
      } else if (key === 'b') {
        setSelected('betray');
      } else if (e.key === 'Enter' && selected) {
        onLockIn(selected);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasLockedIn, onLockIn, selected]);

  if (hasLockedIn) {
    return (
      <div className="w-full bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-8 shadow-2xl backdrop-blur-md flex flex-col items-center justify-center text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-3xl animate-bounce">
          🔒
        </div>
        <div>
          <h3 className="text-xl font-black text-slate-100">Decision Encrypted & Locked In</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md">
            Your choice has been sealed. Standing by while remaining operatives cast their votes...
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>SYNCHRONIZING OPERATIVE BALLOTS</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="text-center">
        <h3 className="text-2xl font-black text-slate-100 tracking-tight">Make Your Secret Move</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-lg mx-auto">
          Every operative chooses simultaneously. Cooperation builds the team pot, but a solo
          betrayal steals it all.
        </p>
      </div>

      {/* Two interactive Choice Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Cooperate Card */}
        <button
          type="button"
          onClick={() => setSelected('cooperate')}
          className={`p-6 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-4 ${
            selected === 'cooperate'
              ? 'bg-emerald-950/40 border-emerald-400 shadow-lg shadow-emerald-950/50 scale-[1.02]'
              : 'bg-slate-900/80 border-slate-800 hover:border-emerald-500/50 hover:bg-slate-850'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🤝</span>
              <div>
                <span className="text-lg font-black text-emerald-400 tracking-tight block">
                  COOPERATE
                </span>
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  Keyboard Shortcut: [C]
                </span>
              </div>
            </div>
            {selected === 'cooperate' && (
              <span className="w-5 h-5 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center text-xs font-black">
                ✓
              </span>
            )}
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Contribute to the mission objective. If everyone cooperates, the entire pot is split
            evenly and the group cooperation streak builds.
          </p>

          <div className="p-2.5 rounded-xl bg-emerald-950/50 border border-emerald-800/40 text-[11px] text-emerald-300 font-mono">
            + Group Split + Streak Multiplier
          </div>
        </button>

        {/* Betray Card */}
        <button
          type="button"
          onClick={() => setSelected('betray')}
          className={`p-6 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-4 ${
            selected === 'betray'
              ? 'bg-rose-950/40 border-rose-400 shadow-lg shadow-rose-950/50 scale-[1.02]'
              : 'bg-slate-900/80 border-slate-800 hover:border-rose-500/50 hover:bg-slate-850'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🗡️</span>
              <div>
                <span className="text-lg font-black text-rose-400 tracking-tight block">
                  BETRAY
                </span>
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  Keyboard Shortcut: [B]
                </span>
              </div>
            </div>
            {selected === 'betray' && (
              <span className="w-5 h-5 rounded-full bg-rose-400 text-slate-950 flex items-center justify-center text-xs font-black">
                ✓
              </span>
            )}
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Sabotage the mission for personal gain. If you are the only saboteur, you steal the
            entire group pot plus a 50 PT solo bonus!
          </p>

          <div className="p-2.5 rounded-xl bg-rose-950/50 border border-rose-800/40 text-[11px] text-rose-300 font-mono">
            ⚠️ High Risk: 2+ betrayers = 0 PTS for everyone!
          </div>
        </button>
      </div>

      {/* Lock in CTA */}
      <div className="flex justify-center">
        <button
          type="button"
          disabled={!selected}
          onClick={() => selected && onLockIn(selected)}
          className={`px-8 py-3.5 rounded-xl font-black text-sm tracking-wider uppercase transition-all duration-200 cursor-pointer shadow-xl ${
            selected
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-950/50 scale-100 hover:scale-105 active:scale-95'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
          }`}
        >
          Lock In Secret Choice {selected ? `(${selected.toUpperCase()})` : ''}
        </button>
      </div>
    </div>
  );
}
