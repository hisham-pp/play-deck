export type GameCategory = 'all' | 'puzzle' | 'strategy' | 'arcade' | 'board' | 'card' | 'casual';

export type GameStatus = 'available' | 'coming-soon' | 'maintenance';

export interface PlayerCapacity {
  min: number;
  max: number;
}

export type GameDifficultyPreset = 'easy' | 'normal' | 'hard' | 'expert';

export type StickmanGameSubtype =
  | 'runner'
  | 'platformer'
  | 'archery'
  | 'climber'
  | 'shooter'
  | 'parkour'
  | 'racing'
  | 'sword-fight'
  | 'ninja'
  | 'basketball';

export interface GameControlDefinition {
  action: string;
  key: string;
  description?: string;
  touchAction?: string;
}

export interface GameScorePayload {
  score: number;
  highScore?: number;
  durationMs?: number;
  metrics?: Record<string, number | string>;
  rank?: string;
}

export interface GameDefinition<TState = unknown> {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: GameCategory;
  players: PlayerCapacity;
  status: GameStatus;
  thumbnailUrl?: string;
  bannerUrl?: string;
  tags: string[];
  featured?: boolean;
  releaseDate?: string;
  badge?: string;
  controls?: GameControlDefinition[];
  difficultyPresets?: GameDifficultyPreset[];
  subtype?: StickmanGameSubtype | string;
  createGame?: () => TState;
}

export interface GameFilter {
  category?: GameCategory;
  search?: string;
  status?: GameStatus;
  featured?: boolean;
}

export interface BaseGameEngine<TState = unknown, TAction = unknown> {
  getState(): TState;
  dispatch(action: TAction): void;
  subscribe(listener: (state: TState) => void): () => void;
  reset(): void;
  destroy?(): void;
}
