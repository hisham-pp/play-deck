'use client';

import { Eye, Keyboard, Map, Play, RotateCcw, Volume2, VolumeX, X } from 'lucide-react';
import React from 'react';

interface PauseMenuModalProps {
  soundEnabled: boolean;
  reducedMotion: boolean;
  onToggleSound: () => void;
  onToggleReducedMotion: () => void;
  onResume: () => void;
  onRestart: () => void;
  onReturnToMap: () => void;
}

export function PauseMenuModal({
  soundEnabled,
  reducedMotion,
  onToggleSound,
  onToggleReducedMotion,
  onResume,
  onRestart,
  onReturnToMap,
}: PauseMenuModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pause-menu-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-sm rounded-3xl border border-surface-border bg-gradient-to-b from-[#1c2438] to-[#0c121e] p-6 shadow-arcade text-center space-y-4">
        {/* Close Button */}
        <button
          onClick={onResume}
          className="absolute right-3.5 top-3.5 rounded-lg p-1.5 text-deck-400 hover:text-white transition-colors"
          title="Resume Game"
        >
          <X className="w-4 h-4" />
        </button>

        <div>
          <div className="text-[11px] uppercase tracking-[0.25em] font-mono text-amber-500 font-bold">
            Climb Suspended
          </div>
          <h2 id="pause-menu-title" className="text-xl font-black text-white mt-0.5">
            Game Paused
          </h2>
        </div>

        {/* Accessibility & Audio Controls */}
        <div className="space-y-2 rounded-2xl border border-surface-border bg-slate-950/70 p-3 text-xs">
          <div className="flex items-center justify-between py-1">
            <span className="flex items-center gap-2 text-deck-300">
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-amber-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-deck-500" />
              )}
              <span>Sound Effects</span>
            </span>
            <button
              type="button"
              onClick={onToggleSound}
              className={`px-2.5 py-1 rounded-lg border font-mono text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                soundEnabled
                  ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                  : 'border-surface-border bg-surface-raised text-deck-500'
              }`}
            >
              {soundEnabled ? 'Enabled' : 'Muted'}
            </button>
          </div>

          <div className="flex items-center justify-between py-1 border-t border-white/5">
            <span className="flex items-center gap-2 text-deck-300">
              <Eye className="w-4 h-4 text-sky-400" />
              <span>Reduced Motion</span>
            </span>
            <button
              type="button"
              onClick={onToggleReducedMotion}
              className={`px-2.5 py-1 rounded-lg border font-mono text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                reducedMotion
                  ? 'border-sky-500 bg-sky-500/20 text-sky-300'
                  : 'border-surface-border bg-surface-raised text-deck-500'
              }`}
            >
              {reducedMotion ? 'On' : 'Off'}
            </button>
          </div>
        </div>

        {/* Tactical Keybindings Reference */}
        <div className="rounded-2xl border border-surface-border bg-slate-950/70 p-3 text-left space-y-1.5">
          <div className="flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-wider text-deck-500 font-bold">
            <Keyboard className="w-3.5 h-3.5 text-amber-400" />
            <span>Tactical Hotkeys</span>
          </div>
          <ul className="text-[11px] text-deck-400 font-mono space-y-1">
            <li className="flex justify-between">
              <span>Strike</span>
              <kbd className="px-1.5 py-0.5 rounded bg-surface-raised border border-surface-border text-white text-[10px]">
                Space / 1
              </kbd>
            </li>
            <li className="flex justify-between">
              <span>Flank</span>
              <kbd className="px-1.5 py-0.5 rounded bg-surface-raised border border-surface-border text-white text-[10px]">
                F / 2
              </kbd>
            </li>
            <li className="flex justify-between">
              <span>Cleave</span>
              <kbd className="px-1.5 py-0.5 rounded bg-surface-raised border border-surface-border text-white text-[10px]">
                C / 3
              </kbd>
            </li>
            <li className="flex justify-between">
              <span>Parry</span>
              <kbd className="px-1.5 py-0.5 rounded bg-surface-raised border border-surface-border text-white text-[10px]">
                P / 4
              </kbd>
            </li>
            <li className="flex justify-between">
              <span>Ascent Map</span>
              <kbd className="px-1.5 py-0.5 rounded bg-surface-raised border border-surface-border text-white text-[10px]">
                M
              </kbd>
            </li>
          </ul>
        </div>

        {/* Buttons */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={onResume}
            className="w-full rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-amber-500/25 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Resume Climb [Esc]</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onRestart}
              className="rounded-xl border border-surface-border bg-surface-raised hover:bg-surface-overlay text-deck-300 hover:text-white px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restart [R]</span>
            </button>

            <button
              type="button"
              onClick={onReturnToMap}
              className="rounded-xl border border-surface-border bg-surface-raised hover:bg-surface-overlay text-deck-300 hover:text-white px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1"
            >
              <Map className="w-3.5 h-3.5" />
              <span>Map [M]</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
