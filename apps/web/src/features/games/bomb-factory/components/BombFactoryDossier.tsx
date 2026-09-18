'use client';

import { Eye, EyeOff, FileLock2 } from 'lucide-react';
import React from 'react';
import { Button } from '@playdeck/ui';
import { CHANNEL_LABELS, CHANNEL_ROLES } from '../engine/bomb-factory-constants';
import type { BlueprintChannel, DossierFact } from '../types/bomb-factory.types';
import { factLine, sortFacts } from '../utils/bomb-factory-format';

interface BombFactoryDossierProps {
  seatLabel: string;
  facts: DossierFact[];
  /** Local play passes one device round, so a dossier can be covered up. */
  hidden?: boolean;
  onToggleHidden?: () => void;
}

const CHANNEL_ACCENT: Record<BlueprintChannel, string> = {
  order: 'border-amber-500/40 bg-amber-500/10 text-amber-200',
  routing: 'border-sky-500/40 bg-sky-500/10 text-sky-200',
  calibration: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
  safety: 'border-rose-500/40 bg-rose-500/10 text-rose-200',
};

export function BombFactoryDossier({
  seatLabel,
  facts,
  hidden = false,
  onToggleHidden,
}: BombFactoryDossierProps) {
  const channels = [...new Set(facts.map((fact) => fact.kind))] as BlueprintChannel[];

  return (
    <section
      aria-label={`Dossier for ${seatLabel}`}
      className="flex flex-col gap-3 rounded-xl border border-surface-border bg-surface-raised p-4"
    >
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-deck-900 dark:text-white">
            <FileLock2 className="h-4 w-4 text-amber-400" aria-hidden="true" />
            {seatLabel}
          </h3>
          <p className="mt-0.5 text-[11px] text-deck-500">
            {channels.length > 0
              ? channels.map((channel) => CHANNEL_ROLES[channel]).join(' · ')
              : 'No sheet on this clipboard'}
          </p>
        </div>
        {onToggleHidden && (
          <Button size="sm" variant="ghost" onClick={onToggleHidden}>
            {hidden ? (
              <>
                <Eye className="mr-1.5 h-4 w-4" aria-hidden="true" /> Reveal
              </>
            ) : (
              <>
                <EyeOff className="mr-1.5 h-4 w-4" aria-hidden="true" /> Cover
              </>
            )}
          </Button>
        )}
      </header>

      {hidden ? (
        <p className="rounded-lg border border-dashed border-surface-border px-3 py-6 text-center text-xs text-deck-500">
          Sheet face down. Hand the device over before you reveal it.
        </p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {sortFacts(facts).map((fact, index) => (
            <li
              key={`${fact.kind}-${index}`}
              className={`rounded-lg border px-3 py-2 text-xs leading-relaxed ${CHANNEL_ACCENT[fact.kind]}`}
            >
              <span className="mr-2 font-mono text-[9px] font-black uppercase tracking-[0.18em] opacity-70">
                {CHANNEL_LABELS[fact.kind]}
              </span>
              {factLine(fact)}
            </li>
          ))}
          {facts.length === 0 && (
            <li className="rounded-lg border border-dashed border-surface-border px-3 py-6 text-center text-xs text-deck-500">
              You are running the floor this machine — no sheet, just the wrench.
            </li>
          )}
        </ul>
      )}
    </section>
  );
}
