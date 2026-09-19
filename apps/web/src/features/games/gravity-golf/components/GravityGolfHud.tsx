'use client';

import { Compass, Contrast, Eye, Flag, Volume2, VolumeX } from 'lucide-react';
import React from 'react';
import { COSMIC_HOLES } from '../engine/holes-catalog';
import type { ScoreTerm } from '../engine/scoring';
import type { HoleDefinition } from '../types/gravity-golf.types';

interface GravityGolfHudProps {
  hole: HoleDefinition;
  strokes: number;
  scoreTerm: ScoreTerm;
  soundEnabled: boolean;
  onToggleSound: () => void;
  showTrajectory: boolean;
  onToggleTrajectory: () => void;
  highContrast: boolean;
  onToggleHighContrast: () => void;
  reducedMotion: boolean;
  onToggleReducedMotion: () => void;
  onSelectHole: (holeNumber: number) => void;
}

export function GravityGolfHud({
  hole,
  strokes,
  scoreTerm,
  soundEnabled,
  onToggleSound,
  showTrajectory,
  onToggleTrajectory,
  highContrast,
  onToggleHighContrast,
  reducedMotion,
  onToggleReducedMotion,
  onSelectHole,
}: GravityGolfHudProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-surface-border bg-surface-raised/90 backdrop-blur-md">
      {/* Hole Info & Selector */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-overlay border border-surface-border">
          <Flag className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-deck-200">Hole {hole.number}</span>
          <span className="text-deck-500 text-xs">/ {COSMIC_HOLES.length}</span>
        </div>

        <div>
          <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
            {hole.name}
            <span className="text-[10px] font-medium text-deck-400 px-1.5 py-0.5 rounded bg-surface-overlay">
              {hole.subtitle}
            </span>
          </h2>
        </div>
      </div>

      {/* Par & Strokes Status */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-surface-overlay border border-surface-border text-xs">
          <span className="text-deck-400">Par:</span>
          <span className="font-bold text-white">{hole.par}</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-surface-overlay border border-surface-border text-xs">
          <span className="text-deck-400">Fields:</span>
          <span className="font-bold text-amber-400">{strokes}</span>
        </div>

        <div className={`px-2.5 py-1 rounded-lg border text-xs font-bold ${scoreTerm.badgeColor}`}>
          {scoreTerm.label}
        </div>

        {/* Hole Dropdown */}
        <select
          value={hole.number}
          onChange={(e) => onSelectHole(Number(e.target.value))}
          className="bg-surface-overlay text-deck-300 text-xs rounded-lg px-2.5 py-1 border border-surface-border cursor-pointer focus:outline-none focus:border-amber-500"
          aria-label="Select Hole"
        >
          {COSMIC_HOLES.map((h) => (
            <option key={h.id} value={h.number} className="bg-deck-900 text-white">
              Hole {h.number}: {h.name} (Par {h.par})
            </option>
          ))}
        </select>
      </div>

      {/* Quick Action Toggles */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onToggleTrajectory}
          title={showTrajectory ? 'Hide Trajectory Guide' : 'Show Trajectory Guide'}
          className={`p-1.5 rounded-lg border transition-colors ${
            showTrajectory
              ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
              : 'bg-surface-overlay text-deck-400 border-surface-border hover:text-white'
          }`}
          aria-label="Toggle trajectory guide"
        >
          <Compass className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onToggleSound}
          title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
          className={`p-1.5 rounded-lg border transition-colors ${
            soundEnabled
              ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
              : 'bg-surface-overlay text-deck-400 border-surface-border hover:text-white'
          }`}
          aria-label="Toggle audio"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        <button
          type="button"
          onClick={onToggleHighContrast}
          title="Toggle High Contrast"
          className={`p-1.5 rounded-lg border transition-colors ${
            highContrast
              ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
              : 'bg-surface-overlay text-deck-400 border-surface-border hover:text-white'
          }`}
          aria-label="Toggle high contrast"
        >
          <Contrast className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onToggleReducedMotion}
          title="Toggle Reduced Motion"
          className={`p-1.5 rounded-lg border transition-colors ${
            reducedMotion
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              : 'bg-surface-overlay text-deck-400 border-surface-border hover:text-white'
          }`}
          aria-label="Toggle reduced motion"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
