import type {
  ArchitectAwardResult,
  ArchitectPlayer,
  ArchitectVote,
  BadArchitectState,
  Blueprint,
  Grid8x8,
} from '../types/bad-architect.types';
import { BLUEPRINTS, createEmptyGrid } from './blueprints';

export const DEFAULT_BUILD_SECONDS = 90;
export const DEFAULT_BUILD_TIME = DEFAULT_BUILD_SECONDS;
export const emptyGrid = createEmptyGrid;

export function calculateSimilarityScore(target: Grid8x8, player: Grid8x8): number {
  let targetFilledCount = 0;
  let correctColorMatches = 0;
  let wrongColorMatches = 0;
  let falsePositiveCount = 0;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const t = target[r]?.[c] ?? null;
      const p = player[r]?.[c] ?? null;

      if (t !== null) {
        targetFilledCount++;
        if (p === t) {
          correctColorMatches++;
        } else if (p !== null) {
          wrongColorMatches++;
        }
      } else if (p !== null) {
        // Player placed a block where target is empty
        falsePositiveCount++;
      }
    }
  }

  if (targetFilledCount === 0) return 100;

  // Base score from correctly placed colored blocks (100% max)
  const positiveRatio = (correctColorMatches + wrongColorMatches * 0.4) / targetFilledCount;

  // Penalty for excessive misplaced stray blocks
  const penalty = (falsePositiveCount * 0.5) / targetFilledCount;

  const rawPercent = Math.max(0, Math.min(1, positiveRatio - penalty)) * 100;
  return Math.round(rawPercent);
}

export function scoreGridAgainstBlueprint(grid: Grid8x8, blueprint: Blueprint): number {
  return calculateSimilarityScore(blueprint.grid, grid);
}

export function createInitialArchitectState(params: {
  players: ArchitectPlayer[];
  blueprint?: Blueprint;
  buildSeconds?: number;
  buildDuration?: number;
  maxRounds?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
}): BadArchitectState {
  const blueprint = params.blueprint ?? BLUEPRINTS[Math.floor(Math.random() * BLUEPRINTS.length)]!;
  const architect = params.players.find((p) => p.role === 'architect') ?? params.players[0]!;
  const maxRounds = params.maxRounds ?? Math.min(params.players.length, 5);
  const duration = params.buildDuration ?? params.buildSeconds ?? DEFAULT_BUILD_SECONDS;
  const difficulty = params.difficulty ?? blueprint.difficulty ?? 'medium';

  const roundIndices = params.players.map((_, i) => i);

  return {
    phase: 'building',
    round: 1,
    currentRound: 1,
    totalRounds: maxRounds,
    maxRounds,
    difficulty,
    blueprint,
    currentBlueprint: blueprint,
    architectId: architect.id,
    roundArchitectIndices: roundIndices,
    buildDurationSeconds: duration,
    buildStartTime: Date.now(),
    phaseStartTime: Date.now(),
    phaseDurationSeconds: duration,
    players: params.players,
    submissions: {},
    votes: [],
    awards: [],
    awardResult: null,
  };
}

export function rotateArchitect(
  players: ArchitectPlayer[],
  currentArchitectId: string,
): { updatedPlayers: ArchitectPlayer[]; nextArchitectId: string } {
  const currentIdx = players.findIndex((p) => p.id === currentArchitectId);
  const nextIdx = (currentIdx + 1) % players.length;
  const nextArchitect = players[nextIdx] ?? players[0]!;

  const updatedPlayers = players.map((p) => ({
    ...p,
    role: (p.id === nextArchitect.id ? 'architect' : 'builder') as ArchitectPlayer['role'],
    buildGrid: createEmptyGrid(),
    hasSubmitted: false,
    similarityScore: 0,
  }));

  return { updatedPlayers, nextArchitectId: nextArchitect.id };
}

export function tallyArchitectAwards(
  builders: ArchitectPlayer[],
  votes: ArchitectVote[],
): ArchitectAwardResult[] {
  if (builders.length === 0) return [];

  const results: ArchitectAwardResult[] = [];

  // Closest match award
  const closestVotes = votes.filter((v) => (v.award ?? v.awardType) === 'closest_match');
  const closestCounts = new Map<string, number>();
  for (const v of closestVotes) {
    const target = v.targetPlayerId ?? v.targetBuilderId ?? '';
    closestCounts.set(target, (closestCounts.get(target) ?? 0) + 1);
  }

  let topClosestPlayer = builders[0]!;
  let maxClosestVotes = 0;
  for (const b of builders) {
    const vCount = closestCounts.get(b.id) ?? 0;
    if (
      vCount > maxClosestVotes ||
      (vCount === maxClosestVotes && b.similarityScore > topClosestPlayer.similarityScore)
    ) {
      maxClosestVotes = vCount;
      topClosestPlayer = b;
    }
  }

  results.push({
    awardType: 'closest_match',
    title: 'Master Craftsman (Closest Match)',
    winnerId: topClosestPlayer.id,
    winnerName: topClosestPlayer.displayName,
    voteCount: maxClosestVotes,
    closestMatchPlayerId: topClosestPlayer.id,
  });

  // Funniest disaster award
  const disasterVotes = votes.filter((v) => (v.award ?? v.awardType) === 'funniest_disaster');
  const disasterCounts = new Map<string, number>();
  for (const v of disasterVotes) {
    const target = v.targetPlayerId ?? v.targetBuilderId ?? '';
    disasterCounts.set(target, (disasterCounts.get(target) ?? 0) + 1);
  }

  let topDisasterPlayer = builders[builders.length - 1] ?? builders[0]!;
  let maxDisasterVotes = 0;
  for (const b of builders) {
    const vCount = disasterCounts.get(b.id) ?? 0;
    if (
      vCount > maxDisasterVotes ||
      (vCount === maxDisasterVotes && b.similarityScore < topDisasterPlayer.similarityScore)
    ) {
      maxDisasterVotes = vCount;
      topDisasterPlayer = b;
    }
  }

  results.push({
    awardType: 'funniest_disaster',
    title: 'Hilarious Disaster (Most Creative Chaos)',
    winnerId: topDisasterPlayer.id,
    winnerName: topDisasterPlayer.displayName,
    voteCount: maxDisasterVotes,
    funniestDisasterPlayerId: topDisasterPlayer.id,
  });

  return results;
}

