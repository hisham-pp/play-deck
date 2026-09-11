import { GameDefinition, GameFilter, GameCategory } from '@playdeck/game-types';

export class GameRegistry {
  private games: Map<string, GameDefinition> = new Map();

  constructor(initialGames: GameDefinition[] = []) {
    initialGames.forEach((game) => this.register(game));
  }

  register(game: GameDefinition): void {
    this.games.set(game.id, game);
  }

  get(id: string): GameDefinition | null {
    return this.games.get(id) || null;
  }

  getBySlug(slug: string): GameDefinition | null {
    for (const game of this.games.values()) {
      if (game.slug === slug) {
        return game;
      }
    }
    return null;
  }

  list(filter?: GameFilter): GameDefinition[] {
    let result = Array.from(this.games.values());

    if (!filter) return result;

    if (filter.category && filter.category !== 'all') {
      result = result.filter((g) => g.category === filter.category);
    }

    if (filter.status) {
      result = result.filter((g) => g.status === filter.status);
    }

    if (filter.featured !== undefined) {
      result = result.filter((g) => !!g.featured === filter.featured);
    }

    if (filter.search && filter.search.trim() !== '') {
      const term = filter.search.toLowerCase().trim();
      result = result.filter(
        (g) =>
          g.name.toLowerCase().includes(term) ||
          g.description.toLowerCase().includes(term) ||
          g.tags.some((t) => t.toLowerCase().includes(term))
      );
    }

    return result;
  }

  getCategories(): GameCategory[] {
    const categories = new Set<GameCategory>();
    for (const game of this.games.values()) {
      categories.add(game.category);
    }
    return Array.from(categories);
  }
}
