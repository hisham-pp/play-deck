import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { MinesweeperState } from '../types/minesweeper.types';
import { toIndex } from './minesweeper-board';
import {
  DIFFICULTY_BEGINNER,
  DIFFICULTY_EXPERT,
  DIFFICULTY_INTERMEDIATE,
  STATUS_IDLE,
  STATUS_LOST,
  STATUS_PLAYING,
  STATUS_WON,
} from './minesweeper-constants';
import { createInitialMinesweeperState, minesweeperReducer } from './minesweeper-reducer';

describe('MinesweeperReducer', () => {
  it('initializes in idle state with correct preset parameters', () => {
    const state = createInitialMinesweeperState(DIFFICULTY_BEGINNER);
    assert.equal(state.status, STATUS_IDLE);
    assert.equal(state.rows, 9);
    assert.equal(state.cols, 9);
    assert.equal(state.mines, 10);
    assert.equal(state.revealedCount, 0);
    assert.equal(state.flagCount, 0);
    assert.equal(state.firstClick, true);
    assert.equal(state.cells.length, 81);
  });

  it('initializes intermediate and expert boards correctly', () => {
    const inter = createInitialMinesweeperState(DIFFICULTY_INTERMEDIATE);
    assert.equal(inter.rows, 16);
    assert.equal(inter.cols, 16);
    assert.equal(inter.mines, 40);

    const exp = createInitialMinesweeperState(DIFFICULTY_EXPERT);
    assert.equal(exp.rows, 16);
    assert.equal(exp.cols, 30);
    assert.equal(exp.mines, 99);
  });

  it('places mines and switches to playing status upon first reveal', () => {
    const initial = createInitialMinesweeperState(DIFFICULTY_BEGINNER);
    const clickIdx = toIndex(4, 4, 9);

    const next = minesweeperReducer(initial, { type: 'REVEAL_CELL', index: clickIdx });

    assert.equal(next.status, STATUS_PLAYING);
    assert.equal(next.firstClick, false);
    assert.ok(next.revealedCount > 0);
    assert.equal(next.cells[clickIdx].isRevealed, true);
    assert.equal(next.cells[clickIdx].isMine, false);
  });

  it('performs recursive empty-cell reveal for 0-neighbor cells', () => {
    const initial = createInitialMinesweeperState(DIFFICULTY_BEGINNER);
    const clickIdx = toIndex(4, 4, 9);

    const next = minesweeperReducer(initial, { type: 'REVEAL_CELL', index: clickIdx });

    // Since first click guarantees 0 adjacent mines for center cell on 9x9 board with 10 mines,
    // it must reveal at least the clicked cell plus its 8 neighbors (9 cells minimum)
    assert.ok(next.revealedCount >= 9);
  });

  it('toggles flags correctly without revealing', () => {
    const initial = createInitialMinesweeperState(DIFFICULTY_BEGINNER);
    const targetIdx = 12;

    const flagged = minesweeperReducer(initial, { type: 'TOGGLE_FLAG', index: targetIdx });
    assert.equal(flagged.cells[targetIdx].isFlagged, true);
    assert.equal(flagged.cells[targetIdx].isRevealed, false);
    assert.equal(flagged.flagCount, 1);

    const unflagged = minesweeperReducer(flagged, { type: 'TOGGLE_FLAG', index: targetIdx });
    assert.equal(unflagged.cells[targetIdx].isFlagged, false);
    assert.equal(unflagged.flagCount, 0);
  });

  it('prevents revealing flagged cells', () => {
    const initial = createInitialMinesweeperState(DIFFICULTY_BEGINNER);
    const targetIdx = 10;

    const flagged = minesweeperReducer(initial, { type: 'TOGGLE_FLAG', index: targetIdx });
    const attempt = minesweeperReducer(flagged, { type: 'REVEAL_CELL', index: targetIdx });

    assert.equal(attempt.cells[targetIdx].isRevealed, false);
    assert.equal(attempt.cells[targetIdx].isFlagged, true);
  });

  it('handles loss when revealing a mine', () => {
    // Construct a state with known mine positions
    const initial = createInitialMinesweeperState(DIFFICULTY_BEGINNER);
    initial.firstClick = false;
    initial.status = STATUS_PLAYING;
    initial.cells[0].isMine = true;
    initial.cells[1].isMine = false;
    initial.cells[2].isMine = true;
    initial.cells[3].isMine = false;
    initial.cells[3].isFlagged = true; // False flag

    const afterLoss = minesweeperReducer(initial, { type: 'REVEAL_CELL', index: 0 });

    assert.equal(afterLoss.status, STATUS_LOST);
    assert.equal(afterLoss.cells[0].isRevealed, true);
    assert.equal(afterLoss.cells[0].isTriggeredMine, true);
    assert.equal(afterLoss.cells[2].isRevealed, true); // unflagged mine is revealed
    assert.equal(afterLoss.cells[3].isFalseFlag, true); // wrong flag marked
  });

  it('handles win detection when all non-mine cells are cleared', () => {
    // 2x2 board with 1 mine
    const state = createInitialMinesweeperState('custom', null, { rows: 2, cols: 2, mines: 1 });
    state.firstClick = false;
    state.status = STATUS_PLAYING;
    state.cells[0].isMine = false;
    state.cells[0].adjacentMines = 1;
    state.cells[1].isMine = false;
    state.cells[1].adjacentMines = 1;
    state.cells[2].isMine = false;
    state.cells[2].adjacentMines = 1;
    state.cells[3].isMine = true;

    const s1 = minesweeperReducer(state, { type: 'REVEAL_CELL', index: 0 });
    const s2 = minesweeperReducer(s1, { type: 'REVEAL_CELL', index: 1 });
    const s3 = minesweeperReducer(s2, { type: 'REVEAL_CELL', index: 2 });

    assert.equal(s3.status, STATUS_WON);
    assert.equal(s3.revealedCount, 3);
    assert.equal(s3.cells[3].isFlagged, true); // Auto-flags remaining mine on win
  });

  it('executes chord reveal on numbered cells with matching adjacent flags', () => {
    // 3x3 board where center has 1 adjacent mine at (0, 0)
    const state = createInitialMinesweeperState('custom', null, { rows: 3, cols: 3, mines: 1 });
    state.firstClick = false;
    state.status = STATUS_PLAYING;
    state.cells[0].isMine = true;
    state.cells[0].isFlagged = true; // Properly flagged
    state.flagCount = 1;

    const centerIdx = toIndex(1, 1, 3);
    state.cells[centerIdx].isRevealed = true;
    state.cells[centerIdx].adjacentMines = 1;
    state.revealedCount = 1;

    const chorded = minesweeperReducer(state, { type: 'CHORD_CELL', index: centerIdx });

    // Center cell has 8 neighbors. 1 neighbor is flagged mine (idx 0).
    // Remaining 7 neighbors should now be revealed!
    assert.equal(chorded.revealedCount, 8);
    for (let i = 1; i < 9; i++) {
      assert.equal(chorded.cells[i].isRevealed, true);
    }
  });

  it('detonates on chord if user flagged the wrong cell', () => {
    // 3x3 board where center has 1 adjacent mine at (0, 0)
    const state = createInitialMinesweeperState('custom', null, { rows: 3, cols: 3, mines: 1 });
    state.firstClick = false;
    state.status = STATUS_PLAYING;
    state.cells[0].isMine = true; // Mine is here
    state.cells[1].isFlagged = true; // Wrong flag placed here!
    state.flagCount = 1;

    const centerIdx = toIndex(1, 1, 3);
    state.cells[centerIdx].isRevealed = true;
    state.cells[centerIdx].adjacentMines = 1;
    state.revealedCount = 1;

    const chorded = minesweeperReducer(state, { type: 'CHORD_CELL', index: centerIdx });

    assert.equal(chorded.status, STATUS_LOST);
  });

  it('increments timer only when game is actively playing', () => {
    const idleState = createInitialMinesweeperState(DIFFICULTY_BEGINNER);
    const tickIdle = minesweeperReducer(idleState, { type: 'TICK', deltaMs: 1000 });
    assert.equal(tickIdle.elapsedMs, 0);

    const playingState: MinesweeperState = { ...idleState, status: STATUS_PLAYING };
    const tickPlaying = minesweeperReducer(playingState, { type: 'TICK', deltaMs: 1000 });
    assert.equal(tickPlaying.elapsedMs, 1000);
  });
});
