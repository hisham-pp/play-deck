import { ArrowRight, Trophy } from 'lucide-react';
import React from 'react';
import type { MiniGolfState } from '../engine/mini-golf-types';

interface MiniGolfHoleClearModalProps {
  state: MiniGolfState;
  onNextHole: () => void;
  onViewScorecard: () => void;
}

export const MiniGolfHoleClearModal: React.FC<MiniGolfHoleClearModalProps> = ({
  state,
  onNextHole,
  onViewScorecard,
}) => {
  if (state.phase !== 'hole-clear') return null;

  const currentHole = state.holes[state.currentHoleIndex];
  const activePlayer = state.players[state.activePlayerIndex];
  const classification = state.lastScoreClassification || 'par';
  const strokes = state.currentStrokes;
  const par = currentHole?.par ?? 3;
  const isFinalHole = state.currentHoleIndex === state.holes.length - 1;

  const badgeConfig: Record<string, { title: string; color: string; bg: string; border: string }> =
    {
      ace: {
        title: 'HOLE IN ONE!',
        color: 'text-amber-300',
        bg: 'bg-amber-950/70',
        border: 'border-amber-500',
      },
      albatross: {
        title: 'ALBATROSS!',
        color: 'text-emerald-300',
        bg: 'bg-emerald-950/70',
        border: 'border-emerald-500',
      },
      eagle: {
        title: 'EAGLE!',
        color: 'text-emerald-400',
        bg: 'bg-emerald-950/70',
        border: 'border-emerald-500',
      },
      birdie: {
        title: 'BIRDIE!',
        color: 'text-cyan-400',
        bg: 'bg-cyan-950/70',
        border: 'border-cyan-500',
      },
      par: {
        title: 'PAR',
        color: 'text-slate-200',
        bg: 'bg-slate-900/70',
        border: 'border-slate-600',
      },
      bogey: {
        title: 'BOGEY',
        color: 'text-amber-400',
        bg: 'bg-amber-950/50',
        border: 'border-amber-600/60',
      },
      'double-bogey': {
        title: 'DOUBLE BOGEY',
        color: 'text-rose-400',
        bg: 'bg-rose-950/50',
        border: 'border-rose-600/60',
      },
      over: {
        title: 'HOLE COMPLETE',
        color: 'text-rose-400',
        bg: 'bg-rose-950/50',
        border: 'border-rose-600/60',
      },
      limit: {
        title: 'STROKE LIMIT',
        color: 'text-slate-400',
        bg: 'bg-slate-900/80',
        border: 'border-slate-700',
      },
    };

  const badge = badgeConfig[classification] || badgeConfig.par;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm rounded-2xl bg-[#0e1626] border-2 border-[#232f45] shadow-2xl p-6 text-center overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        {/* Classification Banner */}
        <div
          className={`inline-block px-4 py-1.5 rounded-full text-sm font-extrabold tracking-wider border mb-4 ${badge.bg} ${badge.border} ${badge.color}`}
        >
          {badge.title}
        </div>

        <h3 className="text-xl font-bold text-white mb-1">
          Hole {currentHole?.id}: {currentHole?.name}
        </h3>

        {activePlayer && state.players.length > 1 && (
          <p className="text-xs text-slate-400 mb-4">
            Played by <span className="font-semibold text-slate-200">{activePlayer.name}</span>
          </p>
        )}

        {/* Score comparison card */}
        <div className="grid grid-cols-2 gap-3 my-5 p-3.5 rounded-xl bg-[#141e33] border border-[#232f45]">
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
              Course Par
            </span>
            <span className="text-2xl font-extrabold text-slate-200">{par}</span>
          </div>
          <div className="flex flex-col border-l border-slate-700/60">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
              Your Strokes
            </span>
            <span className={`text-2xl font-extrabold ${badge.color}`}>{strokes}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 mt-6">
          <button
            type="button"
            onClick={onNextHole}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:scale-[0.98] transition-all shadow-lg shadow-amber-500/20"
          >
            {isFinalHole ? 'Complete Round' : 'Next Hole'}
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onViewScorecard}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-slate-300 hover:text-white bg-[#1a253c] hover:bg-[#22304e] transition-colors text-sm"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            View Scorecard
          </button>
        </div>
      </div>
    </div>
  );
};