export function calculateAwards(
  submissions: Record<string, Grid8x8>,
  votes: ArchitectVote[],
  blueprint: Blueprint,
): ArchitectAwardResult {
  const builderIds = Object.keys(submissions);
  if (builderIds.length === 0) {
    return {
      closestMatchPlayerId: '',
      funniestDisasterPlayerId: '',
    };
  }

  // Calculate similarity scores for all submissions
  const scored = builderIds.map((id) => ({
    id,
    similarityScore: calculateSimilarityScore(blueprint.grid, submissions[id] ?? createEmptyGrid()),
    displayName: id,
    role: 'builder' as const,
    avatar: '📐',
    buildGrid: submissions[id] ?? createEmptyGrid(),
    hasSubmitted: true,
    score: 0,
    awardsReceived: [],
  }));

  const awards = tallyArchitectAwards(scored, votes);
  const closest = awards.find((a) => a.awardType === 'closest_match');
  const funniest = awards.find((a) => a.awardType === 'funniest_disaster');

  return {
    closestMatchPlayerId: closest?.winnerId ?? builderIds[0] ?? '',
    funniestDisasterPlayerId: funniest?.winnerId ?? builderIds[builderIds.length - 1] ?? '',
  };
}

export function calculateRoundScores(
  players: ArchitectPlayer[],
  architectId: string,
  awards: ArchitectAwardResult[],
  votes: ArchitectVote[],
): ArchitectPlayer[] {
  const builders = players.filter((p) => p.id !== architectId);
  const avgBuilderSimilarity =
    builders.length > 0
      ? Math.round(builders.reduce((sum, b) => sum + b.similarityScore, 0) / builders.length)
      : 0;

  return players.map((player) => {
    let roundPoints = 0;
    const wonAwardTitles: string[] = [];

    if (player.id === architectId) {
      // Architect gets points based on how well their builders performed on average
      roundPoints += Math.round(avgBuilderSimilarity * 0.6);
    } else {
      // Builder scores:
      // 1. Algorithmic accuracy points (up to 50 pts)
      roundPoints += Math.round(player.similarityScore * 0.5);

      // 2. Votes received (+5 pts each)
      const votesForMe = votes.filter(
        (v) => (v.targetPlayerId ?? v.targetBuilderId) === player.id,
      ).length;
      roundPoints += votesForMe * 5;

      // 3. Award wins (+25 pts)
      for (const a of awards) {
        if (
          a.winnerId === player.id ||
          a.closestMatchPlayerId === player.id ||
          a.funniestDisasterPlayerId === player.id
        ) {
          roundPoints += 25;
          if (a.title) wonAwardTitles.push(a.title);
        }
      }
    }

    return {
      ...player,
      score: player.score + roundPoints,
      awardsReceived: [...player.awardsReceived, ...wonAwardTitles],
    };
  });
}

export function applyRoundScores(
  state: BadArchitectState,
  awardResult: ArchitectAwardResult,
  votes: ArchitectVote[],
): BadArchitectState {
  const buildersWithScores = state.players.map((p) => {
    const grid = state.submissions[p.id];
    return {
      ...p,
      similarityScore: grid ? calculateSimilarityScore(state.blueprint.grid, grid) : 0,
    };
  });

  const updatedPlayers = calculateRoundScores(
    buildersWithScores,
    state.architectId,
    [awardResult],
    votes,
  );

  return {
    ...state,
    players: updatedPlayers,
    awardResult,
    votes,
  };
}

export function advanceRound(
  state: BadArchitectState,
  nextBlueprint: Blueprint,
): BadArchitectState {
  const nextRoundNum = state.currentRound + 1;
  const currentIdx = state.players.findIndex((p) => p.id === state.architectId);
  const nextIdx = (currentIdx + 1) % state.players.length;
  const nextArchitect = state.players[nextIdx] ?? state.players[0]!;

  const updatedPlayers = state.players.map((p) => ({
    ...p,
    role: (p.id === nextArchitect.id ? 'architect' : 'builder') as ArchitectPlayer['role'],
    buildGrid: createEmptyGrid(),
    hasSubmitted: false,
    similarityScore: 0,
  }));

  return {
    ...state,
    phase: 'building',
    round: nextRoundNum,
    currentRound: nextRoundNum,
    blueprint: nextBlueprint,
    currentBlueprint: nextBlueprint,
    architectId: nextArchitect.id,
    players: updatedPlayers,
    submissions: {},
    votes: [],
    awards: [],
    awardResult: null,
    phaseStartTime: Date.now(),
    phaseDurationSeconds: state.buildDurationSeconds,
  };
}
