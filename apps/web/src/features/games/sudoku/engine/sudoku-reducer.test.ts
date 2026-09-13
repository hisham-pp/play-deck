import assert from 'node:assert';
import { describe, it } from 'node:test';
import type { SudokuState } from '../types/sudoku.types';
import {
  EMPTY_CELL,
  STATUS_COMPLETED,
  STATUS_FAILED,
  STATUS_IDLE,
  STATUS_PAUSED,
  STATUS_PLAYING,
  getDifficultyConfig,
} from './sudoku-constants';
import { toIndex } from './sudoku-grid';
import { createSeededRandom } from './sudoku-random';
import { sudokuReducer } from './sudoku-reducer';
import { createInitialSudokuState } from './sudoku-state';

const SEED = 2024;

function startedState(difficulty: SudokuState['difficulty'] = 'medium'): SudokuState {
  const initial = createInitialSudokuState(difficulty);
  return sudokuReducer(initial, { type: 'NEW_PUZZLE', difficulty }, createSeededRandom(SEED));
}

/** Index of the first empty cell, i.e. one the player is allowed to fill. */
function firstEmpty(state: SudokuState, skip: number = 0): number {
  let seen = 0;
  for (let index = 0; index < state.cells.length; index++) {
    if (state.cells[index].value !== EMPTY_CELL) continue;
    if (seen === skip) return index;
    seen++;
  }
  throw new Error('board has no empty cells');
}

function select(state: SudokuState, index: number): SudokuState {
  return sudokuReducer(state, { type: 'SELECT_CELL', index });
}

function enter(state: SudokuState, index: number, digit: number): SudokuState {
  return sudokuReducer(select(state, index), { type: 'SET_DIGIT', digit });
}

/** A wrong-but-not-solution digit for `index`. */
function wrongDigit(state: SudokuState, index: number): number {
  const correct = state.puzzle.solution[index];
  return correct === 9 ? 1 : correct + 1;
}

function fillFromSolution(state: SudokuState): SudokuState {
  let next = state;
  for (let index = 0; index < next.cells.length; index++) {
    if (next.cells[index].value !== EMPTY_CELL) continue;
    next = enter(next, index, next.puzzle.solution[index]);
  }
  return next;
}

describe('NEW_PUZZLE', () => {
  it('starts a playable run with locked givens', () => {
    const state = startedState('medium');

    assert.strictEqual(state.status, STATUS_PLAYING);
    assert.strictEqual(state.difficulty, 'medium');
    assert.ok(state.puzzle.clueCount > 0);
    assert.strictEqual(state.elapsedMs, 0);
    assert.strictEqual(state.mistakes, 0);
    assert.deepStrictEqual(state.conflicts, []);
    assert.deepStrictEqual(state.history, []);

    state.cells.forEach((cell, index) => {
      assert.strictEqual(cell.given, state.puzzle.givens[index] !== EMPTY_CELL);
      assert.strictEqual(cell.value, state.puzzle.givens[index]);
    });
  });

  it('selects the first empty cell so keyboard play starts somewhere useful', () => {
    const state = startedState();
    assert.strictEqual(state.selectedIndex, firstEmpty(state));
  });

  it('applies the difficulty budget for mistakes and hints', () => {
    const state = startedState('insane');
    const config = getDifficultyConfig('insane');

    assert.strictEqual(state.maxMistakes, config.maxMistakes);
    assert.strictEqual(state.hintsRemaining, config.hints);
  });

  it('switches difficulty when asked', () => {
    const state = sudokuReducer(
      startedState('easy'),
      { type: 'NEW_PUZZLE', difficulty: 'hard' },
      createSeededRandom(7),
    );

    assert.strictEqual(state.difficulty, 'hard');
    assert.strictEqual(state.puzzle.difficulty, 'hard');
  });

  it('keeps the known best time across a new puzzle', () => {
    const withBest = { ...startedState(), bestTimeMs: 90_000 };
    const next = sudokuReducer(withBest, { type: 'NEW_PUZZLE' }, createSeededRandom(3));

    assert.strictEqual(next.bestTimeMs, 90_000);
    assert.strictEqual(next.isNewBestTime, false);
  });
});

describe('selection', () => {
  it('moves within the board and stops at the edges', () => {
    let state = select(startedState(), toIndex(0, 0));

    state = sudokuReducer(state, { type: 'MOVE_SELECTION', rowDelta: 0, colDelta: -1 });
    assert.strictEqual(state.selectedIndex, toIndex(0, 0), 'cannot leave the left edge');

    state = sudokuReducer(state, { type: 'MOVE_SELECTION', rowDelta: 1, colDelta: 1 });
    assert.strictEqual(state.selectedIndex, toIndex(1, 1));

    state = select(state, toIndex(8, 8));
    state = sudokuReducer(state, { type: 'MOVE_SELECTION', rowDelta: 1, colDelta: 0 });
    assert.strictEqual(state.selectedIndex, toIndex(8, 8), 'cannot leave the bottom edge');
  });

  it('ignores out-of-range selections', () => {
    const state = startedState();
    assert.strictEqual(select(state, -1), state);
    assert.strictEqual(select(state, 81), state);
  });
});

