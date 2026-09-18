'use client';

import { Bomb, LogOut, PartyPopper, RotateCcw, SkipForward } from 'lucide-react';
import React from 'react';
import { Button } from '@playdeck/ui';
import {
  PHASE_MACHINE_CLEARED,
  PHASE_MACHINE_FAILED,
  PHASE_SHIFT_COMPLETE,
} from '../engine/bomb-factory-constants';
import type { BombFactoryState } from '../types/bomb-factory.types';

interface BombFactoryResultProps {
  state: BombFactoryState;
  canAdvance: boolean;
  onNextMachine: () => void;
  onRestartShift: () => void;
  onLeave: () => void;
}

interface ResultCopy {
  icon: React.ReactNode;
  heading: string;
  body: string;
  tone: string;
}

function copyFor(state: BombFactoryState): ResultCopy | null {
  switch (state.phase) {
    case PHASE_MACHINE_CLEARED:
      return {
        icon: <PartyPopper className="h-7 w-7 text-emerald-300" aria-hidden="true" />,
        heading: `${state.spec?.name ?? 'Machine'} armed`,
        body: 'Sealed, stamped and rolled off the line. The next one is bigger.',
        tone: 'border-emerald-500/40',
      };
    case PHASE_SHIFT_COMPLETE:
      return {
        icon: <PartyPopper className="h-7 w-7 text-amber-300" aria-hidden="true" />,
        heading: 'Shift complete',
        body: 'Every machine off the line and nobody lost a hand. Remarkable.',
        tone: 'border-amber-500/40',
      };
    case PHASE_MACHINE_FAILED:
      return {
        icon: <Bomb className="h-7 w-7 text-rose-300" aria-hidden="true" />,
        heading: 'The line blew',
        body: 'The clock hit zero with the machine half built. Somebody was not listening.',
        tone: 'border-rose-500/40',
      };
    default:
      return null;
  }
}

export function BombFactoryResult({
  state,
  canAdvance,
  onNextMachine,
  onRestartShift,
  onLeave,
}: BombFactoryResultProps) {
  const copy = copyFor(state);
  if (!copy) return null;

  const isCleared = state.phase === PHASE_MACHINE_CLEARED;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={copy.heading}
      className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
    >
      <div
        className={`w-full max-w-md rounded-2xl border bg-surface-raised p-6 shadow-2xl ${copy.tone}`}
      >
        <div className="flex items-center gap-3">
          {copy.icon}
          <h2 className="font-display text-xl font-black tracking-tight text-deck-950 dark:text-white">
            {copy.heading}
          </h2>
        </div>
        <p className="mt-2 text-sm text-deck-400">{copy.body}</p>

        <dl className="mt-5 grid grid-cols-3 gap-3 text-center">
          {[
            { label: 'Machines', value: `${state.machinesCleared}/${state.machinesInShift}` },
            { label: 'Faults', value: String(state.faults.length) },
            { label: 'Score', value: String(state.score) },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-surface-border bg-surface-overlay p-3"
            >
              <dt className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-deck-500">
                {stat.label}
              </dt>
              <dd className="mt-1 font-mono text-lg font-black text-deck-900 dark:text-white">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onLeave}>
            <LogOut className="mr-1.5 h-4 w-4" aria-hidden="true" /> Clock off
          </Button>

          {canAdvance ? (
            isCleared ? (
              <Button variant="primary" size="sm" onClick={onNextMachine}>
                <SkipForward className="mr-1.5 h-4 w-4" aria-hidden="true" /> Next machine
              </Button>
            ) : (
              <Button variant="primary" size="sm" onClick={onRestartShift}>
                <RotateCcw className="mr-1.5 h-4 w-4" aria-hidden="true" /> Run the shift again
              </Button>
            )
          ) : (
            <span className="text-xs text-deck-500">Waiting for the shift lead…</span>
          )}
        </div>
      </div>
    </div>
  );
}
