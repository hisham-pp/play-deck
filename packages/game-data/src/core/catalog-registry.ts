import type { GameCategory, GameContent, GameDefinition, GameFilter } from '@playdeck/game-types';
import { GameStatuses } from '../enums/status.enum';
import type { GamePackage } from './base-game';

export class GameCatalogRegistry {
  private readonly definitions: GameDefinition[];
  private readonly contentMap: Map<string, GameContent>;
  private readonly idIndex: Map<string, GameDefinition>;
  private readonly slugIndex: Map<string, GameDefinition>;

  constructor(definitions: GameDefinition[] = [], contents: GameContent[] = []) {
    this.definitions = [...definitions];
    this.contentMap = new Map(contents.map((c) => [c.id, c]));
    this.idIndex = new Map(definitions.map((d) => [d.id, d]));
    this.slugIndex = new Map(definitions.map((d) => [d.slug, d]));
  }

  getAllDefinitions(): GameDefinition[] {
    return [...this.definitions];
  }

  getAllContent(): GameContent[] {
    return Array.from(this.contentMap.values());
  }

  getAllPackages(): GamePackage[] {
    return this.definitions.map((definition) => ({
      definition,
      content: this.contentMap.get(definition.id),
    }));
  }

  getById(id: string): GameDefinition | undefined {
    return this.idIndex.get(id);
  }

  getBySlug(slug: string): GameDefinition | undefined {
    return this.slugIndex.get(slug);
  }

  getByIdOrSlug(idOrSlug: string): GameDefinition | undefined {
    return this.idIndex.get(idOrSlug) ?? this.slugIndex.get(idOrSlug);
  }

  getContent(id: string): GameContent | undefined {
    return this.contentMap.get(id);
  }

  getPackage(idOrSlug: string): GamePackage | undefined {
    const definition = this.getByIdOrSlug(idOrSlug);
    if (!definition) return undefined;
    return {
      definition,
      content: this.contentMap.get(definition.id),
    };
  }

  getAvailableGames(): GameDefinition[] {
    return this.definitions.filter((d) => d.status === GameStatuses.AVAILABLE);
  }

  getComingSoonGames(): GameDefinition[] {
    return this.definitions.filter((d) => d.status === GameStatuses.COMING_SOON);
  }

  getFeaturedGames(): GameDefinition[] {
    return this.definitions.filter((d) => d.featured);
  }

  getByCategory(category: GameCategory): GameDefinition[] {
    if (category === 'all') return this.definitions;
    return this.definitions.filter((d) => d.category === category);
  }

  filter(filter: GameFilter): GameDefinition[] {
    return this.definitions.filter((game) => {
      if (filter.category && filter.category !== 'all' && game.category !== filter.category) {
        return false;
      }
      if (filter.status && game.status !== filter.status) {
        return false;
      }
      if (filter.featured !== undefined && game.featured !== filter.featured) {
        return false;
      }
      if (filter.search) {
        const query = filter.search.toLowerCase();
        const matchesName = game.name.toLowerCase().includes(query);
        const matchesDesc = game.description.toLowerCase().includes(query);
        const matchesTags = game.tags.some((tag) => tag.toLowerCase().includes(query));
        if (!matchesName && !matchesDesc && !matchesTags) {
          return false;
        }
      }
      return true;
    });
  }

  filterPackages(filter: GameFilter): GamePackage[] {
    const filteredDefs = this.filter(filter);
    return filteredDefs.map((definition) => ({
      definition,
      content: this.contentMap.get(definition.id),
    }));
  }
}
