import type {
  ChannelAssignment,
  DistributionPlan,
  Dossier,
  DossierFact,
  MachineSpec,
  PartMaterial,
} from '../types/bomb-factory.types';
import { CHANNELS, partById } from './bomb-factory-constants';
import { createSeededRandom, randomInt, shuffle } from './bomb-factory-rng';

/** Channels split first when there are more seats than channels. */
const SPLITTABLE: ChannelAssignment['channel'][] = ['order', 'routing'];

function baseAssignment(
  channel: ChannelAssignment['channel'],
  spec: MachineSpec,
  random: () => number,
): ChannelAssignment {
  const steps = spec.partIds.length;
  switch (channel) {
    case 'order':
      return {
        channel,
        seatId: '',
        scope: Array.from({ length: steps }, (_, i) => String(i)),
        pool: shuffle(spec.partIds, random),
      };
    case 'routing':
      return {
        channel,
        seatId: '',
        scope: [...spec.partIds],
        pool: shuffle(spec.stationIds, random),
      };
    case 'calibration':
      return { channel, seatId: '', scope: [...spec.partIds], pool: [] };
    default:
      return { channel, seatId: '', scope: materialsIn(spec), pool: [] };
  }
}

export function materialsIn(spec: MachineSpec): PartMaterial[] {
  const seen: PartMaterial[] = [];
  for (const partId of spec.partIds) {
    const material = partById(partId)?.material;
    if (material && !seen.includes(material)) seen.push(material);
  }
  return seen;
}

/** Cuts one assignment in half, keeping `scope` and `pool` aligned index for index. */
function splitAssignment(assignment: ChannelAssignment): ChannelAssignment[] {
  const half = Math.ceil(assignment.scope.length / 2);
  if (half >= assignment.scope.length) return [assignment];

  return [
    {
      ...assignment,
      scope: assignment.scope.slice(0, half),
      pool: assignment.pool.slice(0, half),
    },
    {
      ...assignment,
      scope: assignment.scope.slice(half),
      pool: assignment.pool.slice(half),
    },
  ];
}

/**
 * Decides who holds which slice of the blueprint. The plan is public on
 * purpose — it says *who to ask*, never *what the answer is* — so every client
 * can route a verdict request without learning anything it should not.
 */
export function buildDistributionPlan(
  spec: MachineSpec,
  seatIds: string[],
  seed: number,
): DistributionPlan {
  if (seatIds.length === 0) return [];
  const random = createSeededRandom(seed ^ 0x9e3779b9);

  let assignments = CHANNELS.map((channel) => baseAssignment(channel, spec, random));

  // More seats than channels: split the biggest channels so nobody sits idle.
  let toSplit = seatIds.length - assignments.length;
  for (const channel of SPLITTABLE) {
    if (toSplit <= 0) break;
    const index = assignments.findIndex((a) => a.channel === channel);
    if (index < 0) continue;
    const pieces = splitAssignment(assignments[index]);
    if (pieces.length === 1) continue;
    assignments = [...assignments.slice(0, index), ...pieces, ...assignments.slice(index + 1)];
    toSplit -= 1;
  }

  const rotation = shuffle(seatIds, random);
  return shuffle(assignments, random).map((assignment, index) => ({
    ...assignment,
    seatId: rotation[index % rotation.length],
  }));
}

/**
 * Draws one seat's private facts. Each seat calls this for itself with its own
 * unguessable randomness, so the answers are never transmitted and no client —
 * host included — can assemble the whole blueprint.
 */
export function generateDossier(
  spec: MachineSpec,
  plan: DistributionPlan,
  seatId: string,
  random: () => number,
): Dossier {
  const facts: DossierFact[] = [];

  for (const assignment of plan.filter((entry) => entry.seatId === seatId)) {
    switch (assignment.channel) {
      case 'order': {
        const parts = shuffle(assignment.pool, random);
        assignment.scope.forEach((step, i) => {
          facts.push({ kind: 'order', stepIndex: Number(step), partId: parts[i] });
        });
        break;
      }
      case 'routing': {
        const bays = shuffle(assignment.pool, random);
        assignment.scope.forEach((partId, i) => {
          facts.push({ kind: 'routing', partId, stationId: bays[i] });
        });
        break;
      }
      case 'calibration': {
        for (const partId of assignment.scope) {
          facts.push({ kind: 'calibration', partId, dial: randomInt(random, 1, spec.maxDial) });
        }
        break;
      }
      default: {
        for (const material of assignment.scope) {
          const forbidden = shuffle(spec.toolIds, random).slice(0, spec.toolIds.length - 1);
          facts.push({
            kind: 'safety',
            material: material as PartMaterial,
            forbiddenToolIds: forbidden,
          });
        }
      }
    }
  }

  return { seatId, machineIndex: spec.index, facts };
}

/** Which seat can rule on one dimension of an attempt, or null when nobody can. */
export function ownerOf(
  plan: DistributionPlan,
  channel: ChannelAssignment['channel'],
  key: string,
): string | null {
  const assignment = plan.find((entry) => entry.channel === channel && entry.scope.includes(key));
  return assignment?.seatId ?? null;
}
