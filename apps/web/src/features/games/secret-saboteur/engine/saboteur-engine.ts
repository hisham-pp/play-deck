import type {
  ContributionCard,
  RoundContribution,
  RoundSummary,
  SaboteurGameState,
  SaboteurPlayer,
  SectorMission,
} from '../types/secret-saboteur.types';

// ---------------------------------------------------------------------------
// Sector Mission Pool
// ---------------------------------------------------------------------------

export const SECTOR_MISSIONS: readonly SectorMission[] = [
  {
    id: 'power-grid',
    name: 'Power Grid',
    subsystem: 'Quantum Power Grid',
    description: 'Calibrate the primary quantum power conduits to sustain reactor output.',
    requiredComponents: 'Power regulators, conduit seals, flux capacitors',
  },
  {
    id: 'coolant',
    name: 'Coolant Conduits',
    subsystem: 'Coolant Circulation',
    description: 'Purge thermal runaway from the coolant loop before the core overheats.',
    requiredComponents: 'Coolant pumps, heat exchangers, pressure valves',
  },
  {
    id: 'shields',
    name: 'Magnetic Shields',
    subsystem: 'Magnetic Containment Field',
    description: 'Re-align the magnetic containment arrays to prevent plasma leakage.',
    requiredComponents: 'Superconductors, field emitters, shield projectors',
  },
  {
    id: 'stabilizers',
    name: 'Stabilizers',
    subsystem: 'Reactor Stabilization Core',
    description: 'Lock the reactor into stable output to complete the mission.',
    requiredComponents: 'Gyroscopic dampers, neutron moderators, control rods',
  },
  {
    id: 'comms',
    name: 'Comms Relay',
    subsystem: 'Communications Array',
    description: 'Restore the encrypted comms relay to coordinate the final push.',
    requiredComponents: 'Signal boosters, cipher modules, antenna arrays',
  },
];

// ---------------------------------------------------------------------------
// Contribution Card Templates
// ---------------------------------------------------------------------------

const REPAIR_CARD: ContributionCard = {
  id: 'repair',
  title: 'Power Surge',
  type: 'repair',
  powerDelta: 20,
  isSabotage: false,
  description: 'Channel a burst of energy into the reactor grid.',
  icon: '⚡',
};

const BOOST_CARD: ContributionCard = {
  id: 'boost',
  title: 'Calibrated Tune',
  type: 'boost',
  powerDelta: 15,
  isSabotage: false,
  description: 'Fine-tune the subsystem for optimal performance.',
  icon: '🔧',
};

const PATCH_CARD: ContributionCard = {
  id: 'patch',
  title: 'Cautious Patch',
  type: 'patch',
  powerDelta: 10,
  isSabotage: false,
  description: 'Apply a safe incremental fix to the damaged component.',
  icon: '🩹',
};

const FAULT_CARD: ContributionCard = {
  id: 'fault',
  title: 'Faulty Relay',
  type: 'fault',
  powerDelta: -15,
  isSabotage: true,
  description: 'Covertly introduce a defective relay into the subsystem.',
  icon: '💥',
};

const OVERLOAD_CARD: ContributionCard = {
  id: 'overload',
  title: 'Overload Spike',
  type: 'overload',
  powerDelta: -25,
  isSabotage: true,
  description: 'Trigger a catastrophic voltage spike in the power grid.',
  icon: '☢️',
};

export const ALL_CARDS: readonly ContributionCard[] = [
  REPAIR_CARD,
  BOOST_CARD,
  PATCH_CARD,
  FAULT_CARD,
  OVERLOAD_CARD,
];

// ---------------------------------------------------------------------------
// Hand Generation
// ---------------------------------------------------------------------------

/** Workers always get positive cards only. Saboteur gets the full deck. */
export function generateHand(isSaboteur: boolean): ContributionCard[] {
  const hand: ContributionCard[] = isSaboteur
    ? [REPAIR_CARD, BOOST_CARD, PATCH_CARD, FAULT_CARD, OVERLOAD_CARD]
    : [REPAIR_CARD, BOOST_CARD, PATCH_CARD, BOOST_CARD, REPAIR_CARD];

  // Deduplicate by id so each hand has unique card instances with unique ids
  return hand.map((card, idx) => ({ ...card, id: `${card.id}-${idx}` }));
}

// ---------------------------------------------------------------------------
// Role Assignment
// ---------------------------------------------------------------------------

export interface RoleAssignment {
  saboteurId: string;
  inspectorId: string | null;
}

