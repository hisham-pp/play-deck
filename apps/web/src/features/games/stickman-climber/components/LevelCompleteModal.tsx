'use client';

import { ArrowRight, Award, Coins, Map, RotateCcw, Sparkles, Star, Trophy } from 'lucide-react';
import React from 'react';
import type { LevelCompleteResult } from '../engine/stickman-climber-logic';

interface LevelCompleteModalProps {
  result: LevelCompleteResult;
  onNextLevel: () => void;
  onReplay: () => void;
  onOpenMap: () => void;
}

export function LevelCompleteModal({
  result,
  onNextLevel,
  onReplay,
  onOpenMap,
}: LevelCompleteModalProps) {
  const isFinalLevel = result.levelId >= 5;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md p-6 rounded-2xl border border-amber-500/40 bg-surface-raised shadow-2xl shadow-amber-500/10 flex flex-col gap-5 text-center">
        {/* Victory Icon & Title */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
            <Trophy className="w-8 h-8 text-amber-400 animate-bounce" />
          </div>

          <div>
            <div className="flex items-center justify-center gap-1.5 text-xs uppercase font-mono font-bold text-amber-400 tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ascent Stage Cleared</span>
            </div>
            <h3 className="text-2xl font-black text-white font-display mt-0.5">
              Level {result.levelId} Conquered!
            </h3>
          </div>
        </div>

        {/* Star Rating */}
        <div className="flex items-center justify-center gap-2 py-2">
          {[1, 2, 3].map((starIndex) => (
            <div
              key={starIndex}
              className={`p-2 rounded-xl border ${
                starIndex <= result.stars
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                  : 'bg-surface-base border-surface-border text-deck-600'
              }`}
            >
              <Star
                className={`w-6 h-6 ${
                  starIndex <= result.stars ? 'fill-amber-400 text-amber-400' : 'text-deck-600'
                }`}
              />
            </div>
          ))}
        </div>

        {/* Rewards Grid */}
        <div className="grid grid-cols-2 gap-3 text-left">
          <div className="p-3 rounded-xl bg-surface-base border border-surface-border flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-deck-500 block">Gold</span>
              <span className="text-sm font-bold text-white font-mono">+{result.earnedCoins}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-surface-base border border-surface-border flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-deck-500 block">Climb XP</span>
              <span className="text-sm font-bold text-white font-mono">+{result.earnedXp}</span>
            </div>
          </div>
        </div>

        {/* Weapon Unlock Banner */}
        {result.unlockedWeapon && (
          <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/35 text-left flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-amber-400 block tracking-wider">
                New Weapon Unlocked!
              </span>
              <span className="text-sm font-black text-white font-display">
                {result.unlockedWeapon}
              </span>
            </div>
            <span className="text-2xl">⚔️</span>
          </div>
        )}

        {/* Next Level Notification */}
        {result.nextLevelUnlocked && (
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-mono font-semibold">
            ✦ Level {result.nextLevelUnlocked} is now unlocked on the Ascent Map!
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-2">
          {!isFinalLevel ? (
            <button
              onClick={onNextLevel}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 cursor-pointer"
            >
              <span>Continue to Level {result.levelId + 1}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold font-mono">
              👑 You have conquered the Summit of the Titan! Grandmaster Climber!
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onReplay}
              className="py-2.5 rounded-xl border border-surface-border bg-surface-base hover:bg-surface-overlay text-deck-300 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Replay</span>
            </button>
            <button
              onClick={onOpenMap}
              className="py-2.5 rounded-xl border border-surface-border bg-surface-base hover:bg-surface-overlay text-deck-300 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Map className="w-3.5 h-3.5" />
              <span>Ascent Map</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
