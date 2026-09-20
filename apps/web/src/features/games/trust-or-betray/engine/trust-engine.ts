import type {
  MissionObjective,
  PlayerChoice,
  RoundOutcome,
  RoundResult,
  TrustLevel,
  TrustPlayer,
} from '../types/trust-or-betray.types';

export const MISSION_POOL: readonly MissionObjective[] = [
  {
    id: 'vault-heist',
    name: 'Core Vault Infiltration',
    category: 'Heist',
    description: 'Bypass quantum biometric sentries to crack the bullion core.',
    basePot: 300,
    bonusMultiplier: 1.0,
  },
  {
    id: 'grid-hack',
    name: 'Orbital Grid Subnet',
    category: 'Cyber',
    description: 'Disrupt security firewalls across the orbital communications grid.',
    basePot: 360,
    bonusMultiplier: 1.2,
  },
  {
    id: 'life-support',
    name: 'Oxygen Matrix Override',
    category: 'Survival',
    description: 'Rebalance atmospheric pressure pods before cabin hypoxia triggers.',
    basePot: 420,
    bonusMultiplier: 1.5,
  },
  {
    id: 'plasma-bridge',
    name: 'Reactor Conduit Coupling',
    category: 'Engineering',
    description: 'Align dual magnetic stabilizers over molten plasma chambers.',
    basePot: 480,
    bonusMultiplier: 1.8,
  },
  {
    id: 'outpost-defense',
    name: 'Sentry Perimeter Stand',
    category: 'Tactical',
    description: 'Repel rogue assault drones targeting the planetary relay antenna.',
    basePot: 540,
    bonusMultiplier: 2.0,
  },
];

export const STREAK_MULTIPLIERS = [1.0, 1.25, 1.5, 2.0] as const;

export function getStreakMultiplier(streak: number): number {
  if (streak <= 0) return STREAK_MULTIPLIERS[0];
  if (streak === 1) return STREAK_MULTIPLIERS[1];
  if (streak === 2) return STREAK_MULTIPLIERS[2];
  return STREAK_MULTIPLIERS[3];
}

export function calculateTrustLevel(rating: number): TrustLevel {
  if (rating >= 80) return 'devoted';
  if (rating >= 60) return 'loyal';
  if (rating >= 40) return 'neutral';
  if (rating >= 20) return 'shaky';
  return 'traitor';
}

export function updatePlayerTrust(player: TrustPlayer): {
  rating: number;
  level: TrustLevel;
} {
  const total = player.cooperationCount + player.betrayalCount;
  if (total === 0) {
    return { rating: 50, level: 'neutral' };
  }
  const rating = Math.round((player.cooperationCount / total) * 100);
  return { rating, level: calculateTrustLevel(rating) };
}

export interface RoundResolutionParams {
  roundNumber: number;
  mission: MissionObjective;
  players: TrustPlayer[];
  choices: Record<string, PlayerChoice>;
  cooperationStreak: number;
}

export interface RoundResolutionResult {
  outcome: RoundOutcome;
  pot: number;
  scoreDeltas: Record<string, number>;
  newStreak: number;
  updatedPlayers: TrustPlayer[];
  roundResult: RoundResult;
}

export function resolveRoundOutcomes({
  roundNumber,
  mission,
  players,
  choices,
  cooperationStreak,
}: RoundResolutionParams): RoundResolutionResult {
  const activePlayers = players.filter((p) => !p.isExiled);
  const activeCount = activePlayers.length;

  const betrayers = activePlayers.filter((p) => choices[p.id] === 'betray');
  const cooperators = activePlayers.filter((p) => choices[p.id] === 'cooperate');

  let outcome: RoundOutcome;
  let newStreak: number;
  const scoreDeltas: Record<string, number> = {};
  players.forEach((p) => {
    scoreDeltas[p.id] = 0;
  });

  const basePot = mission.basePot;
  let effectivePot = basePot;

  if (activeCount === 0) {
    outcome = 'mutual_ruin';
    newStreak = 0;
  } else if (betrayers.length === 0) {
    outcome = 'all_cooperate';
    newStreak = cooperationStreak + 1;
    const multiplier = getStreakMultiplier(cooperationStreak);
    effectivePot = Math.round(basePot * multiplier);
    const splitReward = Math.floor(effectivePot / activeCount);

    cooperators.forEach((p) => {
      scoreDeltas[p.id] = splitReward;
    });
  } else if (betrayers.length === 1) {
    outcome = 'solo_betray';
    newStreak = 0;
    const soloBonus = 50;
    const soloWinner = betrayers[0];
    scoreDeltas[soloWinner.id] = effectivePot + soloBonus;
  } else if (betrayers.length === activeCount) {
    outcome = 'mutual_ruin';
    newStreak = 0;
  } else {
    outcome = 'failed_betray';
    newStreak = 0;
  }

  const updatedPlayers = players.map((p) => {
    if (p.isExiled) {
      const remaining = Math.max(0, p.exileRoundsRemaining - 1);
      return {
        ...p,
        isExiled: remaining > 0,
        exileRoundsRemaining: remaining,
        currentChoice: null,
        hasLockedIn: false,
      };
    }

    const playerChoice = choices[p.id];
    const isCoop = playerChoice === 'cooperate';
    const isBetray = playerChoice === 'betray';

    const newCoopCount = p.cooperationCount + (isCoop ? 1 : 0);
    const newBetrayCount = p.betrayalCount + (isBetray ? 1 : 0);
    const totalDecisions = newCoopCount + newBetrayCount;
    const rating = totalDecisions === 0 ? 50 : Math.round((newCoopCount / totalDecisions) * 100);

    const delta = scoreDeltas[p.id] ?? 0;

    return {
      ...p,
      score: p.score + delta,
      cooperationCount: newCoopCount,
      betrayalCount: newBetrayCount,
      trustRating: rating,
      trustLevel: calculateTrustLevel(rating),
      currentChoice: playerChoice ?? null,
      hasLockedIn: false,
    };
  });

  const roundResult: RoundResult = {
    roundNumber,
    mission,
    pot: effectivePot,
    outcome,
    choices: { ...choices },
    scoreDeltas,
  };

  return {
    outcome,
    pot: effectivePot,
    scoreDeltas,
    newStreak,
    updatedPlayers,
    roundResult,
  };
}

export interface ExileResolutionResult {
  exiledPlayerId: string | null;
  voteCounts: Record<string, number>;
  updatedPlayers: TrustPlayer[];
}

export function resolveExileTrial(
  players: TrustPlayer[],
  votes: Record<string, string | null>,
): ExileResolutionResult {
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

  const exiledPlayerId = !isTie && highestVotes >= 2 ? leaderId : null;

  const updatedPlayers = players.map((p) => {
    const votesAgainst = voteCounts[p.id] ?? 0;
    if (p.id === exiledPlayerId) {
      return {
        ...p,
        isExiled: true,
        exileRoundsRemaining: 1,
        score: Math.max(0, p.score - 80),
        votesAgainst,
      };
    }
    return {
      ...p,
      votesAgainst,
    };
  });

  return {
    exiledPlayerId,
    voteCounts,
    updatedPlayers,
  };
}
