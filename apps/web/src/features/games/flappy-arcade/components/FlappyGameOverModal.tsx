'use client';

import { Award, RotateCcw, Trophy } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect } from 'react';

interface FlappyGameOverModalProps {
  score: number;
  highScore: number;
  onRestart: () => void;
}

export function FlappyGameOverModal({ score, highScore, onRestart }: FlappyGameOverModalProps) {
  const isNewHigh = score >= highScore && score > 0;

  // Spacebar to restart immediately
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        onRestart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onRestart]);

  let medalName: string | null = null;
  let medalColor = '';
  if (score >= 50) {
    medalName = 'Gold Ace';
    medalColor = 'text-yellow-400 border-yellow-500/40 bg-yellow-500/10';
  } else if (score >= 25) {
    medalName = 'Silver Pilot';
    medalColor = 'text-slate-300 border-slate-400/40 bg-slate-400/10';
  } else if (score >= 10) {
    medalName = 'Bronze Wing';
    medalColor = 'text-amber-600 border-amber-600/40 bg-amber-600/10';
  }

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="flex flex-col items-center w-full max-w-xs p-6 text-center bg-[#111827] border border-amber-500/40 rounded-2xl shadow-2xl shadow-amber-500/10">
        <span className="text-xs font-bold uppercase tracking-widest text-amber-500 font-display mb-1">
          Hull Breach Detected
        </span>
        <h2 className="text-2xl font-black text-white tracking-tight uppercase mb-4">
          Flight Terminated
        </h2>

        {/* Score Display Card */}
        <div className="flex items-center justify-around w-full py-4 px-3 mb-4 bg-[#090d16] border border-deck-border/80 rounded-xl">
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase font-semibold text-deck-400">Score</span>
            <span className="text-3xl font-black text-amber-400 font-mono">{score}</span>
          </div>

          <div className="h-8 w-px bg-deck-border/60" />

          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase font-semibold text-deck-400">Best</span>
            <span className="text-2xl font-bold text-gray-300 font-mono">{highScore}</span>
          </div>
        </div>

        {isNewHigh && (
          <div className="flex items-center gap-1.5 px-3 py-1 mb-4 text-xs font-bold text-amber-300 bg-amber-500/20 border border-amber-500/40 rounded-full animate-bounce">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>NEW ALL-TIME RECORD!</span>
          </div>
        )}

        {medalName && (
          <div
            className={`flex items-center gap-1.5 px-3 py-1 mb-4 text-xs font-semibold border rounded-lg ${medalColor}`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Earned: {medalName}</span>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col w-full gap-2 mt-2">
          <button
            type="button"
            onClick={onRestart}
            className="flex items-center justify-center w-full gap-2 px-4 py-3 text-sm font-bold text-black transition-all bg-amber-500 hover:bg-amber-400 active:scale-[0.98] rounded-xl shadow-lg shadow-amber-500/20"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Fly Again (Space)</span>
          </button>

          <Link
            href="/games"
            className="flex items-center justify-center w-full px-4 py-2.5 text-xs font-semibold text-deck-300 hover:text-white transition-colors hover:bg-deck-800/60 rounded-xl border border-deck-border/50"
          >
            Return to Arcade Shelf
          </Link>
        </div>
      </div>
    </div>
  );
}
