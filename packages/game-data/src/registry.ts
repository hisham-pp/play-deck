import type { GameCategory, GameDefinition, GameFilter } from '@playdeck/game-types';
import { GAME_CONTENT, getGameContent } from './content';
import type { GamePackage } from './core/base-game';
import { GameCatalogRegistry } from './core/catalog-registry';
import { GAME_DEFINITIONS } from './definitions';

export const gameCatalogRegistry = new GameCatalogRegistry(
  GAME_DEFINITIONS,
  Object.values(GAME_CONTENT),
);

export function getGameDefinition(idOrSlug: string): GameDefinition | undefined {
  return gameCatalogRegistry.getByIdOrSlug(idOrSlug);
}

export function getGamePackage(idOrSlug: string): GamePackage | undefined {
  return gameCatalogRegistry.getPackage(idOrSlug);
}

export function getAllGamePackages(): GamePackage[] {
  return gameCatalogRegistry.getAllPackages();
}

export function getAvailableGames(): GameDefinition[] {
  return gameCatalogRegistry.getAvailableGames();
}

export function getComingSoonGames(): GameDefinition[] {
  return gameCatalogRegistry.getComingSoonGames();
}

export function getFeaturedGames(): GameDefinition[] {
  return gameCatalogRegistry.getFeaturedGames();
}

export function getGamesByCategory(category: GameCategory): GameDefinition[] {
  return gameCatalogRegistry.getByCategory(category);
}

export function filterGames(filter: GameFilter): GameDefinition[] {
  return gameCatalogRegistry.filter(filter);
}

export function filterGamePackages(filter: GameFilter): GamePackage[] {
  return gameCatalogRegistry.filterPackages(filter);
}

export { GAME_DEFINITIONS, GAME_CONTENT, getGameContent };