describe('digit entry', () => {
  it('places a correct digit without counting a mistake', () => {
    const state = startedState();
    const index = firstEmpty(state);
    const next = enter(state, index, state.puzzle.solution[index]);

    assert.strictEqual(next.cells[index].value, state.puzzle.solution[index]);
    assert.strictEqual(next.mistakes, 0);
    assert.deepStrictEqual(next.errors, []);
    assert.strictEqual(next.lastEvent?.type, 'placed');
  });

  it('counts a wrong digit as a mistake and flags the cell', () => {
    const state = startedState();
    const index = firstEmpty(state);
    const next = enter(state, index, wrongDigit(state, index));

    assert.strictEqual(next.mistakes, 1);
    assert.ok(next.errors.includes(index));
    assert.strictEqual(next.lastEvent?.type, 'mistake');
    assert.strictEqual(next.status, STATUS_PLAYING);
  });

  it('refuses to overwrite a given', () => {
    const state = startedState();
    const givenIndex = state.cells.findIndex((cell) => cell.given);
    const next = enter(state, givenIndex, 5);

    assert.strictEqual(next.cells[givenIndex].value, state.cells[givenIndex].value);
    assert.strictEqual(next.lastEvent?.type, 'locked');
    assert.strictEqual(next.mistakes, 0);
  });

  it('clears the cell when the same digit is entered twice', () => {
    const state = startedState();
    const index = firstEmpty(state);
    const digit = state.puzzle.solution[index];

    const placed = enter(state, index, digit);
    const toggled = sudokuReducer(placed, { type: 'SET_DIGIT', digit });

    assert.strictEqual(toggled.cells[index].value, EMPTY_CELL);
    assert.strictEqual(toggled.lastEvent?.type, 'cleared');
  });

  it('rejects digits outside 1-9', () => {
    const state = startedState();
    assert.strictEqual(sudokuReducer(state, { type: 'SET_DIGIT', digit: 0 }), state);
    assert.strictEqual(sudokuReducer(state, { type: 'SET_DIGIT', digit: 10 }), state);
  });

  it('ignores input once the run is over', () => {
    const paused = sudokuReducer(startedState(), { type: 'PAUSE' });
    assert.strictEqual(sudokuReducer(paused, { type: 'SET_DIGIT', digit: 4 }), paused);
  });
});

describe('conflict detection', () => {
  it('marks a duplicate against its peer, and clears it when removed', () => {
    const state = startedState();
    const given = state.cells.findIndex((cell) => cell.given);
    const digit = state.cells[given].value;

    // Find an empty peer in the same row as that given.
    const row = Math.floor(given / 9);
    const target = state.cells.findIndex(
      (cell, index) => Math.floor(index / 9) === row && cell.value === EMPTY_CELL,
    );

    const placed = enter(state, target, digit);
    assert.ok(placed.conflicts.includes(target), 'placed digit conflicts');
    assert.ok(placed.conflicts.includes(given), 'the given it clashes with is flagged too');

    const cleared = sudokuReducer(placed, { type: 'CLEAR_CELL' });
    assert.ok(!cleared.conflicts.includes(target));
    assert.ok(!cleared.conflicts.includes(given));
  });
});

describe('mistake budget', () => {
  it('fails the run once the budget is spent', () => {
    let state = startedState('insane');
    assert.strictEqual(state.maxMistakes, 1);

    const index = firstEmpty(state);
    state = enter(state, index, wrongDigit(state, index));

    assert.strictEqual(state.status, STATUS_FAILED);
    assert.strictEqual(state.mistakes, 1);
    assert.strictEqual(state.lastEvent?.type, 'failed');
  });

  it('survives a wrong digit while the budget holds', () => {
    let state = startedState('starter');
    const index = firstEmpty(state);
    state = enter(state, index, wrongDigit(state, index));

    assert.strictEqual(state.status, STATUS_PLAYING);
    assert.ok(state.mistakes < state.maxMistakes);
  });
});

