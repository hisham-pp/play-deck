'use client';

import { AlarmClock, Cog } from 'lucide-react';
import React from 'react';
import type { BombFactoryState } from '../types/bomb-factory.types';
import { formatClock, partName, stationName } from '../utils/bomb-factory-format';

interface BombFactoryHudProps {
  state: BombFactoryState;
  secondsLeft: number;
  reducedMotion: boolean;
}

const URGENT_SECONDS = 30;

export function BombFactoryHud({ state, secondsLeft, reducedMotion }: BombFactoryHudProps) {
  const totalSteps = state.spec?.partIds.length ?? 0;
  const urgent = secondsLeft <= URGENT_SECONDS;

  return (
    <header className="flex flex-col gap-3 rounded-xl border border-surface-border bg-surface-raised p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-deck-500">
            Machine {state.machineIndex + 1} of {state.machinesInShift}
          </p>
          <h2 className="flex items-center gap-2 font-display text-lg font-black tracking-tight text-deck-950 dark:text-white">
            <Cog className="h-5 w-5 text-amber-400" aria-hidden="true" />
            {state.spec?.name ?? 'Awaiting blueprint'}
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-deck-500">
              Step
            </p>
            <p className="font-mono text-lg font-black text-deck-900 dark:text-white">
              {Math.min(state.currentStep + 1, totalSteps)}/{totalSteps}
            </p>
          </div>

          <div
            role="timer"
            aria-live="off"
            aria-label={`${secondsLeft} seconds left`}
            className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 ${
              urgent
                ? 'border-rose-500/50 bg-rose-500/15 text-rose-300'
                : 'border-surface-border bg-surface-overlay text-deck-200'
            } ${urgent && !reducedMotion ? 'bf-urgent' : ''}`}
          >
            <AlarmClock className="h-4 w-4" aria-hidden="true" />
            <span className="font-mono text-xl font-black tabular-nums">
              {formatClock(secondsLeft)}
            </span>
          </div>
        </div>
      </div>

      <ol className="flex flex-wrap gap-1.5" aria-label="Assembly progress">
        {Array.from({ length: totalSteps }, (_, index) => {
          const done = state.completedSteps[index];
          const isCurrent = index === state.currentStep;
          return (
            <li
              key={index}
              className={`flex min-w-0 flex-1 basis-24 flex-col gap-0.5 rounded-lg border px-2 py-1.5 ${
                done
                  ? `border-emerald-500/40 bg-emerald-500/10 ${reducedMotion ? '' : 'bf-seat'}`
                  : isCurrent
                    ? 'border-amber-400 bg-amber-400/10'
                    : 'border-surface-border bg-surface-overlay'
              }`}
            >
              <span className="font-mono text-[9px] font-black uppercase tracking-[0.18em] text-deck-500">
                Step {index + 1}
              </span>
              <span className="truncate text-[11px] font-semibold text-deck-200">
                {done ? partName(done.partId) : isCurrent ? 'In hand' : 'Sealed'}
              </span>
              {done && (
                <span className="truncate text-[10px] text-emerald-300/80">
                  {stationName(done.stationId)} · dial {done.dial}
                </span>
              )}
            </li>
          );
        })}
      </ol>

      {state.penaltySeconds > 0 && (
        <p className="text-[11px] font-semibold text-rose-300">
          {state.penaltySeconds}s burned on {state.faults.length}{' '}
          {state.faults.length === 1 ? 'fault' : 'faults'}.
        </p>
      )}
    </header>
  );
}
