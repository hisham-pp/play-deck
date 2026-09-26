export type RoundOutcomeInput = {
  coopCount: number;
  betrayCount: number;
  round: number;
};

export function calculateRoundOutcome({ coopCount, betrayCount, round }: RoundOutcomeInput) {
  if (betrayCount === 0) {
    return {
      round,
      groupReward: coopCount * 30,
      betrayBonus: 0,
      roundSummary: 'Everyone cooperated and the group earned a clean bonus.',
    };
  }

  if (betrayCount === 1) {
    const betrayBonus = 24 + round * 9;
    return {
      round,
      groupReward: 20,
      betrayBonus,
      roundSummary: 'A lone betrayal paid off, but the group took a hit.',
    };
  }

  return {
    round,
    groupReward: 0,
    betrayBonus: 0,
    roundSummary: 'Multiple betrayals collapsed the round and no one profited.',
  };
}

export function nextRoundNumber(currentRound: number) {
  return currentRound + 1;
}

export function resolvePlayerChoice(
  choice: 'cooperate' | 'betray',
  round: number,
  trustScore: number,
) {
  if (choice === 'cooperate') {
    return 18 + (round - 1) * 6 + trustScore * 4;
  }

  return 24 + round * 12 + trustScore * 4;
}
