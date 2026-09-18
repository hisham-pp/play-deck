import {
  CHANNEL_LABELS,
  MATERIAL_LABELS,
  partById,
  stationById,
  toolById,
} from '../engine/bomb-factory-constants';
import type { BlueprintChannel, DossierFact } from '../types/bomb-factory.types';

export function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function partName(partId: string): string {
  return partById(partId)?.name ?? partId;
}

export function stationName(stationId: string): string {
  return stationById(stationId)?.label ?? stationId;
}

export function toolName(toolId: string): string {
  return toolById(toolId)?.name ?? toolId;
}

/** One line of a dossier, written the way a player would read it out loud. */
export function factLine(fact: DossierFact): string {
  switch (fact.kind) {
    case 'order':
      return `Step ${fact.stepIndex + 1} installs the ${partName(fact.partId)}.`;
    case 'routing':
      return `The ${partName(fact.partId)} goes in ${stationName(fact.stationId)}.`;
    case 'calibration':
      return `The ${partName(fact.partId)} is set to dial ${fact.dial}.`;
    default:
      return `${MATERIAL_LABELS[fact.material]} must never meet the ${fact.forbiddenToolIds
        .map(toolName)
        .join(', the ')}.`;
  }
}

export function channelOf(fact: DossierFact): BlueprintChannel {
  return fact.kind;
}

export function channelLabel(channel: BlueprintChannel): string {
  return CHANNEL_LABELS[channel];
}

/** Sort order that keeps a dossier readable: run sheet first, safety last. */
const CHANNEL_WEIGHT: Record<BlueprintChannel, number> = {
  order: 0,
  routing: 1,
  calibration: 2,
  safety: 3,
};

export function sortFacts(facts: DossierFact[]): DossierFact[] {
  return [...facts].sort((a, b) => {
    const weight = CHANNEL_WEIGHT[a.kind] - CHANNEL_WEIGHT[b.kind];
    if (weight !== 0) return weight;
    if (a.kind === 'order' && b.kind === 'order') return a.stepIndex - b.stepIndex;
    return 0;
  });
}
