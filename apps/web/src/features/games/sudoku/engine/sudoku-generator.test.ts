import assert from 'node:assert';
import { describe, it } from 'node:test';
import type { SudokuDifficulty } from '../types/sudoku.types';
import {
  CELL_COUNT,
  DIFFICULTY_CONFIG,
  DIFFICULTY_ORDER,
  EMPTY_CELL,
  GRID_SIZE,
  getDifficultyConfig,
  isSudokuDifficulty,
} from './sudoku-constants';
import {
  createBlankPuzzle,
  digHoles,
  generatePuzzle,
  generateSolvedGrid,
  mirrorIndex,
} from './sudoku-generator';
import { UNITS, createEmptyValues, toIndex } from './sudoku-grid';
import { createSeededRandom } from './sudoku-random';
import { countSolutions, hasUniqueSolution, solve } from './sudoku-solver';
import { findConflicts, isSolved } from './sudoku-validator';

function clueCount(values: number[]): number {
  return values.filter((value) => value !== EMPTY_CELL).length;
}

describe('solver', () => {
  it('solves an empty grid into a valid complete board', () => {
    const solved = solve(createEmptyValues(), createSeededRandom(1));
    assert.ok(solved);
    assert.ok(isSolved(solved));
  });

  it('produces different grids for different seeds', () => {
    const a = generateSolvedGrid(createSeededRandom(1));
    const b = generateSolvedGrid(createSeededRandom(2));
    assert.notDeepStrictEqual(a, b);
  });

  it('is reproducible for the same seed', () => {
    const a = generateSolvedGrid(createSeededRandom(42));
    const b = generateSolvedGrid(createSeededRandom(42));
    assert.deepStrictEqual(a, b);
  });

  it('returns null for a contradictory board', () => {
    const values = createEmptyValues();
    values[toIndex(0, 0)] = 1;
    values[toIndex(0, 1)] = 1;
    assert.strictEqual(solve(values), null);
  });

  it('counts exactly one solution for a solved grid', () => {
    const solved = generateSolvedGrid(createSeededRandom(5));
    assert.strictEqual(countSolutions(solved), 1);
    assert.ok(hasUniqueSolution(solved));
  });

  it('stops counting at the requested limit', () => {
    // An empty grid has billions of solutions; the cap keeps this instant.
    assert.strictEqual(countSolutions(createEmptyValues(), 2), 2);
    assert.strictEqual(countSolutions(createEmptyValues(), 5), 5);
  });

  it('detects a puzzle with more than one solution', () => {
    const sparse = createEmptyValues();
    sparse[0] = 1;
    assert.ok(!hasUniqueSolution(sparse));
    assert.ok(countSolutions(sparse, 2) > 1);
  });
});

describe('generateSolvedGrid', () => {
  it('fills every unit with the digits 1-9 exactly once', () => {
    const solved = generateSolvedGrid(createSeededRandom(13));
    assert.strictEqual(solved.length, CELL_COUNT);

    for (const unit of UNITS) {
      const digits = unit.map((index) => solved[index]).sort((x, y) => x - y);
      assert.deepStrictEqual(digits, [1, 2, 3, 4, 5, 6, 7, 8, 9]);
    }
  });
});

