export type GameCategory = 'all' | 'puzzle' | 'strategy' | 'arcade' | 'board' | 'card' | 'casual';

export type GameStatus = 'available' | 'coming-soon' | 'maintenance';

export interface PlayerCapacity {
  min: number;
  max: number;
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
  createGame?: () => TState;
}

export interface GameFilter {
  category?: GameCategory;
  search?: string;
  status?: GameStatus;
  featured?: boolean;
}
