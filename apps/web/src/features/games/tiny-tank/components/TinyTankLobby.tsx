'use client';

import React from 'react';
import type { TinyTankStats } from '../services/tank-stats-repository';
import type { TinyTankConfig, BotDifficulty } from '../types/tiny-tank.types';

interface TinyTankLobbyProps {
  config: TinyTankConfig;
  stats: TinyTankStats | null;
  onStartSolo: (customConfig?: Partial<TinyTankConfig>) => void;
  onOpenOnlineRoom: () => void;
  onToggleSound: () => void;
  onToggleHighContrast: () => void;
  onToggleReducedMotion: () => void;
}

export function TinyTankLobby({
  config,
  stats,
  onStartSolo,
  onOpenOnlineRoom,
  onToggleSound,
  onToggleHighContrast,
  onToggleReducedMotion,
}: TinyTankLobbyProps) {
  const [botCount, setBotCount] = React.useState(config.botCount);
  const [difficulty, setDifficulty] = React.useState<BotDifficulty>(config.botDifficulty);
  const [duration, setDuration] = React.useState(config.roundDuration);

  const handleStart = () => {
    onStartSolo({
      botCount,
      botDifficulty: difficulty,
      roundDuration: duration,
    });
  };

  return (
    <div className="w-full max-w-[960px] mx-auto bg-slate-900/90 border border-slate-700/60 rounded-2xl p-6 shadow-2xl backdrop-blur-md text-slate-100 flex flex-col gap-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
              PHYSICS ARENA
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
              2–6 PLAYERS
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-amber-400 via-orange-300 to-amber-200">
            TINY TANK ARENA
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Command miniature armored tanks in tactical destructible arenas. Blow through brick
            cover, detonate hazard barrels, collect unusual weapons, and annihilate rival tanks.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenOnlineRoom}
          className="px-5 py-3 rounded-xl font-bold text-sm bg-linear-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white shadow-lg shadow-sky-600/25 border border-sky-400/30 transition-all flex items-center justify-center gap-2"
        >
          <span>🌐</span>
          <span>Host or Join Online Room</span>
        </button>
      </div>

      {/* Match Configuration & Lifetime Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Solo Match Setup */}
        <div className="md:col-span-2 flex flex-col gap-5 bg-slate-950/60 p-5 rounded-xl border border-slate-800/80">
          <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
            <span>🎮</span> Solo Combat Parameters
          </h2>

          {/* Bot Count */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span>RIVAL BOT TANKS</span>
              <span className="text-amber-400 font-bold">
                {botCount} Bots (Total {botCount + 1} Tanks)
              </span>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => setBotCount(cnt)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
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
            <span className="text-xs font-semibold text-slate-300">AI COMBAT DIFFICULTY</span>
            <div className="flex gap-2">
              {(['easy', 'medium', 'hard'] as BotDifficulty[]).map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setDifficulty(diff)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase border transition-all ${
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

          {/* Round Duration */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-slate-300">ROUND TIMER</span>
            <div className="flex gap-2">
              {[60, 90, 120].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setDuration(sec)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
                    duration === sec
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-xs'
                      : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {sec}s
                </button>
              ))}
            </div>
          </div>

          {/* Accessibility & Audio Toggles */}
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-800/80">
            <button
              type="button"
              onClick={onToggleSound}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                config.soundEnabled
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-800/60 border-slate-700/80 text-slate-400'
              }`}
            >
              {config.soundEnabled ? '🔊 Sound: ON' : '🔇 Sound: OFF'}
            </button>
            <button
              type="button"
              onClick={onToggleHighContrast}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                config.highContrast
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-slate-800/60 border-slate-700/80 text-slate-400'
              }`}
            >
              {config.highContrast ? '👁️ High Contrast: ON' : '👁️ High Contrast: OFF'}
            </button>
            <button
              type="button"
              onClick={onToggleReducedMotion}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                config.reducedMotion
                  ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                  : 'bg-slate-800/60 border-slate-700/80 text-slate-400'
              }`}
            >
              {config.reducedMotion ? '⚡ Reduced Motion: ON' : '⚡ Reduced Motion: OFF'}
            </button>
          </div>

          <button
            type="button"
            onClick={handleStart}
            className="w-full py-3.5 rounded-xl font-black text-sm tracking-wide uppercase bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-xl shadow-amber-500/20 border border-amber-300/40 transition-all mt-2"
          >
            Deploy Tiny Tanks & Start Battle
          </button>
        </div>

        {/* Lifetime Record Stats */}
        <div className="flex flex-col gap-4 bg-slate-950/60 p-5 rounded-xl border border-slate-800/80">
          <h2 className="text-sm font-bold uppercase tracking-wider text-sky-400 flex items-center gap-2">
            <span>🎖️</span> Tank Service Record
          </h2>

          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center py-2 border-b border-slate-800/80 text-xs">
              <span className="text-slate-400">Matches Played</span>
              <span className="font-mono font-bold text-slate-200">
                {stats?.matchesPlayed ?? 0}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-800/80 text-xs">
              <span className="text-slate-400">Victories</span>
              <span className="font-mono font-bold text-emerald-400">{stats?.matchesWon ?? 0}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-800/80 text-xs">
              <span className="text-slate-400">Total Kills</span>
              <span className="font-mono font-bold text-red-400">{stats?.kills ?? 0}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-800/80 text-xs">
              <span className="text-slate-400">Shots Landed</span>
              <span className="font-mono font-bold text-sky-400">{stats?.shotsHit ?? 0}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-800/80 text-xs">
              <span className="text-slate-400">Crates Scavenged</span>
              <span className="font-mono font-bold text-amber-300">
                {stats?.cratesCollected ?? 0}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 text-xs">
              <span className="text-slate-400">Career High Score</span>
              <span className="font-mono font-bold text-amber-400">{stats?.highScore ?? 0}</span>
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
            <strong className="text-slate-300">Tactical Controls:</strong>
            <p>
              • Move: <span className="text-amber-300">WASD</span> or{' '}
              <span className="text-amber-300">Arrow Keys</span>
            </p>
            <p>
              • Aim: <span className="text-amber-300">Mouse Cursor</span>
            </p>
            <p>
              • Fire: <span className="text-amber-300">Left Click</span> or{' '}
              <span className="text-amber-300">Spacebar</span>
            </p>
            <p>
              • Select Weapon: <span className="text-amber-300">1–6 Keys</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
