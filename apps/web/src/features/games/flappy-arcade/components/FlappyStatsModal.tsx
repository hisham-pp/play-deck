'use client';

import { Award, RotateCcw, Trophy, X } from 'lucide-react';
import React, { useState } from 'react';
import type { FlappyStats } from '../engine/flappy-types';
import { flappyStatsRepository } from '../services/flappy-stats-repository';

interface FlappyStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: FlappyStats;
  onStatsReset: () => void;
}

export function FlappyStatsModal({ isOpen, onClose, stats, onStatsReset }: FlappyStatsModalProps) {
  const [confirmReset, setConfirmReset] = useState(false);

  if (!isOpen) return null;

  const handleReset = async () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    await flappyStatsRepository.resetStats();
    onStatsReset();
    setConfirmReset(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative flex flex-col w-full max-w-sm p-6 bg-[#111827] border border-deck-border/80 rounded-2xl shadow-2xl">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-deck-400 hover:text-white rounded-lg hover:bg-deck-700/50 transition-colors"
          aria-label="Close stats modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-bold text-white uppercase tracking-tight font-display">
            Flight Records
          </h3>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="flex flex-col p-3 bg-[#090d16] border border-deck-border/70 rounded-xl">
            <span className="text-[10px] uppercase font-semibold text-deck-400">All-Time Best</span>
            <span className="text-2xl font-black text-amber-400 font-mono">{stats.bestScore}</span>
          </div>

          <div className="flex flex-col p-3 bg-[#090d16] border border-deck-border/70 rounded-xl">
            <span className="text-[10px] uppercase font-semibold text-deck-400">Flights Taken</span>
            <span className="text-2xl font-black text-gray-200 font-mono">{stats.gamesPlayed}</span>
          </div>

          <div className="flex flex-col p-3 bg-[#090d16] border border-deck-border/70 rounded-xl">
            <span className="text-[10px] uppercase font-semibold text-deck-400">
              Conduits Cleared
            </span>
            <span className="text-2xl font-black text-cyan-400 font-mono">
              {stats.pipesCleared}
            </span>
          </div>

          <div className="flex flex-col p-3 bg-[#090d16] border border-deck-border/70 rounded-xl">
            <span className="text-[10px] uppercase font-semibold text-deck-400">Average Score</span>
            <span className="text-2xl font-black text-purple-400 font-mono">
              {stats.gamesPlayed > 0 ? (stats.totalScore / stats.gamesPlayed).toFixed(1) : '0'}
            </span>
          </div>
        </div>

        {/* Medals Checklist */}
        <div className="flex flex-col gap-2 p-3 mb-5 bg-[#090d16] border border-deck-border/70 rounded-xl">
          <span className="text-[10px] uppercase font-semibold text-deck-400 mb-1">
            Honor Medals
          </span>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Award
                className={`w-4 h-4 ${stats.bestScore >= 10 ? 'text-amber-600' : 'text-gray-600'}`}
              />
              <span className={stats.bestScore >= 10 ? 'text-gray-200' : 'text-gray-500'}>
                Bronze Wing (10+)
              </span>
            </div>
            <span
              className={`text-[10px] font-mono font-bold ${stats.bestScore >= 10 ? 'text-amber-500' : 'text-gray-600'}`}
            >
              {stats.bestScore >= 10 ? 'CLEARED' : 'LOCKED'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Award
                className={`w-4 h-4 ${stats.bestScore >= 25 ? 'text-slate-300' : 'text-gray-600'}`}
              />
              <span className={stats.bestScore >= 25 ? 'text-gray-200' : 'text-gray-500'}>
                Silver Pilot (25+)
              </span>
            </div>
            <span
              className={`text-[10px] font-mono font-bold ${stats.bestScore >= 25 ? 'text-slate-300' : 'text-gray-600'}`}
            >
              {stats.bestScore >= 25 ? 'CLEARED' : 'LOCKED'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Award
                className={`w-4 h-4 ${stats.bestScore >= 50 ? 'text-yellow-400' : 'text-gray-600'}`}
              />
              <span className={stats.bestScore >= 50 ? 'text-gray-200' : 'text-gray-500'}>
                Gold Ace (50+)
              </span>
            </div>
            <span
              className={`text-[10px] font-mono font-bold ${stats.bestScore >= 50 ? 'text-yellow-400' : 'text-gray-600'}`}
            >
              {stats.bestScore >= 50 ? 'CLEARED' : 'LOCKED'}
            </span>
          </div>
        </div>

        {/* Reset Action */}
        <div className="flex items-center justify-between pt-2 border-t border-deck-border/60">
          <button
            type="button"
            onClick={handleReset}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 ${
              confirmReset
                ? 'bg-red-500/20 text-red-400 border-red-500/40 hover:bg-red-500/30'
                : 'text-deck-400 border-deck-border/60 hover:text-deck-200'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{confirmReset ? 'Click again to confirm' : 'Reset Stats'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-deck-700 hover:bg-deck-600 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
