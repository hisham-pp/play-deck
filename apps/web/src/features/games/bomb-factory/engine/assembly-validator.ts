import type {
  AssemblySubmission,
  BlueprintChannel,
  ChannelVerdict,
  DistributionPlan,
  Dossier,
  DossierFact,
} from '../types/bomb-factory.types';
import { CHANNELS, partById } from './bomb-factory-constants';
import { ownerOf } from './information-splitter';

/**
 * The scope key each channel indexes an attempt by: the step for the run sheet,
 * the part for the bay and dial, the material for the safety notice.
 */
export function channelKey(channel: BlueprintChannel, submission: AssemblySubmission): string {
  switch (channel) {
    case 'order':
      return String(submission.stepIndex);
    case 'safety':
      return partById(submission.partId)?.material ?? '';
    default:
      return submission.partId;
  }
}

function ruleOn(
  fact: DossierFact,
  channel: BlueprintChannel,
  submission: AssemblySubmission,
): boolean | null {
  if (fact.kind !== channel) return null;

  switch (fact.kind) {
    case 'order':
      return fact.stepIndex === submission.stepIndex ? fact.partId === submission.partId : null;
    case 'routing':
      return fact.partId === submission.partId ? fact.stationId === submission.stationId : null;
    case 'calibration':
      return fact.partId === submission.partId ? fact.dial === submission.dial : null;
    default: {
      const material = partById(submission.partId)?.material;
      return fact.material === material ? !fact.forbiddenToolIds.includes(submission.toolId) : null;
    }
  }
}

/**
 * Rules on every dimension this dossier can see — and only those. A seat can
 * fail an attempt on its own channel without ever learning why the other three
 * passed or failed, which is what keeps the blueprint split.
 */
export function verdictsFrom(
  dossier: Dossier,
  plan: DistributionPlan,
  submission: AssemblySubmission,
): ChannelVerdict[] {
  const verdicts: ChannelVerdict[] = [];

  for (const channel of CHANNELS) {
    if (ownerOf(plan, channel, channelKey(channel, submission)) !== dossier.seatId) continue;

    const ruling = dossier.facts.reduce<boolean | null>(
      (found, fact) => found ?? ruleOn(fact, channel, submission),
      null,
    );
    if (ruling === null) continue;

    verdicts.push({ attemptId: submission.attemptId, channel, seatId: dossier.seatId, ok: ruling });
  }

  return verdicts;
}

/** The channels that must rule before an attempt can resolve. */
export function requiredChannelsFor(
  plan: DistributionPlan,
  submission: AssemblySubmission,
): BlueprintChannel[] {
  return CHANNELS.filter(
    (channel) => ownerOf(plan, channel, channelKey(channel, submission)) !== null,
  );
}

/** Local play holds every dossier on one device, so it rules on all four at once. */
export function verdictsFromAll(
  dossiers: Dossier[],
  plan: DistributionPlan,
  submission: AssemblySubmission,
): ChannelVerdict[] {
  return dossiers.flatMap((dossier) => verdictsFrom(dossier, plan, submission));
}
