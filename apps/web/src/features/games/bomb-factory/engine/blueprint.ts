import type {
  BombFactoryDifficulty,
  BombFactorySeat,
  MachineSpec,
} from '../types/bomb-factory.types';
import { PART_CATALOG, STATION_CATALOG, TOOL_CATALOG, tierFor } from './bomb-factory-constants';
import { createSeededRandom, shuffle } from './bomb-factory-rng';

/**
 * Builds the *public* half of a machine: which parts are on the bench, which
 * bays are open, how long the clock runs. Every answer a player needs to give
 * lives in a dossier, never here, so this is safe to broadcast in full.
 */
export function buildMachineSpec(
  difficulty: BombFactoryDifficulty,
  machineIndex: number,
  seed: number,
): MachineSpec {
  const tier = tierFor(difficulty);
  const index = Math.min(machineIndex, tier.stepsPerMachine.length - 1);
  const steps = tier.stepsPerMachine[index];
  const random = createSeededRandom(seed);

  const partIds = shuffle(PART_CATALOG, random)
    .slice(0, steps)
    .map((part) => part.id);
  const stationIds = shuffle(STATION_CATALOG, random)
    .slice(0, steps)
    .map((station) => station.id);
  const toolIds = TOOL_CATALOG.slice(0, tier.toolCount).map((tool) => tool.id);

  return {
    index: machineIndex,
    name: tier.machineNames[index] ?? `Machine ${machineIndex + 1}`,
    seed,
    // Catalog order keeps the bench stable on screen while the run sheet stays secret.
    partIds: PART_CATALOG.filter((part) => partIds.includes(part.id)).map((part) => part.id),
    stationIds: STATION_CATALOG.filter((station) => stationIds.includes(station.id)).map(
      (station) => station.id,
    ),
    toolIds,
    maxDial: tier.maxDial,
    timeLimitSeconds: tier.timeLimitSeconds,
    faultPenaltySeconds: tier.faultPenaltySeconds,
  };
}

export function machineCountFor(difficulty: BombFactoryDifficulty): number {
  return tierFor(difficulty).stepsPerMachine.length;
}

/**
 * The seat holding the wrench for a step. It walks round the room so nobody
 * sits out, and it is derived rather than broadcast so every client agrees.
 */
export function operatorSeatFor(
  seats: BombFactorySeat[],
  machineIndex: number,
  stepIndex: number,
): BombFactorySeat | null {
  if (seats.length === 0) return null;
  return seats[(machineIndex + stepIndex) % seats.length];
}
