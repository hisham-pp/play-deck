'use client';

import React, { useState } from 'react';
import type { LootDashCareerStats } from '../services/loot-stats-repository';
import type { LootDashConfig, BotDifficulty } from '../types/loot-dash.types';

interface LootDashLobbyProps {
  config: LootDashConfig;
  stats: LootDashCareerStats | null;
  onStartSolo: (customConfig?: Partial<LootDashConfig>) => void;
  onOpenOnlineRoom: () => void;
  onToggleSound: () => void;
  onToggleHighContrast: () => void;
  onToggleReducedMotion: () => void;
}

export function LootDashLobby({
  config,
  stats,
  onStartSolo,
  onOpenOnlineRoom,
  onToggleSound,
  onToggleHighContrast,
  onToggleReducedMotion,
}: LootDashLobbyProps) {
  const [botCount, setBotCount] = useState(config.botCount);
  const [difficulty, setDifficulty] = useState<BotDifficulty>(config.botDifficulty);
  const [duration, setDuration] = useState(config.roundDuration);
  const [targetScore, setTargetScore] = useState(config.targetScore);

  const handleStart = () => {
    onStartSolo({
      botCount,
      botDifficulty: difficulty,
      roundDuration: duration,
      targetScore,
    });
  };

  return (
    <div className="w-full max-w-[960px] mx-auto bg-slate-900/90 border border-slate-700/60 rounded-2xl p-6 shadow-2xl backdrop-blur-md text-slate-100 flex flex-col gap-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
              FAST-PACED ARCADE
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
              2–6 RUNNERS
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
              VOICE CHAT
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-amber-400 via-yellow-300 to-amber-200">
            LOOT DASH
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Dash around a miniature arena scooping coins, gems, and treasure chests. Trigger
            retractable spike traps, evade slime slowdown pools, steal loot from opponents, and grab
            game-changing power-ups!
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenOnlineRoom}
          className="px-5 py-3 rounded-xl font-bold text-sm bg-linear-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white shadow-lg shadow-sky-600/25 border border-sky-400/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>🌐</span>
          <span>Host or Join Online Room</span>
        </button>
      </div>

      {/* Match Configuration & Career Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Solo Match Setup */}
        <div className="md:col-span-2 flex flex-col gap-5 bg-slate-950/60 p-5 rounded-xl border border-slate-800/80">
          <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
            <span>🏃</span> Solo Dash Parameters
          </h2>

          {/* Bot Count */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span>RIVAL BOT RUNNERS</span>
              <span className="text-amber-400 font-bold">
                {botCount} Bots (Total {botCount + 1} Runners)
              </span>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => setBotCount(cnt)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    botCount === cnt
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-xs'
                      : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {cnt}
                </button>
              ))}
            </div>
          </div>

          {/* Bot Difficulty */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-slate-300">AI RUNNER DIFFICULTY</span>
            <div className="flex gap-2">
              {(['easy', 'medium', 'hard'] as BotDifficulty[]).map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setDifficulty(diff)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase border transition-all cursor-pointer ${
                    difficulty === diff
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-xs'
                      : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Round Target & Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-slate-300">TARGET SCORE</span>
              <div className="flex gap-2">
                {[150, 250, 400].map((sc) => (
                  <button
                    key={sc}
                    type="button"
                    onClick={() => setTargetScore(sc)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      targetScore === sc
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                        : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {sc}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-slate-300">ROUND TIMER</span>
              <div className="flex gap-2">
                {[60, 90, 120].map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setDuration(sec)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      duration === sec
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                        : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {sec}s
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Launch Button */}
          <button
            type="button"
            onClick={handleStart}
            className="w-full py-4 rounded-xl font-black uppercase tracking-wider text-base bg-linear-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-xl shadow-amber-500/20 border border-amber-300/40 transition-all cursor-pointer mt-2"
          >
            Start Loot Dash
          </button>
        </div>

        {/* Career Trophy Shelf */}
        <div className="flex flex-col gap-4 bg-slate-950/60 p-5 rounded-xl border border-slate-800/80">
          <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
            <span>🏆</span> Career Vault
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">
                Matches Run
              </span>
              <span className="text-xl font-black font-mono text-slate-200">
                {stats?.matchesPlayed ?? 0}
              </span>
            </div>

            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Victories</span>
              <span className="text-xl font-black font-mono text-amber-400">
                {stats?.matchesWon ?? 0}
              </span>
            </div>

            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">High Score</span>
              <span className="text-xl font-black font-mono text-yellow-300">
                {stats?.highScore ?? 0}
              </span>
            </div>

            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">
                Loot Scooped
              </span>
              <span className="text-xl font-black font-mono text-sky-400">
                {(stats?.coinsCollected ?? 0) + (stats?.gemsCollected ?? 0)}
              </span>
            </div>

            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">
                Traps Tripped
              </span>
              <span className="text-xl font-black font-mono text-red-400">
                {stats?.trapsTriggered ?? 0}
              </span>
            </div>

            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">
                Opponents Robbed
              </span>
              <span className="text-xl font-black font-mono text-purple-400">
                {stats?.stealsCount ?? 0}
              </span>
            </div>
          </div>

          {/* Quick Audio & Visual Toggles */}
          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2 text-xs">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Preferences</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onToggleSound}
                className="flex-1 py-1.5 px-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors text-[11px] cursor-pointer"
              >
                {config.soundEnabled ? '🔊 Sound On' : '🔇 Muted'}
              </button>
              <button
                type="button"
                onClick={onToggleHighContrast}
                className="flex-1 py-1.5 px-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors text-[11px] cursor-pointer"
              >
                {config.highContrast ? '👁️ Contrast' : '👁️ Normal'}
              </button>
              <button
                type="button"
                onClick={onToggleReducedMotion}
                className="flex-1 py-1.5 px-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors text-[11px] cursor-pointer"
              >
                {config.reducedMotion ? '⚡ Reduced' : '⚡ Motion'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
