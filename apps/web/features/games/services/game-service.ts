import { GameDefinition, GameFilter } from '@playdeck/game-types';
import { GameRepository, defaultGameRepository } from './game-repository';

export class GameService {
  private repository: GameRepository;

  constructor(repository: GameRepository = defaultGameRepository) {
    this.repository = repository;
  }

  async listGames(filter?: GameFilter): Promise<GameDefinition[]> {
    return this.repository.getGames(filter);
  }

  async findGame(id: string): Promise<GameDefinition | null> {
    return this.repository.getGame(id);
  }

  async getFeaturedGames(): Promise<GameDefinition[]> {
    return this.repository.getFeatured();
  }

  async getAvailableCategories() {
    return this.repository.getCategories();
  }
}

export const gameService = new GameService();
