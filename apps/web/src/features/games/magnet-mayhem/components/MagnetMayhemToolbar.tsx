'use client';

import { HelpCircle, RefreshCw, Volume2, VolumeX } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@playdeck/ui';
import { magnetSoundService } from '../services/magnet-sound.service';

export interface MagnetMayhemToolbarProps {
  onRestart: () => void;
  onLeave?: () => void;
  isMultiplayer?: boolean;
}

export function MagnetMayhemToolbar({
  onRestart,
  onLeave,
  isMultiplayer = false,
}: MagnetMayhemToolbarProps) {
  const [soundEnabled, setSoundEnabled] = useState(magnetSoundService.isSoundEnabled());
  const [showControls, setShowControls] = useState(false);

  const toggleSound = () => {
    const next = !soundEnabled;
    magnetSoundService.setSoundEnabled(next);
    setSoundEnabled(next);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#090d16] rounded-xl border border-[#1e293b] shadow-lg">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Arena:
        </span>
        <span className="text-sm font-bold text-cyan-400">Polarity Colosseum (960x600)</span>
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
            <div className="absolute right-0 top-full mt-2 w-80 p-4 bg-[#090d16] border border-[#1e293b] rounded-xl shadow-2xl z-30 text-xs text-slate-300 space-y-2">
              <h4 className="font-bold text-cyan-400 uppercase tracking-wide">
                Magnet Pilot Guide
              </h4>
              <ul className="space-y-1.5 text-slate-300">
                <li>
                  <span className="font-mono text-cyan-400 font-bold">Mouse / Touch Aim</span>:
                  Point in flight direction
                </li>
                <li>
                  <span className="font-mono text-cyan-400 font-bold">Left-Click / Space / Z</span>:
                  ATTRACT (pull toward anchors & targets to slingshot)
                </li>
                <li>
                  <span className="font-mono text-rose-400 font-bold">Right-Click / Shift / X</span>
                  : REPEL (shockwave blast rivals into hazards)
                </li>
                <li className="text-amber-400 font-semibold pt-1 border-t border-slate-800">
                  ⚡ Hazard Alert: Touching red Tesla Coils zaps 5 points and stuns you!
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
            className="bg-[#1e293b] hover:bg-[#334155] text-slate-200 border-[#334155]"
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
