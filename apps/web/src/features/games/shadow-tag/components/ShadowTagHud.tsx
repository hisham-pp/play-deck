'use client';

import { Contrast, EyeOff, Flame, Lightbulb, Timer } from 'lucide-react';
import { Button } from '@playdeck/ui';
import { LIGHT_INTERACT_COOLDOWN_MS } from '../engine/shadow-tag-constants';
import type { ShadowTagHud as HudModel } from '../types/shadow-tag.types';

interface ShadowTagHudProps {
  hud: HudModel;
  highContrast: boolean;
  onToggleContrast: () => void;
}

function clock(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  return `${mins}:${String(seconds % 60).padStart(2, '0')}`;
}

/** Exposure is the one number that matters moment to moment: are you being lit? */
function ExposureMeter({ exposure }: { exposure: number }) {
  const percent = Math.round(exposure * 100);
  const tone = percent > 65 ? 'bg-rose-500' : percent > 30 ? 'bg-amber-500' : 'bg-emerald-500';

  return (
    <div className="flex min-w-[8rem] flex-col gap-1">
      <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        <EyeOff className="h-3 w-3" /> Exposure
      </span>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800"
        role="meter"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="How brightly you are lit"
      >
        <div
          className={`h-full ${tone} transition-[width] duration-150`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export function ShadowTagHudBar({ hud, highContrast, onToggleContrast }: ShadowTagHudProps) {
  const cooldownPercent = Math.round(
    (1 - hud.lightCooldown / (LIGHT_INTERACT_COOLDOWN_MS / 1000)) * 100,
  );

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-t-xl border border-b-0 border-surface-border bg-surface-overlay px-4 py-3">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5 font-mono text-lg font-bold text-amber-400">
          <Timer className="h-4 w-4" aria-hidden="true" />
          <span aria-label={`${hud.secondsLeft} seconds remaining`}>{clock(hud.secondsLeft)}</span>
        </span>

        <span
          className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${
            hud.isLocalIt ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-300'
          }`}
        >
          <Flame className="h-3.5 w-3.5" aria-hidden="true" />
          {hud.isLocalIt ? 'You are it' : `${hud.itName} is it`}
        </span>

        {hud.immune && (
          <span className="rounded-md bg-slate-800 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-300">
            Safe
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        <ExposureMeter exposure={hud.exposure} />

        <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          <Lightbulb className="h-3 w-3" aria-hidden="true" />
          {hud.lightCooldown > 0 ? `Lamp ${cooldownPercent}%` : 'Lamp ready'}
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
