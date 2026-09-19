'use client';

import { HelpCircle, RefreshCw, Volume2, VolumeX } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@playdeck/ui';

import { floorIsLavaSoundService } from '../services/floor-is-lava-sound.service';

export interface FloorIsLavaToolbarProps {
  onRestart: () => void;
  onLeave?: () => void;
  isMultiplayer?: boolean;
}

export function FloorIsLavaToolbar({
  onRestart,
  onLeave,
  isMultiplayer = false,
}: FloorIsLavaToolbarProps) {
  const [soundEnabled, setSoundEnabled] = useState(floorIsLavaSoundService.isSoundEnabled());
  const [showControls, setShowControls] = useState(false);

  const toggleSound = () => {
    const next = !soundEnabled;
    floorIsLavaSoundService.setSoundEnabled(next);
    setSoundEnabled(next);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#1c0a0a] rounded-xl border border-[#450a0a] shadow-lg">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Arena:
        </span>
        <span className="text-sm font-bold text-amber-400">Molten Caldera (10x10)</span>
      </div>

      <div className="flex items-center gap-2">
        {/* Controls Popover */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowControls((prev) => !prev)}
            className="text-slate-300 hover:text-white"
          >
            <HelpCircle className="w-4 h-4 mr-1" />
            Controls
          </Button>

          {showControls && (
            <div className="absolute right-0 top-full mt-2 w-72 p-4 bg-[#1c0a0a] border border-[#450a0a] rounded-xl shadow-2xl z-30 text-xs text-slate-300">
              <h4 className="font-bold text-amber-400 mb-2 uppercase tracking-wide">
                Survival Controls
              </h4>
              <ul className="space-y-1.5">
                <li>
                  <span className="font-mono text-cyan-400">W / A / S / D</span> or{' '}
                  <span className="font-mono text-cyan-400">Arrows</span>: Run
                </li>
                <li>
                  <span className="font-mono text-amber-400">Spacebar</span>: Push Opponents
                </li>
                <li>
                  <span className="font-mono text-amber-400">Shift</span>: Double Jump (Leap gaps)
                </li>
                <li>
                  <span className="text-red-400 font-semibold">Tip</span>: Standing on a tile cracks
                  it faster! Keep moving!
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Audio Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSound}
          className="text-slate-300 hover:text-white"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </Button>

        {/* Restart Button (Solo) */}
        {!isMultiplayer && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onRestart}
            className="bg-[#2a1212] hover:bg-[#3d1818] text-slate-200 border-[#5a1b1b]"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Restart
          </Button>
        )}

        {/* Leave Room Button */}
        {onLeave && (
          <Button variant="outline" size="sm" onClick={onLeave}>
            Leave
          </Button>
        )}
      </div>
    </div>
  );
}