describe('candidates', () => {
  it('toggles a pencil mark on and off', () => {
    const state = startedState();
    const index = firstEmpty(state);

    const noted = sudokuReducer(select(state, index), { type: 'TOGGLE_CANDIDATE', digit: 4 });
    assert.deepStrictEqual(noted.cells[index].candidates, [4]);

    const more = sudokuReducer(noted, { type: 'TOGGLE_CANDIDATE', digit: 2 });
    assert.deepStrictEqual(more.cells[index].candidates, [2, 4], 'candidates stay sorted');

    const removed = sudokuReducer(more, { type: 'TOGGLE_CANDIDATE', digit: 4 });
    assert.deepStrictEqual(removed.cells[index].candidates, [2]);
  });

  it('routes digit entry to candidates while note mode is on', () => {
    const state = sudokuReducer(startedState(), { type: 'TOGGLE_NOTE_MODE' });
    assert.ok(state.noteMode);

    const index = firstEmpty(state);
    const noted = sudokuReducer(select(state, index), { type: 'SET_DIGIT', digit: 6 });

    assert.strictEqual(noted.cells[index].value, EMPTY_CELL);
    assert.deepStrictEqual(noted.cells[index].candidates, [6]);
  });

  it('drops a placed digit from the pencil marks of its peers', () => {
    const state = startedState();
    const index = firstEmpty(state);
    const digit = state.puzzle.solution[index];

    const peerIndex = state.cells.findIndex(
      (cell, i) => i !== index && Math.floor(i / 9) === Math.floor(index / 9) && !cell.given,
    );
    const withNote = sudokuReducer(select(state, peerIndex), { type: 'TOGGLE_CANDIDATE', digit });
    assert.ok(withNote.cells[peerIndex].candidates.includes(digit));

    const placed = enter(withNote, index, digit);
    assert.ok(!placed.cells[peerIndex].candidates.includes(digit));
  });

  it('fills every empty cell with its legal candidates', () => {
    const state = sudokuReducer(startedState(), { type: 'AUTO_FILL_CANDIDATES' });

    state.cells.forEach((cell, index) => {
      if (cell.value !== EMPTY_CELL) {
        assert.deepStrictEqual(cell.candidates, []);
        return;
      }
      assert.ok(cell.candidates.length > 0, 'every empty cell has at least one candidate');
      assert.ok(cell.candidates.includes(state.puzzle.solution[index]), 'truth is never excluded');
    });
  });

  it('leaves filled cells alone', () => {
    const state = startedState();
    const given = state.cells.findIndex((cell) => cell.given);
    const next = sudokuReducer(select(state, given), { type: 'TOGGLE_CANDIDATE', digit: 3 });

    assert.deepStrictEqual(next.cells[given].candidates, []);
    assert.strictEqual(next.lastEvent?.type, 'locked');
  });
});

describe('undo', () => {
  it('restores the previous contents of the last touched cell', () => {
    const state = startedState();
    const index = firstEmpty(state);
    const placed = enter(state, index, state.puzzle.solution[index]);
    const undone = sudokuReducer(placed, { type: 'UNDO' });

    assert.strictEqual(undone.cells[index].value, EMPTY_CELL);
    assert.strictEqual(undone.selectedIndex, index);
    assert.strictEqual(undone.history.length, 0);
  });

  it('restores pencil marks too', () => {
    const state = startedState();
    const index = firstEmpty(state);
    const noted = sudokuReducer(select(state, index), { type: 'TOGGLE_CANDIDATE', digit: 8 });
    const undone = sudokuReducer(noted, { type: 'UNDO' });

    assert.deepStrictEqual(undone.cells[index].candidates, []);
  });

  it('does nothing with an empty history', () => {
    const state = startedState();
    assert.strictEqual(sudokuReducer(state, { type: 'UNDO' }), state);
  });

  it('keeps mistakes counted after an undo', () => {
    const state = startedState('starter');
    const index = firstEmpty(state);
    const wrong = enter(state, index, wrongDigit(state, index));
    const undone = sudokuReducer(wrong, { type: 'UNDO' });

    assert.strictEqual(undone.mistakes, 1, 'undo rewinds the board, not the record');
  });
});

describe('hints', () => {
  it('reveals the solution digit and spends a hint', () => {
    const state = startedState('starter');
    const index = firstEmpty(state);
    const hinted = sudokuReducer(select(state, index), { type: 'HINT' });

    assert.strictEqual(hinted.cells[index].value, state.puzzle.solution[index]);
    assert.strictEqual(hinted.hintsRemaining, state.hintsRemaining - 1);
    assert.strictEqual(hinted.mistakes, 0, 'a hint is not a mistake');
    assert.strictEqual(hinted.lastEvent?.type, 'hint');
  });

  it('falls back to the first empty cell when a filled cell is selected', () => {
    const state = startedState('starter');
    const given = state.cells.findIndex((cell) => cell.given);
    const hinted = sudokuReducer(select(state, given), { type: 'HINT' });

    const expected = firstEmpty(state);
    assert.strictEqual(hinted.cells[expected].value, state.puzzle.solution[expected]);
    assert.strictEqual(hinted.selectedIndex, expected);
  });

  it('does nothing when no hints remain', () => {
    const state = startedState('insane');
    assert.strictEqual(state.hintsRemaining, 0);
    assert.strictEqual(sudokuReducer(state, { type: 'HINT' }), state);
  });
});

