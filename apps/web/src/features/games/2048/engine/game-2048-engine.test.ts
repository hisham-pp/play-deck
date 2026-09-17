import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  createEmptyGrid,
  getEmptyCells,
  getHighestTile,
  hasWinningTile,
  isGameOver,
  moveGrid,
  slideLine,
  spawnTile,
} from './game-2048-engine';
import { createInitialState, game2048Reducer } from './game-2048-reducer';

describe('2048 Engine — Line Sliding and Merge Rules', () => {
  it('slides non-zero numbers to the left', () => {
    const input = [0, 2, 0, 4];
    const { line, scoreGain } = slideLine(input);
    assert.deepEqual(line, [2, 4, 0, 0]);
    assert.equal(scoreGain, 0);
  });

  it('merges adjacent identical values', () => {
    const input = [2, 2, 0, 0];
    const { line, scoreGain } = slideLine(input);
    assert.deepEqual(line, [4, 0, 0, 0]);
    assert.equal(scoreGain, 4);
  });

  it('does NOT double merge in a single move ([2, 2, 2, 2] -> [4, 4, 0, 0])', () => {
    const input = [2, 2, 2, 2];
    const { line, scoreGain } = slideLine(input);
    assert.deepEqual(line, [4, 4, 0, 0]);
    assert.equal(scoreGain, 8);
  });

  it('merges towards the sliding wall first ([2, 2, 2, 0] -> [4, 2, 0, 0])', () => {
    const input = [2, 2, 2, 0];
    const { line, scoreGain } = slideLine(input);
    assert.deepEqual(line, [4, 2, 0, 0]);
    assert.equal(scoreGain, 4);
  });

  it('handles [0, 2, 2, 2] -> [4, 2, 0, 0]', () => {
    const input = [0, 2, 2, 2];
    const { line, scoreGain } = slideLine(input);
    assert.deepEqual(line, [4, 2, 0, 0]);
    assert.equal(scoreGain, 4);
  });

  it('handles separated identical values ([2, 0, 2, 0] -> [4, 0, 0, 0])', () => {
    const input = [2, 0, 2, 0];
    const { line, scoreGain } = slideLine(input);
    assert.deepEqual(line, [4, 0, 0, 0]);
    assert.equal(scoreGain, 4);
  });

  it('does not merge different values ([4, 2, 2, 0] -> [4, 4, 0, 0])', () => {
    const input = [4, 2, 2, 0];
    const { line, scoreGain } = slideLine(input);
    assert.deepEqual(line, [4, 4, 0, 0]);
    assert.equal(scoreGain, 4);
  });

  it('maintains empty line when all zeros', () => {
    const input = [0, 0, 0, 0];
    const { line, scoreGain } = slideLine(input);
    assert.deepEqual(line, [0, 0, 0, 0]);
    assert.equal(scoreGain, 0);
  });
});

