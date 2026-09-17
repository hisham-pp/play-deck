import type { GameCategory, GameDefinition } from '@playdeck/game-types';

export interface SearchOptions {
  query?: string;
  category?: GameCategory | 'all';
}

export function filterGames(
  games: GameDefinition[],
  { query = '', category = 'all' }: SearchOptions,
): GameDefinition[] {
  const normalizedQuery = query.trim().toLowerCase();

  return games.filter((game) => {
    // 1. Category filter
    const matchesCategory =
      category === 'all' || game.category.toLowerCase() === category.toLowerCase();
    if (!matchesCategory) return false;

    // 2. Query filter
    if (!normalizedQuery) return true;

    const nameMatches = game.name.toLowerCase().includes(normalizedQuery);
    const descMatches = game.description.toLowerCase().includes(normalizedQuery);
    const categoryMatches = game.category.toLowerCase().includes(normalizedQuery);
    const idMatches = game.id.toLowerCase().includes(normalizedQuery);
    const tagMatches = game.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery));

    return nameMatches || descMatches || categoryMatches || idMatches || tagMatches;
  });
}
