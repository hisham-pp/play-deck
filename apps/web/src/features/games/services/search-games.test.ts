import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { GameDefinition } from '@playdeck/game-types';
import { filterGames } from './search-games';

const mockGames: GameDefinition[] = [
  {
    id: 'snake',
    name: 'Snake',
    slug: 'snake',
    description: 'Guide the snake, eat pellets, and grow.',
    category: 'arcade',
    players: { min: 1, max: 1 },
    status: 'available',
    tags: ['Retro', 'High Score', 'Classic'],
  },
  {
    id: 'tetris',
    name: 'Tetris',
    slug: 'tetris',
    description: 'Rotate and stack falling tetrominoes to clear lines.',
    category: 'puzzle',
    players: { min: 1, max: 1 },
    status: 'available',
    tags: ['Puzzle', 'Classic', 'Arcade'],
  },
  {
    id: 'chess',
    name: 'Master Chess',
    slug: 'master-chess',
    description: 'The timeless game of kings and strategy.',
    category: 'board',
    players: { min: 2, max: 2 },
    status: 'coming-soon',
    tags: ['Tactics', 'Board'],
  },
];

describe('filterGames', () => {
  it('returns all games when query is empty and category is all', () => {
    const result = filterGames(mockGames, { query: '', category: 'all' });
    assert.equal(result.length, 3);
  });

  it('filters by game title', () => {
    const result = filterGames(mockGames, { query: 'snake' });
    assert.equal(result.length, 1);
    assert.equal(result[0]?.id, 'snake');
  });

  it('filters case-insensitively by tag', () => {
    const result = filterGames(mockGames, { query: 'classic' });
    assert.equal(result.length, 2);
    assert.ok(result.some((g) => g.id === 'snake'));
    assert.ok(result.some((g) => g.id === 'tetris'));
  });

  it('filters by category selection', () => {
    const result = filterGames(mockGames, { category: 'puzzle' });
    assert.equal(result.length, 1);
    assert.equal(result[0]?.id, 'tetris');
  });

  it('combines category and search query correctly', () => {
    const result = filterGames(mockGames, { query: 'classic', category: 'arcade' });
    assert.equal(result.length, 1);
    assert.equal(result[0]?.id, 'snake');
  });

  it('returns empty array when nothing matches', () => {
    const result = filterGames(mockGames, { query: 'nonexistent-query-xyz' });
    assert.equal(result.length, 0);
  });
});
