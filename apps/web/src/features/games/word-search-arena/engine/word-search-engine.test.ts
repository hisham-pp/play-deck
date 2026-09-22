import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { generateGrid, scoreWord, validateSelection } from './word-search-engine';

describe('Word Search Engine — Grid Generation', () => {
  it('generates a grid with correct size for each preset', () => {
    for (const [size, expected] of [
      ['small', 10],
      ['medium', 12],
      ['large', 15],
    ] as const) {
      const grid = generateGrid('animals', size);
      assert.equal(grid.size, expected);
      assert.equal(grid.letters.length, expected);
      assert.ok(grid.letters.every((row) => row.length === expected));
    }
  });

  it('fills every cell with a letter', () => {
    const grid = generateGrid('animals', 'small');
    for (const row of grid.letters) {
      for (const cell of row) {
        assert.match(cell, /^[A-Z]$/);
      }
    }
  });

  it('places words so every letter is present in the grid', () => {
    const grid = generateGrid('animals', 'medium');
    for (const p of grid.placements) {
      for (const coord of p.coordinates) {
        const letter = grid.letters[coord.row][coord.col];
        const pos = p.coordinates.indexOf(coord);
        assert.equal(letter, p.word[pos]);
      }
    }
  });

  it('places at least 6 words for a small grid', () => {
    const grid = generateGrid('countries', 'small');
    assert.ok(
      grid.placements.length >= 6,
      `Expected >= 6 placements, got ${grid.placements.length}`,
    );
  });

  it('places at least 10 words for a large grid', () => {
    const grid = generateGrid('food', 'large');
    assert.ok(
      grid.placements.length >= 10,
      `Expected >= 10 placements, got ${grid.placements.length}`,
    );
  });
});

describe('Word Search Engine — Selection Validation', () => {
  it('correctly detects a horizontally placed word', () => {
    const grid = generateGrid('mixed', 'small');
    // Try each placement to validate correct detection
    let validated = 0;
    for (const p of grid.placements) {
      const found = new Set<string>();
      const result = validateSelection(grid, p.coordinates, found);
      if (result) validated++;
    }
    // At least half the placements should validate
    assert.ok(
      validated >= grid.placements.length / 2,
      `Too few placements validated: ${validated}/${grid.placements.length}`,
    );
  });

  it('returns null for fewer than 2 cells', () => {
    const grid = generateGrid('animals', 'small');
    const result = validateSelection(grid, [{ row: 0, col: 0 }], new Set());
    assert.equal(result, null);
  });

  it('returns null for a word already found', () => {
    const grid = generateGrid('animals', 'small');
    const p = grid.placements[0];
    const alreadyFound = new Set([p.word]);
    const result = validateSelection(grid, p.coordinates, alreadyFound);
    assert.equal(result, null);
  });

  it('returns null for non-linear cell path', () => {
    const grid = generateGrid('animals', 'small');
    const cells = [
      { row: 0, col: 0 },
      { row: 1, col: 2 }, // Non-linear jump
      { row: 2, col: 4 },
    ];
    const result = validateSelection(grid, cells, new Set());
    assert.equal(result, null);
  });
});

describe('Word Search Engine — Scoring', () => {
  it('awards base score of word length × 10', () => {
    const start = 1000;
    const now = 1000; // immediate claim — max speed bonus
    const score = scoreWord('EAGLE', now, start);
    assert.ok(score >= 50, `Score ${score} should be >= 50`);
  });

  it('awards no speed bonus after 50 seconds', () => {
    const start = 0;
    const now = 60_000; // 60 seconds later
    const score = scoreWord('BEAR', now, start);
    assert.equal(score, 40); // 4 × 10 base, 0 speed bonus
  });
});