describe('timer', () => {
  it('accumulates only while playing', () => {
    let state = startedState();
    state = sudokuReducer(state, { type: 'TICK', deltaMs: 1000 });
    assert.strictEqual(state.elapsedMs, 1000);

    state = sudokuReducer(state, { type: 'PAUSE' });
    assert.strictEqual(state.status, STATUS_PAUSED);

    const stillPaused = sudokuReducer(state, { type: 'TICK', deltaMs: 5000 });
    assert.strictEqual(stillPaused.elapsedMs, 1000, 'a paused clock does not run');

    const resumed = sudokuReducer(stillPaused, { type: 'RESUME' });
    assert.strictEqual(resumed.status, STATUS_PLAYING);
    assert.strictEqual(sudokuReducer(resumed, { type: 'TICK', deltaMs: 500 }).elapsedMs, 1500);
  });

  it('ignores non-positive deltas', () => {
    const state = sudokuReducer(startedState(), { type: 'TICK', deltaMs: 0 });
    assert.strictEqual(state.elapsedMs, 0);
  });

  it('only resumes from paused', () => {
    const state = startedState();
    assert.strictEqual(sudokuReducer(state, { type: 'RESUME' }), state);
  });
});

describe('completion', () => {
  it('completes the run when the grid is solved', () => {
    const state = sudokuReducer(startedState('starter'), { type: 'TICK', deltaMs: 12_000 });
    const solved = fillFromSolution(state);

    assert.strictEqual(solved.status, STATUS_COMPLETED);
    assert.deepStrictEqual(solved.conflicts, []);
    assert.deepStrictEqual(solved.errors, []);
    assert.strictEqual(solved.lastEvent?.type, 'completed');
  });

  it('records a first finish as a best time', () => {
    const state = sudokuReducer(startedState('starter'), { type: 'TICK', deltaMs: 12_000 });
    const solved = fillFromSolution(state);

    assert.strictEqual(solved.isNewBestTime, true);
    assert.strictEqual(solved.bestTimeMs, 12_000);
  });

  it('beats a slower previous best', () => {
    const base = { ...startedState('starter'), bestTimeMs: 60_000 };
    const solved = fillFromSolution(sudokuReducer(base, { type: 'TICK', deltaMs: 30_000 }));

    assert.strictEqual(solved.isNewBestTime, true);
    assert.strictEqual(solved.bestTimeMs, 30_000);
  });

  it('keeps a faster previous best', () => {
    const base = { ...startedState('starter'), bestTimeMs: 10_000 };
    const solved = fillFromSolution(sudokuReducer(base, { type: 'TICK', deltaMs: 45_000 }));

    assert.strictEqual(solved.isNewBestTime, false);
    assert.strictEqual(solved.bestTimeMs, 10_000);
  });

  it('stops accepting input once complete', () => {
    const solved = fillFromSolution(startedState('starter'));
    assert.strictEqual(sudokuReducer(solved, { type: 'SET_DIGIT', digit: 1 }), solved);
    assert.strictEqual(sudokuReducer(solved, { type: 'TICK', deltaMs: 1000 }), solved);
  });
});

describe('RESET', () => {
  it('returns the same puzzle to its opening position', () => {
    let state = startedState('starter');
    const index = firstEmpty(state);
    state = enter(state, index, wrongDigit(state, index));
    state = sudokuReducer(state, { type: 'TICK', deltaMs: 20_000 });

    const reset = sudokuReducer(state, { type: 'RESET' });

    assert.deepStrictEqual(
      reset.cells.map((cell) => cell.value),
      state.puzzle.givens,
      'the board returns to its givens',
    );
    assert.strictEqual(reset.puzzle.givens, state.puzzle.givens, 'the puzzle itself is unchanged');
    assert.strictEqual(reset.mistakes, 0);
    assert.strictEqual(reset.elapsedMs, 0);
    assert.strictEqual(reset.status, STATUS_PLAYING);
    assert.strictEqual(reset.hintsRemaining, getDifficultyConfig('starter').hints);
    assert.deepStrictEqual(reset.history, []);
  });

  it('does nothing before a puzzle has been dealt', () => {
    const idle = createInitialSudokuState();
    assert.strictEqual(idle.status, STATUS_IDLE);
    assert.strictEqual(sudokuReducer(idle, { type: 'RESET' }), idle);
  });
});

describe('SET_BEST_TIME', () => {
  it('adopts a best time loaded from storage', () => {
    const state = sudokuReducer(startedState(), { type: 'SET_BEST_TIME', bestTimeMs: 42_000 });
    assert.strictEqual(state.bestTimeMs, 42_000);
  });
});
