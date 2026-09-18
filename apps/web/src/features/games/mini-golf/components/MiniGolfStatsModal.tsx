import { Award, Flame, RotateCcw, Target, Trophy, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import type { MiniGolfStats } from '../engine/mini-golf-types';
import {
  DEFAULT_MINI_GOLF_STATS,
  miniGolfStatsRepository,
} from '../services/mini-golf-stats-repository';

interface MiniGolfStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MiniGolfStatsModal: React.FC<MiniGolfStatsModalProps> = ({ isOpen, onClose }) => {
  const [stats, setStats] = useState<MiniGolfStats>(DEFAULT_MINI_GOLF_STATS);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    if (isOpen) {
      miniGolfStatsRepository
        .getStats()
        .then(setStats)
        .catch(() => {});
      setConfirmReset(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleReset = async () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    const reset = await miniGolfStatsRepository.resetStats();
    setStats(reset);
    setConfirmReset(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-[#0c1322] border border-[#232f45] shadow-2xl p-6 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1c2438]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Mini Golf Records</h2>
              <p className="text-xs text-slate-400">Player Career Statistics</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1a2336] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 my-5">
          {/* Best Round */}
          <div className="p-3.5 rounded-xl bg-[#111a2e] border border-[#1e2a44] flex flex-col">
            <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold mb-1">
              <Award className="w-3.5 h-3.5" />
              <span>Best 9-Hole</span>
            </div>
            <span className="text-2xl font-black text-white">
              {stats.bestRoundScore > 0 ? `${stats.bestRoundScore} strokes` : '--'}
            </span>
          </div>

          {/* Holes in One */}
          <div className="p-3.5 rounded-xl bg-[#111a2e] border border-[#1e2a44] flex flex-col">
            <div className="flex items-center gap-1.5 text-xs text-amber-300 font-semibold mb-1">
              <Target className="w-3.5 h-3.5" />
              <span>Aces (Holes in 1)</span>
            </div>
            <span className="text-2xl font-black text-amber-300">{stats.holesInOne}</span>
          </div>

          {/* Rounds Completed */}
          <div className="p-3.5 rounded-xl bg-[#111a2e] border border-[#1e2a44] flex flex-col">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-1">
              <Trophy className="w-3.5 h-3.5" />
              <span>Rounds Finished</span>
            </div>
            <span className="text-2xl font-black text-slate-200">{stats.roundsCompleted}</span>
          </div>

          {/* Under-par shots */}
          <div className="p-3.5 rounded-xl bg-[#111a2e] border border-[#1e2a44] flex flex-col">
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold mb-1">
              <Flame className="w-3.5 h-3.5" />
              <span>Eagles & Birdies</span>
            </div>
            <span className="text-2xl font-black text-emerald-400">
              {stats.eagles + stats.birdies}
            </span>
          </div>
        </div>

        {/* Secondary Details */}
        <div className="p-3 rounded-xl bg-[#0f1729] border border-[#1a253c] text-xs text-slate-400 flex justify-between items-center mb-5">
          <span>Total Career Strokes</span>
          <span className="font-mono font-bold text-slate-200">{stats.totalStrokes}</span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[#1c2438]">
          <button
            type="button"
            onClick={handleReset}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              confirmReset
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {confirmReset ? 'Confirm Reset?' : 'Reset Records'}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
