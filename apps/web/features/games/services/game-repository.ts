import { GameDefinition, GameFilter, GameCategory } from '@playdeck/game-types';
import { GameRegistry } from '@playdeck/game-core';
import { GAME_DEFINITIONS } from '@/data/games';

export interface GameRepository {
  getGames(filter?: GameFilter): Promise<GameDefinition[]>;
  getGame(idOrSlug: string): Promise<GameDefinition | null>;
  getCategories(): Promise<GameCategory[]>;
  getFeatured(): Promise<GameDefinition[]>;
}

export class LocalGameRepository implements GameRepository {
  private registry: GameRegistry;

  constructor() {
    this.registry = new GameRegistry(GAME_DEFINITIONS);
  }

  async getGames(filter?: GameFilter): Promise<GameDefinition[]> {
    return this.registry.list(filter);
  }

  async getGame(idOrSlug: string): Promise<GameDefinition | null> {
    const byId = this.registry.get(idOrSlug);
    if (byId) return byId;
    return this.registry.getBySlug(idOrSlug);
  }

  async getCategories(): Promise<GameCategory[]> {
    return ['all', 'strategy', 'arcade', 'board', 'puzzle', 'card', 'casual'];
  }

  async getFeatured(): Promise<GameDefinition[]> {
    return this.registry.list({ featured: true });
  }
}

export const defaultGameRepository = new LocalGameRepository();
