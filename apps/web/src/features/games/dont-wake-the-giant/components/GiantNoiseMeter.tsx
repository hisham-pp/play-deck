'use client';

import { MOOD_RESTLESS_AT, MOOD_STIR_AT } from '../engine/giant-constants';
import type { GiantMood } from '../types/giant.types';

interface GiantNoiseMeterProps {
  /** The shared meter, 0..100. */
  percent: number;
  mood: GiantMood;
}

const MOOD_LABEL: Record<GiantMood, string> = {
  asleep: 'Fast asleep',
  stirring: 'Stirring',
  restless: 'Restless',
  awake: 'AWAKE',
};

const MOOD_TONE: Record<GiantMood, string> = {
  asleep: 'text-emerald-300',
  stirring: 'text-amber-300',
  restless: 'text-rose-300',
  awake: 'text-rose-200',
};

function fillTone(percent: number): string {
  if (percent >= MOOD_RESTLESS_AT) return 'bg-rose-500';
  if (percent >= MOOD_STIR_AT) return 'bg-amber-500';
  return 'bg-emerald-500';
}

/**
 * The one number everybody shares. The two thresholds are marked on the bar
 * itself so the crew can see how much room is left before the giant shifts,
 * rather than learning it by waking him.
 */
export function GiantNoiseMeter({ percent, mood }: GiantNoiseMeterProps) {
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <div className="flex min-w-[12rem] flex-1 flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Noise
        </span>
        <span className={`text-[11px] font-bold uppercase tracking-wide ${MOOD_TONE[mood]}`}>
          {MOOD_LABEL[mood]}
        </span>
      </div>

      <div
        className="relative h-3 w-full overflow-hidden rounded-full border border-slate-800 bg-slate-950"
        role="meter"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Shared noise meter. ${clamped} per cent. The giant is ${MOOD_LABEL[mood].toLowerCase()}.`}
      >
        <div
          className={`h-full ${fillTone(clamped)} transition-[width] duration-150`}
          style={{ width: `${clamped}%` }}
        />
        {[MOOD_STIR_AT, MOOD_RESTLESS_AT].map((threshold) => (
          <span
            key={threshold}
            className="absolute inset-y-0 w-px bg-slate-300/40"
            style={{ left: `${threshold}%` }}
            aria-hidden="true"
          />
        ))}
      </div>
    </div>
  );
}
