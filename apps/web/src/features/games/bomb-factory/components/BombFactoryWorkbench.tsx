'use client';

import { Loader2, Wrench } from 'lucide-react';
import React, { useMemo } from 'react';
import { Button } from '@playdeck/ui';
import {
  MATERIAL_LABELS,
  PART_CATALOG,
  STATION_CATALOG,
  TOOL_CATALOG,
} from '../engine/bomb-factory-constants';
import type { AssemblySelection, CompletedStep, MachineSpec } from '../types/bomb-factory.types';
import { BombFactoryPicker, type PickerOption } from './BombFactoryPicker';

interface BombFactoryWorkbenchProps {
  spec: MachineSpec;
  completedSteps: CompletedStep[];
  selection: AssemblySelection;
  onSelectionChange: (next: AssemblySelection) => void;
  onEngage: () => void;
  /** True for everyone but the seat holding the wrench this step. */
  readOnly: boolean;
  pending: boolean;
}

export function BombFactoryWorkbench({
  spec,
  completedSteps,
  selection,
  onSelectionChange,
  onEngage,
  readOnly,
  pending,
}: BombFactoryWorkbenchProps) {
  const usedParts = useMemo(
    () => new Set(completedSteps.map((step) => step.partId)),
    [completedSteps],
  );
  const usedBays = useMemo(
    () => new Set(completedSteps.map((step) => step.stationId)),
    [completedSteps],
  );

  const partOptions: PickerOption[] = PART_CATALOG.filter(
    (part) => spec.partIds.includes(part.id) && !usedParts.has(part.id),
  ).map((part) => ({
    id: part.id,
    label: part.name,
    glyph: part.glyph,
    hint: MATERIAL_LABELS[part.material],
  }));

  const bayOptions: PickerOption[] = STATION_CATALOG.filter(
    (station) => spec.stationIds.includes(station.id) && !usedBays.has(station.id),
  ).map((station) => ({ id: station.id, label: station.label }));

  const dialOptions: PickerOption[] = Array.from({ length: spec.maxDial }, (_, i) => ({
    id: String(i + 1),
    label: String(i + 1),
  }));

  const toolOptions: PickerOption[] = TOOL_CATALOG.filter((tool) =>
    spec.toolIds.includes(tool.id),
  ).map((tool) => ({ id: tool.id, label: tool.name, glyph: tool.glyph }));

  const ready =
    Boolean(selection.partId) && Boolean(selection.stationId) && Boolean(selection.toolId);
  const locked = readOnly || pending;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-surface-border bg-surface-raised p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-deck-900 dark:text-white">
          <Wrench className="h-4 w-4 text-amber-400" aria-hidden="true" />
          Workbench
        </h3>
        {readOnly && (
          <span className="rounded-full bg-surface-overlay px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-deck-400">
            Watching
          </span>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <BombFactoryPicker
          legend="Part"
          options={partOptions}
          value={selection.partId}
          disabled={locked}
          onChange={(partId) => onSelectionChange({ ...selection, partId })}
        />
        <BombFactoryPicker
          legend="Bay"
          options={bayOptions}
          value={selection.stationId}
          columns={3}
          disabled={locked}
          onChange={(stationId) => onSelectionChange({ ...selection, stationId })}
        />
        <BombFactoryPicker
          legend={`Dial (1-${spec.maxDial})`}
          options={dialOptions}
          value={String(selection.dial)}
          columns={4}
          disabled={locked}
          onChange={(dial) => onSelectionChange({ ...selection, dial: Number(dial) })}
        />
        <BombFactoryPicker
          legend="Tool"
          options={toolOptions}
          value={selection.toolId}
          columns={2}
          disabled={locked}
          onChange={(toolId) => onSelectionChange({ ...selection, toolId })}
        />
      </div>

      <Button
        variant="primary"
        onClick={onEngage}
        disabled={locked || !ready}
        className="w-full font-black uppercase tracking-wide"
      >
        {pending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            Checking the line…
          </>
        ) : (
          'Engage (Enter)'
        )}
      </Button>
    </div>
  );
}
