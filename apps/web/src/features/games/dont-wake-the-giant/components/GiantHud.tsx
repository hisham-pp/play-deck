'use client';

import { Coins, Contrast, DoorOpen, Footprints, Gem, Timer } from 'lucide-react';
import { Button } from '@playdeck/ui';
import { PHASE_ESCAPE } from '../engine/giant-constants';
import type { Gait, GiantHud as HudModel } from '../types/giant.types';
import { GiantNoiseMeter } from './GiantNoiseMeter';

interface GiantHudProps {
  hud: HudModel;
  highContrast: boolean;
  onToggleContrast: () => void;
}

const GAIT_LABEL: Record<Gait, string> = {
  tiptoe: 'Tiptoeing',
  walk: 'Walking',
  run: 'Running',
};

const GAIT_TONE: Record<Gait, string> = {
  tiptoe: 'bg-emerald-500/15 text-emerald-300',
  walk: 'bg-slate-800 text-slate-300',
  run: 'bg-rose-500/20 text-rose-300',
};

function clock(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  return `${mins}:${String(seconds % 60).padStart(2, '0')}`;
}

export function GiantHudBar({ hud, highContrast, onToggleContrast }: GiantHudProps) {
  const escaping = hud.phase === PHASE_ESCAPE;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-t-xl border border-b-0 border-surface-border bg-surface-overlay px-4 py-3">
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex items-center gap-1.5 font-mono text-lg font-bold text-amber-400">
          <Timer className="h-4 w-4" aria-hidden="true" />
          <span aria-label={`${hud.secondsLeft} seconds remaining`}>{clock(hud.secondsLeft)}</span>
        </span>

        {escaping && (
          <span className="flex items-center gap-1.5 rounded-md bg-emerald-500/20 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-emerald-300">
            <DoorOpen className="h-3.5 w-3.5" aria-hidden="true" />
            Get out
          </span>
        )}

        <span
          className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${GAIT_TONE[hud.gait]}`}
        >
          <Footprints className="h-3.5 w-3.5" aria-hidden="true" />
          {GAIT_LABEL[hud.gait]}
        </span>

        {hud.quiet && (
          <span className="rounded-md bg-teal-500/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-teal-300">
            Soft ground
          </span>
        )}
        {hud.muffled && (
          <span className="rounded-md bg-sky-500/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-sky-300">
            Muffled
          </span>
        )}
      </div>

      <GiantNoiseMeter percent={hud.noisePercent} mood={hud.mood} />

      <div className="flex items-center gap-4">
        <span
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-300"
          title="Loot in your arms"
        >
          <Gem className="h-3.5 w-3.5 text-violet-400" aria-hidden="true" />
          <span aria-label={`Carrying ${hud.carried} in loot`}>{hud.carried}</span>
        </span>

        <span
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-300"
          title="Loot the crew has carried out"
        >
          <Coins className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
          <span aria-label={`Crew has banked ${hud.bankedTotal}`}>{hud.bankedTotal}</span>
        </span>

        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          {hud.treasuresLeft} left
        </span>

        <Button
          size="sm"
          variant="ghost"
          onClick={onToggleContrast}
          aria-pressed={highContrast}
          title="Toggle high contrast"
        >
          <Contrast className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">High contrast</span>
        </Button>
      </div>
    </div>
  );
}
