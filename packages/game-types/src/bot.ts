export type BotDifficulty = 'easy' | 'normal' | 'hard';

export interface ScoredAction<TAction = unknown> {
  action: TAction;
  score: number;
}

/**
 * Cross-game bot contract. A strategy only ever chooses among the legal
 * actions handed to it by the game engine - it never invents moves, never
 * sees hidden information, and never mutates state directly.
 */
export interface BotStrategy<TState = unknown, TAction = unknown> {
  chooseAction(state: TState, playerId: string, legalActions: TAction[]): TAction;
  evaluateActions?(
    state: TState,
    playerId: string,
    legalActions: TAction[],
  ): ScoredAction<TAction>[];
}

export interface BotDefinition<TState = unknown, TAction = unknown> {
  id: string;
  name: string;
  description: string;
  difficulty: BotDifficulty;
  personality: string;
  avatar?: string;
  strategy: BotStrategy<TState, TAction>;
}
