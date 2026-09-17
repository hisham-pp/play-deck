'use client';

import { BarChart3, Flag, HelpCircle, Pickaxe, Sliders } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@playdeck/ui';
import {
  DIFFICULTY_BEGINNER,
  DIFFICULTY_CUSTOM,
  DIFFICULTY_EXPERT,
  DIFFICULTY_INTERMEDIATE,
} from '../engine/minesweeper-constants';
import type { MinesweeperDifficulty } from '../types/minesweeper.types';

interface MinesweeperControlsProps {
  currentDifficulty: MinesweeperDifficulty;
  onSelectDifficulty: (difficulty: MinesweeperDifficulty) => void;
  onOpenCustomModal: () => void;
  onOpenStatsModal: () => void;
  isFlagModeActive: boolean;
  onToggleFlagMode: () => void;
}

const BTN_TYPE = 'button';
const MONO_AMBER_CLS = 'font-mono text-amber-400';

const PRESET_BUTTONS: { id: MinesweeperDifficulty; label: string }[] = [
  { id: DIFFICULTY_BEGINNER, label: 'Beginner' },
  { id: DIFFICULTY_INTERMEDIATE, label: 'Intermediate' },
  { id: DIFFICULTY_EXPERT, label: 'Expert' },
];

export function MinesweeperControls({
  currentDifficulty,
  onSelectDifficulty,
  onOpenCustomModal,
  onOpenStatsModal,
  isFlagModeActive,
  onToggleFlagMode,
}: MinesweeperControlsProps) {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="flex flex-col gap-3 w-full max-w-xl mx-auto">
      {/* Top Bar: Presets & Tools */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Preset Selector */}
        <div className="flex items-center gap-1 bg-deck-900/90 p-1 border border-deck-800 rounded-lg">
          {PRESET_BUTTONS.map((preset) => (
            <button
              key={preset.id}
              type={BTN_TYPE}
              onClick={() => onSelectDifficulty(preset.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                currentDifficulty === preset.id
                  ? 'bg-amber-500 text-deck-950 shadow-sm'
                  : 'text-deck-400 hover:text-deck-200 hover:bg-deck-800'
              }`}
            >
              {preset.label}
            </button>
          ))}
          <button
            type={BTN_TYPE}
            onClick={onOpenCustomModal}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1 cursor-pointer ${
              currentDifficulty === DIFFICULTY_CUSTOM
                ? 'bg-amber-500 text-deck-950 shadow-sm'
                : 'text-deck-400 hover:text-deck-200 hover:bg-deck-800'
            }`}
            title="Custom Board"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Custom</span>
          </button>
        </div>

        {/* Action Buttons: Mobile Toggle, Stats, Help */}
        <div className="flex items-center gap-1.5">
          {/* Mobile Mode Toggle */}
          <button
            type={BTN_TYPE}
            onClick={onToggleFlagMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
              isFlagModeActive
                ? 'bg-amber-500/20 border-amber-500/80 text-amber-400 shadow-sm'
                : 'bg-deck-900 border-deck-800 text-deck-400 hover:text-white hover:bg-deck-800'
            }`}
            title="Switch between Dig and Flag modes"
          >
            {isFlagModeActive ? (
              <>
                <Flag className="w-3.5 h-3.5 fill-amber-400" />
                <span>Flag Mode</span>
              </>
            ) : (
              <>
                <Pickaxe className="w-3.5 h-3.5 text-amber-500" />
                <span>Dig Mode</span>
              </>
            )}
          </button>

          {/* Stats Button */}
          <Button
            type={BTN_TYPE}
            variant="secondary"
            size="sm"
            onClick={onOpenStatsModal}
            title="View Records & Statistics"
          >
            <BarChart3 className="w-4 h-4" />
          </Button>

          {/* Help Toggle */}
          <Button
            type={BTN_TYPE}
            variant="secondary"
            size="sm"
            onClick={() => setShowHelp(!showHelp)}
            title="Keyboard shortcuts & instructions"
          >
            <HelpCircle className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Collapsible Accessibility & Shortcuts Guide */}
      {showHelp && (
        <div className="p-3.5 bg-deck-950/90 border border-deck-800 rounded-lg text-xs text-deck-300 space-y-2 animate-in fade-in duration-150">
          <div className="font-bold text-deck-100 flex items-center justify-between">
            <span>Controls & Accessibility</span>
            <span className={`text-[10px] ${MONO_AMBER_CLS}`}>Keyboard Enabled</span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
            <div>
              <span className={MONO_AMBER_CLS}>Left Click / Tap:</span> Reveal / Dig
            </div>
            <div>
              <span className={MONO_AMBER_CLS}>Right Click / F:</span> Toggle Flag
            </div>
            <div>
              <span className={MONO_AMBER_CLS}>Mid Click / C:</span> Chord Number
            </div>
            <div>
              <span className={MONO_AMBER_CLS}>Arrows / WASD:</span> Move Cursor
            </div>
            <div>
              <span className={MONO_AMBER_CLS}>Space / Enter:</span> Dig Selected Cell
            </div>
            <div>
              <span className={MONO_AMBER_CLS}>R:</span> Restart Current Game
            </div>
            <div>
              <span className={MONO_AMBER_CLS}>1 / 2 / 3:</span> Quick Presets
            </div>
            <div>
              <span className={MONO_AMBER_CLS}>Long-Press (Mobile):</span> Flag Cell
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