describe('2048 Engine — Grid Moves in All Directions', () => {
  it('moves LEFT correctly', () => {
    const grid = [
      [2, 0, 0, 2],
      [4, 4, 4, 4],
      [0, 0, 0, 0],
      [2, 4, 2, 4],
    ];
    const { grid: nextGrid, scoreGain, hasChanged } = moveGrid(grid, 'LEFT');

    assert.equal(hasChanged, true);
    assert.equal(scoreGain, 4 + 8 + 8);
    assert.deepEqual(nextGrid, [
      [4, 0, 0, 0],
      [8, 8, 0, 0],
      [0, 0, 0, 0],
      [2, 4, 2, 4],
    ]);
  });

  it('moves RIGHT correctly', () => {
    const grid = [
      [2, 0, 0, 2],
      [4, 4, 4, 4],
      [0, 0, 0, 0],
      [2, 4, 2, 4],
    ];
    const { grid: nextGrid, scoreGain, hasChanged } = moveGrid(grid, 'RIGHT');

    assert.equal(hasChanged, true);
    assert.equal(scoreGain, 4 + 8 + 8);
    assert.deepEqual(nextGrid, [
      [0, 0, 0, 4],
      [0, 0, 8, 8],
      [0, 0, 0, 0],
      [2, 4, 2, 4],
    ]);
  });

  it('moves UP correctly', () => {
    const grid = [
      [2, 4, 0, 2],
      [2, 4, 0, 4],
      [0, 4, 0, 2],
      [0, 4, 0, 4],
    ];
    const { grid: nextGrid, scoreGain, hasChanged } = moveGrid(grid, 'UP');

    assert.equal(hasChanged, true);
    assert.equal(scoreGain, 4 + 8 + 8);
    assert.deepEqual(nextGrid, [
      [4, 8, 0, 2],
      [0, 8, 0, 4],
      [0, 0, 0, 2],
      [0, 0, 0, 4],
    ]);
  });

  it('moves DOWN correctly', () => {
    const grid = [
      [2, 4, 0, 2],
      [2, 4, 0, 4],
      [0, 4, 0, 2],
      [0, 4, 0, 4],
    ];
    const { grid: nextGrid, scoreGain, hasChanged } = moveGrid(grid, 'DOWN');

    assert.equal(hasChanged, true);
    assert.equal(scoreGain, 4 + 8 + 8);
    assert.deepEqual(nextGrid, [
      [0, 0, 0, 2],
      [0, 0, 0, 4],
      [0, 8, 0, 2],
      [4, 8, 0, 4],
    ]);
  });

  it('detects when move causes no change', () => {
    const grid = [
      [4, 0, 0, 0],
      [8, 0, 0, 0],
      [2, 0, 0, 0],
      [4, 0, 0, 0],
    ];
    const { hasChanged, scoreGain } = moveGrid(grid, 'LEFT');
    assert.equal(hasChanged, false);
    assert.equal(scoreGain, 0);
  });
});

describe('2048 Engine — Tile Spawning and Probabilities', () => {
  let mockIdCounter = 0;
  const mockIdGen = () => `test-tile-${++mockIdCounter}`;

  it('spawns a 2 when random float >= 0.10', () => {
    const grid = createEmptyGrid();
    const { grid: nextGrid, tile } = spawnTile(grid, mockIdGen, () => 0.5);

    assert.ok(tile);
    assert.equal(tile.value, 2);
    assert.equal(getEmptyCells(nextGrid).length, 15);
  });

  it('spawns a 4 when random float < 0.10', () => {
    const grid = createEmptyGrid();
    const { grid: nextGrid, tile } = spawnTile(grid, mockIdGen, () => 0.05);

    assert.ok(tile);
    assert.equal(tile.value, 4);
    assert.equal(getEmptyCells(nextGrid).length, 15);
  });

  it('returns null when grid is full', () => {
    const fullGrid = [
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 2],
    ];
    const { tile } = spawnTile(fullGrid, mockIdGen);
    assert.equal(tile, null);
  });
});

describe('2048 Engine — Game Over and Win Detection', () => {
  it('identifies game over on a completely locked grid', () => {
    const lockedGrid = [
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 2],
    ];
    assert.equal(isGameOver(lockedGrid), true);
  });

  it('does NOT report game over if horizontal merge exists', () => {
    const grid = [
      [2, 2, 4, 8],
      [4, 8, 16, 32],
      [64, 128, 256, 512],
      [2, 4, 8, 16],
    ];
    assert.equal(isGameOver(grid), false);
  });

  it('does NOT report game over if vertical merge exists', () => {
    const grid = [
      [2, 4, 8, 16],
      [2, 8, 16, 32],
      [64, 128, 256, 512],
      [1024, 4, 8, 16],
    ];
    assert.equal(isGameOver(grid), false);
  });

  it('does NOT report game over if empty cells exist', () => {
    const grid = [
      [2, 4, 8, 16],
      [32, 64, 128, 256],
      [512, 1024, 2, 4],
      [8, 16, 32, 0],
    ];
    assert.equal(isGameOver(grid), false);
  });

  it('detects 2048 winning tile', () => {
    const nonWinningGrid = [
      [2, 4, 8, 16],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 1024],
    ];
    assert.equal(hasWinningTile(nonWinningGrid), false);

    const winningGrid = [
      [2, 4, 8, 16],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 2048],
    ];
    assert.equal(hasWinningTile(winningGrid), true);
  });

  it('computes highest tile accurately', () => {
    const grid = [
      [2, 4, 8, 16],
      [32, 64, 128, 256],
      [512, 1024, 4096, 4],
      [8, 16, 32, 0],
    ];
    assert.equal(getHighestTile(grid), 4096);
  });
});