/** Deterministically assigns one Saboteur and optionally one Inspector.  */
export function assignRoles(playerIds: string[], includeInspector: boolean): RoleAssignment {
  if (playerIds.length < 2) {
    return { saboteurId: playerIds[0] ?? '', inspectorId: null };
  }

  const shuffled = [...playerIds];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const saboteurId = shuffled[0];
  const inspectorId = includeInspector && shuffled.length >= 5 ? shuffled[1] : null;

  return { saboteurId, inspectorId: inspectorId ?? null };
}

// ---------------------------------------------------------------------------
// Contribution Shuffle
// ---------------------------------------------------------------------------

/** Returns anonymised, shuffled contributions (hidden who played what). */
export function shuffleContributions(
  contributions: { playerId: string; card: ContributionCard }[],
): RoundContribution[] {
  const result: RoundContribution[] = contributions.map(({ card }) => ({
    id: card.id,
    title: card.title,
    type: card.type,
    powerDelta: card.powerDelta,
    isSabotage: card.isSabotage,
    icon: card.icon,
  }));

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

// ---------------------------------------------------------------------------
// Round Resolution
// ---------------------------------------------------------------------------

export interface RoundResolutionParams {
  roundNumber: number;
  sector: SectorMission;
  players: SaboteurPlayer[];
  contributions: { playerId: string; card: ContributionCard }[];
  reactorProgress: number;
  meltdownStrikes: number;
}

export interface RoundResolutionResult {
  newProgress: number;
  newStrikes: number;
  meltdownAdded: boolean;
  shuffledContributions: RoundContribution[];
  roundSummary: RoundSummary;
  detainedPlayerId: string | null;
}

export function resolveRound({
  roundNumber,
  sector,
  players: _players,
  contributions,
  reactorProgress,
  meltdownStrikes,
}: RoundResolutionParams): RoundResolutionResult {
  const shuffled = shuffleContributions(contributions);
  const netDelta = shuffled.reduce((acc, c) => acc + c.powerDelta, 0);

  const rawProgress = reactorProgress + netDelta;
  const newProgress = Math.min(100, Math.max(0, rawProgress));
  const meltdownAdded = netDelta < 0 && rawProgress < reactorProgress;
  const newStrikes = meltdownAdded ? meltdownStrikes + 1 : meltdownStrikes;

  const roundSummary: RoundSummary = {
    roundNumber,
    sector,
    contributions: shuffled,
    netPowerDelta: netDelta,
    meltdownAdded,
    detainedPlayerId: null,
  };

  return {
    newProgress,
    newStrikes,
    meltdownAdded,
    shuffledContributions: shuffled,
    roundSummary,
    detainedPlayerId: null,
  };
}

// ---------------------------------------------------------------------------
// Accusation / Trial Vote Resolution
// ---------------------------------------------------------------------------

export interface TrialResolutionResult {
  detainedPlayerId: string | null;
  voteCounts: Record<string, number>;
  updatedPlayers: SaboteurPlayer[];
}

export function resolveTrialVote(
  players: SaboteurPlayer[],
  votes: Record<string, string | null>,
): TrialResolutionResult {
  const voteCounts: Record<string, number> = {};
  players.forEach((p) => {
    voteCounts[p.id] = 0;
  });

  Object.values(votes).forEach((targetId) => {
    if (targetId && voteCounts[targetId] !== undefined) {
      voteCounts[targetId] += 1;
    }
  });

  let highestVotes = 0;
  let leaderId: string | null = null;
  let isTie = false;

  Object.entries(voteCounts).forEach(([id, count]) => {
    if (count > highestVotes) {
      highestVotes = count;
      leaderId = id;
      isTie = false;
    } else if (count === highestVotes && count > 0) {
      isTie = true;
    }
  });

  const detainedPlayerId = !isTie && highestVotes >= 2 ? leaderId : null;

  const updatedPlayers = players.map((p) => {
    const va = voteCounts[p.id] ?? 0;
    if (p.id === detainedPlayerId) {
      return { ...p, isDetained: true, votesAgainst: va };
    }
    return { ...p, votesAgainst: va };
  });

  return { detainedPlayerId, voteCounts, updatedPlayers };
}

// ---------------------------------------------------------------------------
// Win Condition Check
// ---------------------------------------------------------------------------

export function checkWinCondition(state: SaboteurGameState): {
  winner: 'crew' | 'saboteur' | null;
  reason: string;
} {
  if (state.meltdownStrikes >= 3) {
    return { winner: 'saboteur', reason: 'The reactor suffered 3 critical meltdowns.' };
  }
  if (state.reactorProgress >= 100) {
    return { winner: 'crew', reason: 'The reactor core reached 100% — mission complete!' };
  }
  return { winner: null, reason: '' };
}
