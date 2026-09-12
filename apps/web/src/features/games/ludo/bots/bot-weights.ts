import type { LudoBotDifficulty, LudoBotPersonality } from '../types/ludo.types';

export interface LudoEvaluationWeights {
  capture: number;
  attack: number;
  progress: number;
  safety: number;
  leaveBase: number;
  randomJitter: number;
}

/** Base weights per difficulty - how strategically the bot evaluates moves at all. */
const DIFFICULTY_WEIGHTS: Record<LudoBotDifficulty, LudoEvaluationWeights> = {
  easy: { capture: 1, attack: 0.2, progress: 1, safety: 0.3, leaveBase: 1, randomJitter: 5 },
  normal: { capture: 3, attack: 1, progress: 1.5, safety: 2, leaveBase: 2, randomJitter: 1.5 },
  hard: { capture: 4, attack: 2, progress: 1.5, safety: 3.5, leaveBase: 2, randomJitter: 0.4 },
};

/** Multipliers layered on top of the difficulty weights - what the bot prioritizes. */
const PERSONALITY_MULTIPLIERS: Record<LudoBotPersonality, Partial<LudoEvaluationWeights>> = {
  aggressive: { capture: 1.5, attack: 1.5, safety: 0.6 },
  defensive: { safety: 1.8, capture: 0.8 },
  rusher: { progress: 1.8, safety: 0.8, capture: 0.9 },
  balanced: {},
};

export function resolveEvaluationWeights(
  difficulty: LudoBotDifficulty,
  personality: LudoBotPersonality,
): LudoEvaluationWeights {
  const base = DIFFICULTY_WEIGHTS[difficulty];
  const multipliers = PERSONALITY_MULTIPLIERS[personality];

  return {
    capture: base.capture * (multipliers.capture ?? 1),
    attack: base.attack * (multipliers.attack ?? 1),
    progress: base.progress * (multipliers.progress ?? 1),
    safety: base.safety * (multipliers.safety ?? 1),
    leaveBase: base.leaveBase * (multipliers.leaveBase ?? 1),
    randomJitter: base.randomJitter * (multipliers.randomJitter ?? 1),
  };
}
