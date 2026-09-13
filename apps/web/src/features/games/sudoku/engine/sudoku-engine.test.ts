import assert from 'node:assert';
import { describe, it } from 'node:test';
import type { SudokuState } from '../types/sudoku.types';
import { EMPTY_CELL, STATUS_IDLE, STATUS_PAUSED, STATUS_PLAYING } from './sudoku-constants';
import { SudokuEngine } from './sudoku-engine';
import { createSeededRandom } from './sudoku-random';

function createEngine(difficulty: SudokuState['difficulty'] = 'medium', bestTimeMs = null) {
  return new SudokuEngine(difficulty, bestTimeMs, createSeededRandom(99));
}

function firstEmptyIndex(engine: SudokuEngine): number {
  return engine.getState().cells.findIndex((cell) => cell.value === EMPTY_CELL);
}

describe('SudokuEngine', () => {
  it('mounts idle without generating a puzzle', () => {
    const engine = createEngine();
    const state = engine.getState();

    assert.strictEqual(state.status, STATUS_IDLE);
    assert.strictEqual(state.puzzle.clueCount, 0);
    assert.ok(state.cells.every((cell) => cell.value === EMPTY_CELL));
  });

  it('deals a puzzle on demand', () => {
    const engine = createEngine();
    engine.newPuzzle('easy');

    assert.strictEqual(engine.getState().status, STATUS_PLAYING);
    assert.strictEqual(engine.getState().difficulty, 'easy');
    assert.ok(engine.getState().puzzle.clueCount > 0);
  });

  it('notifies subscribers on state changes', () => {
    const engine = createEngine();
    const seen: SudokuState[] = [];
    const unsubscribe = engine.subscribe((state) => seen.push(state));

    engine.newPuzzle('starter');
    engine.selectCell(0);
    assert.strictEqual(seen.length, 2);

    unsubscribe();
    engine.selectCell(1);
    assert.strictEqual(seen.length, 2, 'no notifications after unsubscribe');
  });

  it('does not notify when an action changes nothing', () => {
    const engine = createEngine();
    engine.newPuzzle('starter');

    let notifications = 0;
    engine.subscribe(() => notifications++);

    engine.undo(); // empty history
    engine.selectCell(-1); // out of range
    assert.strictEqual(notifications, 0);
  });

  it('treats state as immutable between dispatches', () => {
    const engine = createEngine();
    engine.newPuzzle('starter');

    const before = engine.getState();
    engine.selectCell(firstEmptyIndex(engine));
    engine.setDigit(engine.getState().puzzle.solution[firstEmptyIndex(engine)]);

    assert.notStrictEqual(engine.getState(), before);
    assert.strictEqual(before.cells[before.selectedIndex].value, EMPTY_CELL);
  });

  it('drives a full round of play through its command surface', () => {
    const engine = createEngine();
    engine.newPuzzle('starter');

    const index = firstEmptyIndex(engine);
    engine.selectCell(index);

    engine.toggleNoteMode();
    engine.setDigit(3);
    assert.deepStrictEqual(engine.getState().cells[index].candidates, [3]);

    engine.toggleNoteMode();
    engine.setDigit(engine.getState().puzzle.solution[index]);
    assert.strictEqual(
      engine.getState().cells[index].value,
      engine.getState().puzzle.solution[index],
    );

    engine.undo();
    assert.strictEqual(engine.getState().cells[index].value, EMPTY_CELL);

    engine.hint();
    assert.strictEqual(
      engine.getState().cells[index].value,
      engine.getState().puzzle.solution[index],
    );

    engine.clearCell();
    assert.strictEqual(engine.getState().cells[index].value, EMPTY_CELL);
  });

  it('moves the selection with relative steps', () => {
    const engine = createEngine();
    engine.newPuzzle('starter');
    engine.selectCell(0);

    engine.moveSelection(1, 0);
    assert.strictEqual(engine.getState().selectedIndex, 9);

    engine.moveSelection(0, 1);
    assert.strictEqual(engine.getState().selectedIndex, 10);
  });

  it('pauses, resumes and ticks the clock', () => {
    const engine = createEngine();
    engine.newPuzzle('starter');

    engine.tick(1500);
    assert.strictEqual(engine.getState().elapsedMs, 1500);

    engine.pause();
    assert.strictEqual(engine.getState().status, STATUS_PAUSED);
    engine.tick(1000);
    assert.strictEqual(engine.getState().elapsedMs, 1500);

    engine.resume();
    engine.tick(500);
    assert.strictEqual(engine.getState().elapsedMs, 2000);
  });

  it('resets the current puzzle without dealing a new one', () => {
    const engine = createEngine();
    engine.newPuzzle('starter');
    const givens = engine.getState().puzzle.givens;

    engine.selectCell(firstEmptyIndex(engine));
    engine.setDigit(5);
    engine.tick(4000);
    engine.reset();

    assert.strictEqual(engine.getState().puzzle.givens, givens);
    assert.strictEqual(engine.getState().elapsedMs, 0);
    assert.deepStrictEqual(
      engine.getState().cells.map((cell) => cell.value),
      givens,
    );
  });

  it('reports completion after the grid is solved', () => {
    const engine = createEngine();
    engine.newPuzzle('starter');

    assert.strictEqual(engine.isComplete(), false);

    const solution = engine.getState().puzzle.solution;
    for (let index = 0; index < solution.length; index++) {
      // Read through the live state: each placement changes the board.
      if (engine.getState().cells[index].value !== EMPTY_CELL) continue;
      engine.selectCell(index);
      engine.setDigit(solution[index]);
    }

    assert.strictEqual(engine.isComplete(), true);
    assert.strictEqual(engine.isFailed(), false);
    assert.ok((engine.getState().bestTimeMs ?? 0) >= 0);
  });

  it('fails the run when the mistake budget runs out', () => {
    const engine = createEngine();
    engine.newPuzzle('insane');

    const index = firstEmptyIndex(engine);
    const correct = engine.getState().puzzle.solution[index];
    engine.selectCell(index);
    engine.setDigit(correct === 9 ? 1 : correct + 1);

    assert.strictEqual(engine.isFailed(), true);
    assert.strictEqual(engine.isComplete(), false);
  });

  it('adopts a best time supplied by the host app', () => {
    const engine = createEngine();
    engine.setBestTime(61_000);
    assert.strictEqual(engine.getState().bestTimeMs, 61_000);
  });

  it('drops listeners on destroy', () => {
    const engine = createEngine();
    let notifications = 0;
    engine.subscribe(() => notifications++);

    engine.destroy();
    engine.newPuzzle('starter');
    assert.strictEqual(notifications, 0);
  });
});
