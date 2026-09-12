import type { BotDefinition } from '@playdeck/game-types';
import type {
  LudoAction,
  LudoBotDifficulty,
  LudoBotPersonality,
  LudoGameState,
} from '../types/ludo.types';
import { createScoredMoveStrategy } from './bot-strategy';
import { resolveEvaluationWeights } from './bot-weights';

export type LudoBotDefinition = Omit<
  BotDefinition<LudoGameState, LudoAction>,
  'difficulty' | 'personality'
> & {
  difficulty: LudoBotDifficulty;
  personality: LudoBotPersonality;
};

function buildBotDefinition(
  id: string,
  name: string,
  difficulty: LudoBotDifficulty,
  personality: LudoBotPersonality,
): LudoBotDefinition {
  const weights = resolveEvaluationWeights(difficulty, personality);
  return {
    id,
    name,
    description: `${difficulty} difficulty, ${personality} personality`,
    difficulty,
    personality,
    strategy: createScoredMoveStrategy(weights),
  };
}

const DIFF_NORMAL: LudoBotDifficulty = 'normal';
const DIFF_HARD: LudoBotDifficulty = 'hard';
const PERS_BALANCED: LudoBotPersonality = 'balanced';

/**
 * Default bot roster. New personalities/difficulties are added here without
 * touching the engine or the bot strategy implementation.
 */
export const LUDO_BOT_DEFINITIONS: LudoBotDefinition[] = [
  buildBotDefinition('nova-easy-balanced', 'Nova', 'easy', PERS_BALANCED),
  buildBotDefinition('nova-normal-aggressive', 'Nova', DIFF_NORMAL, 'aggressive'),
  buildBotDefinition('nova-hard-aggressive', 'Nova', DIFF_HARD, 'aggressive'),
  buildBotDefinition('atlas-normal-defensive', 'Atlas', DIFF_NORMAL, 'defensive'),
  buildBotDefinition('atlas-hard-defensive', 'Atlas', DIFF_HARD, 'defensive'),
  buildBotDefinition('luna-normal-rusher', 'Luna', DIFF_NORMAL, 'rusher'),
  buildBotDefinition('luna-hard-rusher', 'Luna', DIFF_HARD, 'rusher'),
  buildBotDefinition('sage-easy-balanced', 'Sage', 'easy', PERS_BALANCED),
  buildBotDefinition('sage-normal-balanced', 'Sage', DIFF_NORMAL, PERS_BALANCED),
  buildBotDefinition('sage-hard-balanced', 'Sage', DIFF_HARD, PERS_BALANCED),
];

export function getBotDefinition(id: string): LudoBotDefinition | undefined {
  return LUDO_BOT_DEFINITIONS.find((bot) => bot.id === id);
}

export function findBotDefinitionsByDifficulty(difficulty: LudoBotDifficulty): LudoBotDefinition[] {
  return LUDO_BOT_DEFINITIONS.filter((bot) => bot.difficulty === difficulty);
}

/**
 * Builds an ad-hoc bot definition from a difficulty/personality pair without
 * requiring an entry in the static roster above - used when a lobby lets a
 * host pick difficulty and personality independently.
 */
export function createCustomBotDefinition(
  difficulty: LudoBotDifficulty,
  personality: LudoBotPersonality,
  name = 'Bot',
): LudoBotDefinition {
  return buildBotDefinition(`custom-${difficulty}-${personality}`, name, difficulty, personality);
}
