'use client';

import { LogOut } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Button } from '@playdeck/ui';
import type { SelectPayload } from '../services/bomb-factory-protocol';
import type {
  AssemblySelection,
  BombFactoryMode,
  BombFactorySeat,
  BombFactoryState,
  Dossier,
} from '../types/bomb-factory.types';
import { partName, stationName, toolName } from '../utils/bomb-factory-format';
import { BombFactoryCrew } from './BombFactoryCrew';
import { BombFactoryDossier } from './BombFactoryDossier';
import { BombFactoryFaultLog } from './BombFactoryFaultLog';
import { BombFactoryHud } from './BombFactoryHud';
import { BombFactoryWorkbench } from './BombFactoryWorkbench';

interface BombFactoryArenaProps {
  state: BombFactoryState;
  mode: BombFactoryMode;
  secondsLeft: number;
  dossiers: Dossier[];
  localSeatId: string | null;
  operator: BombFactorySeat | null;
  selection: AssemblySelection;
  onSelectionChange: (next: AssemblySelection) => void;
  onEngage: () => void;
  remoteSelection: SelectPayload | null;
  reducedMotion: boolean;
  onLeave: () => void;
}

function describe(selection: AssemblySelection): string {
  const part = selection.partId ? partName(selection.partId) : 'nothing yet';
  const bay = selection.stationId ? stationName(selection.stationId) : 'no bay';
  const tool = selection.toolId ? toolName(selection.toolId) : 'no tool';
  return `${part} → ${bay}, dial ${selection.dial}, ${tool}`;
}

export function BombFactoryArena({
  state,
  mode,
  secondsLeft,
  dossiers,
  localSeatId,
  operator,
  selection,
  onSelectionChange,
  onEngage,
  remoteSelection,
  reducedMotion,
  onLeave,
}: BombFactoryArenaProps) {
  const isLocal = mode === 'local';
  const isOperator = Boolean(operator && (isLocal || operator.id === localSeatId));

  const [viewSeatId, setViewSeatId] = useState<string | null>(null);
  const [covered, setCovered] = useState(isLocal);

  // On one device the sheet on screen follows whoever is holding the wrench.
  useEffect(() => {
    if (!isLocal) return;
    setViewSeatId(operator?.id ?? null);
    setCovered(true);
  }, [isLocal, operator?.id]);

  const shownSeatId = isLocal ? (viewSeatId ?? operator?.id ?? null) : localSeatId;
  const shown = dossiers.find((dossier) => dossier.seatId === shownSeatId);
  const shownSeat = state.seats.find((seat) => seat.id === shownSeatId);

  return (
    <div className="flex w-full flex-col gap-4">
      <BombFactoryHud state={state} secondsLeft={secondsLeft} reducedMotion={reducedMotion} />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-4">
          <p
            aria-live="polite"
            className="rounded-lg border border-surface-border bg-surface-overlay px-3 py-2 text-xs font-semibold text-deck-300"
          >
            {isOperator
              ? `You have the wrench for step ${state.currentStep + 1}. Ask the room what goes in.`
              : `${operator?.displayName ?? 'Nobody'} has the wrench for step ${state.currentStep + 1}. Read them your sheet.`}
          </p>

          <BombFactoryWorkbench
            spec={state.spec!}
            completedSteps={state.completedSteps}
            selection={selection}
            onSelectionChange={onSelectionChange}
            onEngage={onEngage}
            readOnly={!isOperator}
            pending={Boolean(state.pendingAttempt)}
          />

          {!isOperator && remoteSelection && (
            <p className="rounded-lg border border-surface-border bg-surface-raised px-3 py-2 text-xs text-deck-400">
              <span className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-amber-400">
                Lining up
              </span>{' '}
              {describe(remoteSelection.selection)}
            </p>
          )}

          <BombFactoryFaultLog faults={state.faults} reducedMotion={reducedMotion} />
        </div>

        <div className="flex flex-col gap-4">
          {isLocal && (
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Whose sheet to show">
              {state.seats.map((seat) => (
                <Button
                  key={seat.id}
                  size="sm"
                  variant={seat.id === shownSeatId ? 'primary' : 'outline'}
                  onClick={() => {
                    setViewSeatId(seat.id);
                    setCovered(true);
                  }}
                >
                  {seat.displayName}
                </Button>
              ))}
            </div>
          )}

          <BombFactoryDossier
            seatLabel={shownSeat?.displayName ?? 'Your sheet'}
            facts={shown?.facts ?? []}
            hidden={isLocal && covered}
            onToggleHidden={isLocal ? () => setCovered((value) => !value) : undefined}
          />

          <BombFactoryCrew
            seats={state.seats}
            plan={state.plan}
            operatorSeatId={operator?.id ?? null}
            localSeatId={localSeatId}
          />

          <Button variant="ghost" size="sm" onClick={onLeave} className="self-end text-deck-400">
            <LogOut className="mr-1.5 h-4 w-4" aria-hidden="true" /> Clock off
          </Button>
        </div>
      </div>
    </div>
  );
}
