'use client';

import { ArrowRight, Headset, PlayCircle } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@playdeck/ui';
import type { BombFactoryMode, BombFactoryState, Dossier } from '../types/bomb-factory.types';
import { BombFactoryDossier } from './BombFactoryDossier';

interface BombFactoryBriefingProps {
  state: BombFactoryState;
  mode: BombFactoryMode;
  dossiers: Dossier[];
  localSeatId: string | null;
  canStart: boolean;
  onStart: () => void;
}

function seatName(state: BombFactoryState, seatId: string): string {
  return state.seats.find((seat) => seat.id === seatId)?.displayName ?? 'Crew';
}

export function BombFactoryBriefing({
  state,
  mode,
  dossiers,
  localSeatId,
  canStart,
  onStart,
}: BombFactoryBriefingProps) {
  const [handoffIndex, setHandoffIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const isLocal = mode === 'local';
  const ordered = isLocal
    ? state.seats.map((seat) => dossiers.find((d) => d.seatId === seat.id)).filter(Boolean)
    : dossiers.filter((dossier) => dossier.seatId === localSeatId);
  const current = (isLocal ? ordered[handoffIndex] : ordered[0]) as Dossier | undefined;
  const isLastSeat = handoffIndex >= ordered.length - 1;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <section className="rounded-xl border border-amber-500/30 bg-surface-raised p-5">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400">
          Machine {state.machineIndex + 1} of {state.machinesInShift} · blueprint split
        </p>
        <h2 className="mt-1 font-display text-2xl font-black tracking-tight text-deck-950 dark:text-white">
          {state.spec?.name}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-deck-400">
          {state.spec?.partIds.length} steps, {state.spec?.timeLimitSeconds} seconds on the clock,
          and {state.spec?.faultPenaltySeconds}s burned for every wrong move. Nobody here has the
          whole blueprint — read your sheet out loud and trust the room.
        </p>

        {!isLocal && (
          <p className="mt-3 flex items-center gap-2 rounded-lg border border-surface-border bg-surface-overlay px-3 py-2 text-xs text-deck-300">
            <Headset className="h-4 w-4 shrink-0 text-amber-400" aria-hidden="true" />
            Open the voice dock before the clock starts. This machine cannot be built in silence.
          </p>
        )}
      </section>

      {isLocal && current && (
        <p className="rounded-lg border border-surface-border bg-surface-overlay px-3 py-2 text-center text-xs font-semibold text-deck-300">
          Hand the device to {seatName(state, current.seatId)} — sheet {handoffIndex + 1} of{' '}
          {ordered.length}
        </p>
      )}

      {current && (
        <BombFactoryDossier
          seatLabel={seatName(state, current.seatId)}
          facts={current.facts}
          hidden={isLocal && !revealed}
          onToggleHidden={isLocal ? () => setRevealed((open) => !open) : undefined}
        />
      )}

      <div className="flex flex-wrap items-center justify-end gap-2">
        {isLocal && !isLastSeat && (
          <Button
            variant="outline"
            onClick={() => {
              setHandoffIndex((index) => index + 1);
              setRevealed(false);
            }}
          >
            Next sheet <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
          </Button>
        )}

        {canStart && (!isLocal || isLastSeat) && (
          <Button variant="primary" onClick={onStart} className="font-black uppercase">
            <PlayCircle className="mr-1.5 h-4 w-4" aria-hidden="true" /> Start the line
          </Button>
        )}

        {!canStart && (
          <span className="text-xs text-deck-500">
            Read your sheet. The shift lead starts the clock.
          </span>
        )}
      </div>
    </div>
  );
}