describe('2048 Reducer — State Transitions, Undo & Restart', () => {
  let mockId = 0;
  const idGen = () => `mock-${++mockId}`;

  it('initializes with 2 tiles and score 0', () => {
    const state = createInitialState(100, idGen);
    assert.equal(state.score, 0);
    assert.equal(state.bestScore, 100);
    assert.equal(state.status, 'playing');
    assert.equal(state.tiles.length, 2);
    assert.equal(getEmptyCells(state.grid).length, 14);
  });

  it('executes MOVE action, updates score, increments moveCount and creates undo entry', () => {
    const initialState = createInitialState(0, idGen);
    // Force known grid
    initialState.grid = [
      [2, 2, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];

    const nextState = game2048Reducer(initialState, { type: 'MOVE', direction: 'LEFT' }, idGen);

    assert.equal(nextState.score, 4);
    assert.equal(nextState.bestScore, 4);
    assert.equal(nextState.moveCount, 1);
    assert.equal(nextState.undoStack.length, 1);
    assert.equal(nextState.undoStack[0].score, 0);
    assert.deepEqual(nextState.undoStack[0].grid, initialState.grid);
  });

  it('executes UNDO to restore prior board and score', () => {
    const state = createInitialState(0, idGen);
    state.grid = [
      [2, 2, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    state.score = 10;

    const afterMove = game2048Reducer(state, { type: 'MOVE', direction: 'LEFT' }, idGen);
    assert.equal(afterMove.score, 14);
    assert.equal(afterMove.undoStack.length, 1);

    const afterUndo = game2048Reducer(afterMove, { type: 'UNDO' }, idGen);
    assert.equal(afterUndo.score, 10);
    assert.equal(afterUndo.undoStack.length, 0);
    assert.deepEqual(afterUndo.grid, state.grid);
  });

  it('handles UNDO when undoStack is empty without crashing', () => {
    const state = createInitialState(0, idGen);
    const afterUndo = game2048Reducer(state, { type: 'UNDO' }, idGen);
    assert.deepEqual(afterUndo, state);
  });

  it('triggers WIN state when 2048 is formed, and CONTINUE allows play to proceed', () => {
    const state = createInitialState(0, idGen);
    state.grid = [
      [1024, 1024, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];

    const afterWinMove = game2048Reducer(state, { type: 'MOVE', direction: 'LEFT' }, idGen);
    assert.equal(afterWinMove.hasWon, true);
    assert.equal(afterWinMove.status, 'won');
    assert.equal(afterWinMove.score, 2048);

    // Moves are ignored while won and not keepGoing
    const ignoredMove = game2048Reducer(afterWinMove, { type: 'MOVE', direction: 'DOWN' }, idGen);
    assert.deepEqual(ignoredMove, afterWinMove);

    // Player selects "Keep Going"
    const afterContinue = game2048Reducer(afterWinMove, { type: 'CONTINUE' }, idGen);
    assert.equal(afterContinue.status, 'playing');
    assert.equal(afterContinue.isKeepGoing, true);

    // Now moves are processed again
    const moveAgain = game2048Reducer(afterContinue, { type: 'MOVE', direction: 'DOWN' }, idGen);
    assert.equal(moveAgain.moveCount, afterWinMove.moveCount + 1);
  });

  it('restarts board while preserving bestScore', () => {
    const state = createInitialState(500, idGen);
    state.score = 250;
    state.moveCount = 42;

    const restarted = game2048Reducer(state, { type: 'RESTART' }, idGen);
    assert.equal(restarted.score, 0);
    assert.equal(restarted.bestScore, 500);
    assert.equal(restarted.moveCount, 0);
    assert.equal(restarted.undoStack.length, 0);
    assert.equal(restarted.tiles.length, 2);
  });

  it('updates bestScore through SET_BEST_SCORE without lowering it', () => {
    const state = createInitialState(200, idGen);
    const updated = game2048Reducer(state, { type: 'SET_BEST_SCORE', bestScore: 500 });
    assert.equal(updated.bestScore, 500);

    const lowerAttempt = game2048Reducer(updated, { type: 'SET_BEST_SCORE', bestScore: 100 });
    assert.equal(lowerAttempt.bestScore, 500);
  });
});
