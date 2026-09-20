import type {
  FinalKingdomScore,
  KingdomPlayer,
  ResourceCard,
  ScoreCategorySummary,
  SecretObjective,
} from '../types/kingdom-draft.types';
import { KINGDOM_RESOURCE_CARDS, SECRET_OBJECTIVES } from './kingdom-cards';

export const GRID_SIZE = 3;
export const TOTAL_ROUNDS = 3;
export const PICKS_PER_ROUND = 3;
export const TOTAL_PICKS = GRID_SIZE * GRID_SIZE; // 9 picks

export function createEmptyGrid(): (ResourceCard | null)[][] {
  return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));
}

export function shuffleArray<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = result[i]!;
    result[i] = result[j]!;
    result[j] = temp;
  }
  return result;
}

export function generateDraftPool(playerCount: number): ResourceCard[] {
  const shuffled = shuffleArray(KINGDOM_RESOURCE_CARDS);
  const count = playerCount * 2 + 1;
  return shuffled.slice(0, count);
}

export function assignSecretObjectives(playerCount: number): SecretObjective[] {
  const shuffled = shuffleArray(SECRET_OBJECTIVES);
  return shuffled.slice(0, playerCount);
}

export function getSnakeDraftOrder(roundIndex: number, playerCount: number): number[] {
  const forward = Array.from({ length: playerCount }, (_, i) => i);
  return roundIndex % 2 === 0 ? forward : [...forward].reverse();
}

const NEIGHBOR_OFFSETS = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

export function calculateTileSynergy(
  grid: (ResourceCard | null)[][],
  row: number,
  col: number,
): number {
  const card = grid[row]?.[col];
  if (!card) return 0;

  let bonus = 0;
  for (const [dr, dc] of NEIGHBOR_OFFSETS) {
    const nr = row + dr;
    const nc = col + dc;
    if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
      const neighbor = grid[nr]?.[nc];
      if (neighbor && neighbor.category === card.synergyPartnerCategory) {
        bonus += card.synergyBonus;
      }
    }
  }
  return bonus;
}

export function calculateGridScore(grid: (ResourceCard | null)[][]): {
  basePoints: number;
  synergyPoints: number;
  totalScore: number;
} {
  let basePoints = 0;
  let synergyPoints = 0;

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const card = grid[r]?.[c];
      if (card) {
        basePoints += card.basePoints;
        synergyPoints += calculateTileSynergy(grid, r, c);
      }
    }
  }

  return {
    basePoints,
    synergyPoints,
    totalScore: basePoints + synergyPoints,
  };
}

export function checkSecretObjective(player: KingdomPlayer): boolean {
  if (!player.secretObjective) return false;

  const categoryCounts: Record<string, number> = {};
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const card = player.grid[r]?.[c];
      if (card) {
        categoryCounts[card.category] = (categoryCounts[card.category] ?? 0) + 1;
      }
    }
  }

  const { targetCategory } = player.secretObjective;
  if (targetCategory === 'diverse') {
    const required = ['land', 'people', 'gold', 'food', 'defense', 'culture'];
    return required.every((cat) => (categoryCounts[cat] ?? 0) >= 1);
  }

  return (categoryCounts[targetCategory] ?? 0) >= 3;
}

export function calculateFinalKingdomScores(players: KingdomPlayer[]): FinalKingdomScore[] {
  const scores = players.map((player) => {
    const gridScore = calculateGridScore(player.grid);
    const objectiveAchieved = checkSecretObjective(player);
    const objectivePoints =
      objectiveAchieved && player.secretObjective ? player.secretObjective.bonusPoints : 0;

    const breakdown: ScoreCategorySummary = {
      basePoints: gridScore.basePoints,
      synergyPoints: gridScore.synergyPoints,
      objectivePoints,
      totalScore: gridScore.totalScore + objectivePoints,
    };

    return {
      player: {
        ...player,
        score: breakdown.totalScore,
      },
      breakdown,
      objectiveAchieved,
      rank: 1,
    };
  });

  scores.sort((a, b) => b.breakdown.totalScore - a.breakdown.totalScore);
  scores.forEach((s, idx) => {
    s.rank = idx + 1;
  });

  return scores;
}
