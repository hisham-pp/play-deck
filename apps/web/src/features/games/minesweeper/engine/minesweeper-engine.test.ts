import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  DIFFICULTY_BEGINNER,
  DIFFICULTY_EXPERT,
  STATUS_IDLE,
  STATUS_PLAYING,
} from './minesweeper-constants';
import { MinesweeperEngine } from './minesweeper-engine';

describe('MinesweeperEngine', () => {
  it('instantiates in idle state with beginner difficulty by default', () => {
    const engine = new MinesweeperEngine();
    const state = engine.getState();

    assert.equal(state.status, STATUS_IDLE);
    assert.equal(state.difficulty, DIFFICULTY_BEGINNER);
    assert.equal(state.rows, 9);
    assert.equal(state.cols, 9);
    assert.equal(state.mines, 10);
  });

  it('notifies subscribers on state mutations', () => {
    const engine = new MinesweeperEngine();
    let notifications = 0;

    const unsubscribe = engine.subscribe(() => {
      notifications++;
    });

    engine.toggleFlag(0);
    assert.equal(notifications, 1);
    assert.equal(engine.getState().cells[0].isFlagged, true);

    engine.revealCell(40);
    assert.equal(notifications, 2);
    assert.equal(engine.getState().status, STATUS_PLAYING);

    unsubscribe();
    engine.selectCell(5);
    assert.equal(notifications, 2);
  });

  it('handles navigation selection movement correctly', () => {
    const engine = new MinesweeperEngine();
    assert.equal(engine.getState().selectedCellIndex, 0);

    engine.moveSelection(1, 1);
    // (row 1, col 1) in 9x9 is index 10
    assert.equal(engine.getState().selectedCellIndex, 10);

    engine.moveSelection(-1, 0);
    // (row 0, col 1) is index 1
    assert.equal(engine.getState().selectedCellIndex, 1);
  });

  it('switches difficulty and restarts game on newGame', () => {
    const engine = new MinesweeperEngine();
    engine.revealCell(10);
    assert.equal(engine.getState().status, STATUS_PLAYING);

    engine.newGame(DIFFICULTY_EXPERT);
    const state = engine.getState();
    assert.equal(state.status, STATUS_IDLE);
    assert.equal(state.difficulty, DIFFICULTY_EXPERT);
    assert.equal(state.rows, 16);
    assert.equal(state.cols, 30);
    assert.equal(state.mines, 99);
  });

  it('adopts best time from stats repository', () => {
    const engine = new MinesweeperEngine();
    assert.equal(engine.getState().bestTimeMs, null);

    engine.setBestTime(14500);
    assert.equal(engine.getState().bestTimeMs, 14500);
  });

  it('cleans up listeners on destroy', () => {
    const engine = new MinesweeperEngine();
    let fired = false;
    engine.subscribe(() => {
      fired = true;
    });

    engine.destroy();
    engine.dispatch({ type: 'TOGGLE_FLAG', index: 0 });
    assert.equal(fired, false);
  });
});