describe('digHoles', () => {
  it('never removes so much that the solution becomes ambiguous', () => {
    const solution = generateSolvedGrid(createSeededRandom(21));
    const puzzle = digHoles(solution, 40, true, createSeededRandom(22));

    assert.ok(hasUniqueSolution(puzzle));
    assert.ok(clueCount(puzzle) < CELL_COUNT);
  });

  it('keeps every remaining clue faithful to the solution', () => {
    const solution = generateSolvedGrid(createSeededRandom(23));
    const puzzle = digHoles(solution, 36, true, createSeededRandom(24));

    puzzle.forEach((value, index) => {
      if (value !== EMPTY_CELL) assert.strictEqual(value, solution[index]);
    });
  });

  it('digs symmetric pairs together', () => {
    const solution = generateSolvedGrid(createSeededRandom(25));
    const puzzle = digHoles(solution, 45, true, createSeededRandom(26));

    // Symmetric digging removes and restores mirrored cells as a pair, so a
    // hole should never face a surviving clue across the board centre.
    const asymmetricHoles = puzzle.filter(
      (value, index) => value === EMPTY_CELL && puzzle[mirrorIndex(index)] !== EMPTY_CELL,
    );
    assert.strictEqual(asymmetricHoles.length, 0);
  });

  it('mirrors indices through the board centre', () => {
    assert.strictEqual(mirrorIndex(0), CELL_COUNT - 1);
    assert.strictEqual(mirrorIndex(CELL_COUNT - 1), 0);
    assert.strictEqual(mirrorIndex(toIndex(4, 4)), toIndex(4, 4));
  });
});

describe('generatePuzzle', () => {
  const sampled: SudokuDifficulty[] = ['starter', 'medium', 'expert'];

  for (const difficulty of sampled) {
    it('produces a valid, uniquely solvable puzzle: ' + difficulty, () => {
      const puzzle = generatePuzzle(difficulty, createSeededRandom(101));

      assert.strictEqual(puzzle.difficulty, difficulty);
      assert.strictEqual(puzzle.givens.length, CELL_COUNT);
      assert.ok(isSolved(puzzle.solution), 'solution must be a complete valid grid');
      assert.deepStrictEqual(findConflicts(puzzle.givens), [], 'givens must not conflict');
      assert.ok(hasUniqueSolution(puzzle.givens), 'puzzle must have exactly one solution');

      const solved = solve(puzzle.givens);
      assert.deepStrictEqual(solved, puzzle.solution);
    });
  }

  it('reports the clue count it actually achieved', () => {
    const puzzle = generatePuzzle('medium', createSeededRandom(55));
    assert.strictEqual(puzzle.clueCount, clueCount(puzzle.givens));
  });

  it('gives harder levels no more clues than easier ones', () => {
    const starter = generatePuzzle('starter', createSeededRandom(77));
    const expert = generatePuzzle('expert', createSeededRandom(77));

    assert.ok(
      expert.clueCount <= starter.clueCount,
      'expert (' + expert.clueCount + ') should not exceed starter (' + starter.clueCount + ')',
    );
    assert.ok(starter.clueCount >= GRID_SIZE * 2);
  });
});

describe('difficulty ladder', () => {
  it('exposes every level in increasing order of difficulty', () => {
    assert.strictEqual(DIFFICULTY_ORDER.length, 7);

    for (let i = 1; i < DIFFICULTY_ORDER.length; i++) {
      const previous = DIFFICULTY_CONFIG[DIFFICULTY_ORDER[i - 1]];
      const current = DIFFICULTY_CONFIG[DIFFICULTY_ORDER[i]];

      assert.ok(
        current.targetClues < previous.targetClues,
        current.id + ' should start with fewer clues than ' + previous.id,
      );
      assert.ok(current.maxMistakes <= previous.maxMistakes);
      assert.ok(current.hints <= previous.hints);
    }
  });

  it('falls back to the default config for an unknown level', () => {
    const config = getDifficultyConfig('nope' as SudokuDifficulty);
    assert.strictEqual(config.id, 'medium');
  });

  it('recognises valid difficulty ids', () => {
    assert.ok(isSudokuDifficulty('insane'));
    assert.ok(!isSudokuDifficulty('nightmare'));
    assert.ok(!isSudokuDifficulty(3));
  });

  it('creates an empty placeholder puzzle', () => {
    const blank = createBlankPuzzle('hard');
    assert.strictEqual(blank.clueCount, 0);
    assert.strictEqual(blank.difficulty, 'hard');
    assert.ok(blank.givens.every((value) => value === EMPTY_CELL));
  });
});
