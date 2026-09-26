import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  GAME_DEFINITIONS,
  GAME_CONTENT,
  getGameContent,
  getGameDefinition,
  getGamesByCategory,
  filterGames,
  gameCatalogRegistry,
} from '../index';
import { defineGame } from './base-game';
import { GameCatalogRegistry } from './catalog-registry';

describe('GameCatalogRegistry', () => {
  it('loads all definitions and content', () => {
    assert.ok(GAME_DEFINITIONS.length > 0, 'should have registered definitions');
    assert.ok(Object.keys(GAME_CONTENT).length > 0, 'should have registered content');
  });

  it('finds game by ID or slug', () => {
    const snake = getGameDefinition('snake');
    assert.ok(snake);
    assert.equal(snake?.id, 'snake');
    assert.equal(snake?.name, 'Snake');

    const bySlug = gameCatalogRegistry.getBySlug('snake');
    assert.equal(bySlug?.id, 'snake');
  });

  it('finds content by game ID', () => {
    const snakeContent = getGameContent('snake');
    assert.ok(snakeContent);
    assert.equal(snakeContent?.id, 'snake');
    assert.ok(snakeContent?.overview.length > 0);
  });

  it('filters games by category and search queries', () => {
    const arcadeGames = getGamesByCategory('arcade');
    assert.ok(arcadeGames.length > 0);
    assert.ok(arcadeGames.every((g) => g.category === 'arcade'));

    const searchResults = filterGames({ search: 'chess' });
    assert.ok(
      searchResults.some((g) => g.id === 'master-chess' || g.name.toLowerCase().includes('chess')),
    );
  });

  it('segregates available and coming-soon games in registry instance', () => {
    const customRegistry = new GameCatalogRegistry([
      defineGame({
        id: 'live-game',
        name: 'Live Game',
        description: 'Available now',
        category: 'arcade',
        players: { min: 1, max: 2 },
        status: 'available',
      }),
      defineGame({
        id: 'future-game',
        name: 'Future Game',
        description: 'Coming soon',
        category: 'puzzle',
        players: { min: 1, max: 4 },
        status: 'coming-soon',
      }),
    ]);

    const available = customRegistry.getAvailableGames();
    const comingSoon = customRegistry.getComingSoonGames();

    assert.equal(available.length, 1);
    assert.equal(comingSoon.length, 1);
    assert.equal(available[0].id, 'live-game');
    assert.equal(comingSoon[0].id, 'future-game');
  });
});
