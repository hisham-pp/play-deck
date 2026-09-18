'use client';

import { TriangleAlert } from 'lucide-react';
import React from 'react';
import { CHANNEL_ROLES } from '../engine/bomb-factory-constants';
import type { FaultRecord } from '../types/bomb-factory.types';
import { partName } from '../utils/bomb-factory-format';

interface BombFactoryFaultLogProps {
  faults: FaultRecord[];
  reducedMotion: boolean;
}

const VISIBLE_FAULTS = 4;

function faultLine(fault: FaultRecord): string {
  const blamed = fault.failedChannels.map((channel) => CHANNEL_ROLES[channel]).join(' and ');
  return `Step ${fault.stepIndex + 1}: the ${partName(fault.partId)} was rejected by the ${blamed}. ${fault.penaltySeconds}s lost.`;
}

export function BombFactoryFaultLog({ faults, reducedMotion }: BombFactoryFaultLogProps) {
  const recent = faults.slice(-VISIBLE_FAULTS).reverse();
  const latest = faults[faults.length - 1];

  return (
    <section
      aria-label="Fault log"
      className="flex flex-col gap-2 rounded-xl border border-surface-border bg-surface-raised p-4"
    >
      <h3 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-deck-900 dark:text-white">
        <TriangleAlert className="h-4 w-4 text-rose-400" aria-hidden="true" />
        Fault log
      </h3>

      {/* Announced once per fault so the room hears it without watching the panel. */}
      <p aria-live="assertive" className="sr-only">
        {latest ? faultLine(latest) : ''}
      </p>

      {recent.length === 0 ? (
        <p className="text-xs text-deck-500">Clean run so far. Keep talking.</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {recent.map((fault, index) => (
            <li
              key={fault.attemptId}
              className={`rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-[11px] leading-relaxed text-rose-200 ${
                index === 0 && !reducedMotion ? 'bf-fault' : ''
              }`}
            >
              {faultLine(fault)}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
