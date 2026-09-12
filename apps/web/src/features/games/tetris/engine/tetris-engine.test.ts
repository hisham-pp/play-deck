import assert from 'node:assert';
import { describe, it } from 'node:test';
import type { ActivePiece, TetrisBoard, TetrisState } from '../types/tetris.types';
import {
  COLS,
  HARD_DROP_POINTS_PER_CELL,
  MIN_GRAVITY_MS,
  SOFT_DROP_POINTS_PER_CELL,
  STATUS_COUNTDOWN,
  STATUS_GAME_OVER,
  STATUS_IDLE,
  STATUS_PAUSED,
  STATUS_PLAYING,
  TETROMINO_TYPES,
  TOTAL_ROWS,
} from './tetris-constants';
import { TetrisEngine } from './tetris-engine';
import {
  advanceGravity,
  hardDrop,
  hold,
  rotate,
  softDrop,
  tetrisReducer,
  tryMove,
} from './tetris-reducer';
import { createInitialTetrisState } from './tetris-state';
import {
  calculateGravityMs,
  calculateLevel,
  calculateLineClearScore,
  clearRows,
  createEmptyBoard,
  findFullRows,
  generateBag,
  getGhostPiece,
  getOccupiedCoordinates,
  isValidPlacement,
  mergePieceIntoBoard,
  refillQueue,
  spawnPiece,
  tryRotate,
} from './tetris-utils';

function seededRandom(sequence: number[]): () => number {
  let i = 0;
  return () => sequence[i++ % sequence.length];
}

function fillRowExceptCols(board: TetrisBoard, row: number, exceptCols: number[]): TetrisBoard {
  const next = board.map((r) => [...r]);
  for (let col = 0; col < COLS; col++) {
    if (!exceptCols.includes(col)) next[row][col] = 'I';
  }
  return next;
}

function playingState(overrides: Partial<TetrisState> = {}): TetrisState {
  return {
    ...createInitialTetrisState(0, () => 0.5),
    status: STATUS_PLAYING,
    ...overrides,
  };
}

describe('Tetris Engine Tests', () => {
  describe('1. Initial State', () => {
    it('creates a correct default state', () => {
      const state = createInitialTetrisState(500);
      assert.strictEqual(state.status, STATUS_IDLE);
      assert.strictEqual(state.score, 0);
      assert.strictEqual(state.highScore, 500);
      assert.strictEqual(state.level, 1);
      assert.strictEqual(state.linesCleared, 0);
      assert.ok(state.active !== null);
      assert.strictEqual(state.board.length, TOTAL_ROWS);
      assert.strictEqual(state.board[0].length, COLS);
      assert.ok(state.board.every((row) => row.every((cell) => cell === null)));
      assert.strictEqual(state.holdType, null);
      assert.strictEqual(state.canHold, true);
      assert.ok(state.queue.length >= 4);
    });
  });

  describe('2. 7-Bag Randomizer', () => {
    it('generates a bag containing exactly one of each tetromino', () => {
      const bag = generateBag(() => 0.42);
      assert.strictEqual(bag.length, 7);
      const unique = new Set(bag);
      assert.strictEqual(unique.size, 7);
      for (const type of TETROMINO_TYPES) {
        assert.ok(bag.includes(type));
      }
    });

    it('refills the queue to the requested minimum length across bag boundaries', () => {
      const { queue, bag } = refillQueue([], [], 10, () => 0.1);
      assert.strictEqual(queue.length, 10);
      // Every run of 7 consecutive pieces drawn must be a full, non-repeating set.
      const firstSeven = new Set(queue.slice(0, 7));
      assert.strictEqual(firstSeven.size, 7);
      assert.ok(bag.length >= 0 && bag.length < 7);
    });
  });

  describe('3. Piece Placement & Collision', () => {
    it('computes occupied coordinates relative to piece position', () => {
      const piece: ActivePiece = { type: 'O', rotation: 0, row: 2, col: 4 };
      const cells = getOccupiedCoordinates(piece);
      assert.deepStrictEqual(
        cells.sort((a, b) => a.col - b.col),
        [
          { row: 2, col: 4 },
          { row: 2, col: 5 },
          { row: 3, col: 4 },
          { row: 3, col: 5 },
        ].sort((a, b) => a.col - b.col),
      );
    });

    it('rejects placements outside the board bounds', () => {
      const board = createEmptyBoard();
      const offBoard: ActivePiece = { type: 'I', rotation: 0, row: 0, col: COLS - 1 };
      assert.strictEqual(isValidPlacement(board, offBoard), false);
    });

    it('rejects placements overlapping locked cells', () => {
      const board = createEmptyBoard();
      board[5][4] = 'T';
      const piece: ActivePiece = { type: 'O', rotation: 0, row: 4, col: 4 };
      assert.strictEqual(isValidPlacement(board, piece), false);
    });
  });

  describe('4. Movement', () => {
    it('moves the active piece left and right within bounds', () => {
      const state = playingState({ active: spawnPiece('T') });
      const movedRight = tryMove(state, 0, 1);
      assert.strictEqual(movedRight.active?.col, (state.active as ActivePiece).col + 1);

      const movedLeft = tryMove(state, 0, -1);
      assert.strictEqual(movedLeft.active?.col, (state.active as ActivePiece).col - 1);
    });

    it('blocks movement that would leave the board', () => {
      const state = playingState({ active: { type: 'O', rotation: 0, row: 0, col: 0 } });
      const moved = tryMove(state, 0, -1);
      assert.strictEqual(moved.active?.col, 0);
    });

    it('blocks movement into occupied cells', () => {
      const board = createEmptyBoard();
      board[0][5] = 'I';
      const state = playingState({ board, active: { type: 'O', rotation: 0, row: 0, col: 3 } });
      const moved = tryMove(state, 0, 1);
      assert.strictEqual(moved.active?.col, 3);
    });

    it('does nothing when not playing', () => {
      const state = playingState({ status: STATUS_PAUSED });
      const moved = tryMove(state, 0, 1);
      assert.deepStrictEqual(moved, state);
    });
  });

  describe('5. Rotation & Wall Kicks', () => {
    it('rotates a piece in open space without needing a kick', () => {
      const state = playingState({ active: { type: 'T', rotation: 0, row: 5, col: 4 } });
      const rotated = rotate(state, 1);
      assert.strictEqual(rotated.active?.rotation, 1);
    });

    it('kicks an I piece away from the left wall when rotating', () => {
      const board = createEmptyBoard();
      const piece: ActivePiece = { type: 'I', rotation: 0, col: 0, row: 5 };
      const rotated = tryRotate(board, piece, 1);
      assert.ok(rotated, 'expected a valid kicked rotation');
      assert.ok(isValidPlacement(board, rotated as ActivePiece));
    });

    it('fails rotation when fully boxed in with no valid kick', () => {
      // Fill the entire board solid, then carve out only the piece's current footprint.
      // Every rotated orientation (with or without a kick) needs at least one different
      // cell, so it can never find room and rotation must be rejected outright.
      const board = createEmptyBoard();
      for (let row = 0; row < board.length; row++) {
        board[row].fill('I');
      }
      const piece: ActivePiece = { type: 'T', rotation: 0, row: 4, col: 3 };
      for (const { row, col } of getOccupiedCoordinates(piece)) {
        board[row][col] = null;
      }

      const rotated = tryRotate(board, piece, 1);
      assert.strictEqual(rotated, null);
    });

    it('does nothing when not playing', () => {
      const state = playingState({ status: STATUS_IDLE });
      const rotated = rotate(state, 1);
      assert.deepStrictEqual(rotated, state);
    });
  });

  describe('6. Soft Drop & Hard Drop', () => {
    it('soft drop moves the piece down one row and scores 1 point per cell', () => {
      const state = playingState({ active: { type: 'O', rotation: 0, row: 5, col: 4 } });
      const dropped = softDrop(state, Math.random);
      assert.strictEqual(dropped.active?.row, 6);
      assert.strictEqual(dropped.score, SOFT_DROP_POINTS_PER_CELL);
    });

    it('soft drop locks the piece when it cannot move further down', () => {
      const board = createEmptyBoard();
      const bottomRow = TOTAL_ROWS - 1;
      const piece: ActivePiece = { type: 'O', rotation: 0, row: bottomRow - 1, col: 4 };
      const state = playingState({ board, active: piece });
      const dropped = softDrop(state, () => 0.5);
      // Piece has locked into the board and a brand-new active piece has spawned.
      assert.ok(dropped.board[bottomRow].some((cell) => cell === 'O'));
      assert.notStrictEqual(dropped.active, piece);
    });

    it('hard drop instantly places the piece at its ghost position and scores 2 points per cell', () => {
      const board = createEmptyBoard();
      const piece: ActivePiece = { type: 'O', rotation: 0, row: 0, col: 4 };
      const state = playingState({ board, active: piece });
      const ghost = getGhostPiece(board, piece);
      const expectedCells = ghost.row - piece.row;

      const dropped = hardDrop(state, () => 0.5);
      assert.strictEqual(dropped.score, expectedCells * HARD_DROP_POINTS_PER_CELL);
      // The piece should already be locked (merged) since hard drop locks immediately.
      assert.ok(dropped.board[TOTAL_ROWS - 1].some((cell) => cell === 'O'));
    });
  });

  describe('7. Line Clearing & Scoring', () => {
    it('finds every fully occupied row', () => {
      const board = createEmptyBoard();
      board[10] = Array(COLS).fill('I');
      board[15] = Array(COLS).fill('T');
      assert.deepStrictEqual(findFullRows(board), [10, 15]);
    });

    it('removes cleared rows and inserts empty rows at the top', () => {
      const board = createEmptyBoard();
      board[TOTAL_ROWS - 1] = Array(COLS).fill('I');
      board[TOTAL_ROWS - 1][3] = 'T';
      const cleared = clearRows(board, [TOTAL_ROWS - 1]);
      assert.strictEqual(cleared.length, TOTAL_ROWS);
      assert.ok(cleared[0].every((cell) => cell === null));
      assert.ok(cleared[TOTAL_ROWS - 1].every((cell) => cell === null));
    });

    it('scores single, double, triple and tetris clears using guideline values', () => {
      assert.strictEqual(calculateLineClearScore(1, 1), 100);
      assert.strictEqual(calculateLineClearScore(2, 1), 300);
      assert.strictEqual(calculateLineClearScore(3, 1), 500);
      assert.strictEqual(calculateLineClearScore(4, 1), 800);
      assert.strictEqual(calculateLineClearScore(1, 3), 300);
    });

    it('locking a piece that completes a row clears it and awards score', () => {
      const bottomRow = TOTAL_ROWS - 1;
      const board = fillRowExceptCols(createEmptyBoard(), bottomRow, [4, 5]);
      const piece: ActivePiece = { type: 'O', rotation: 0, row: bottomRow - 3, col: 4 };
      const state = playingState({ board, active: piece, score: 0, level: 1 });

      const afterDrop = hardDrop(state, () => 0.5);
      assert.strictEqual(afterDrop.linesCleared, 1);
      // Score includes both the hard-drop distance bonus and the line-clear bonus.
      assert.ok(afterDrop.score > calculateLineClearScore(1, 1));
      // The cleared row is gone and a fresh empty row was inserted at the very top.
      assert.ok(afterDrop.board[0].every((cell) => cell === null));
      assert.strictEqual(afterDrop.board.length, TOTAL_ROWS);
    });
  });

  describe('8. Level Progression & Speed', () => {
    it('increases level every 10 cleared lines', () => {
      assert.strictEqual(calculateLevel(0), 1);
      assert.strictEqual(calculateLevel(9), 1);
      assert.strictEqual(calculateLevel(10), 2);
      assert.strictEqual(calculateLevel(25), 3);
    });

    it('reduces gravity interval as level increases, clamped at the minimum', () => {
      const level1 = calculateGravityMs(1);
      const level5 = calculateGravityMs(5);
      const level100 = calculateGravityMs(100);
      assert.ok(level5 < level1);
      assert.strictEqual(level100, MIN_GRAVITY_MS);
    });
  });

  describe('9. Hold Piece', () => {
    it('moves the active piece into hold and spawns a fresh piece on first use', () => {
      const state = playingState({ active: { type: 'T', rotation: 0, row: 0, col: 3 } });
      const held = hold(state, () => 0.5);
      assert.strictEqual(held.holdType, 'T');
      assert.strictEqual(held.canHold, false);
      assert.notStrictEqual(held.active?.type, undefined);
    });

    it('swaps the active piece with the held piece on the second use', () => {
      const state = playingState({
        active: { type: 'T', rotation: 0, row: 0, col: 3 },
        holdType: 'I',
        canHold: true,
      });
      const held = hold(state, () => 0.5);
      assert.strictEqual(held.holdType, 'T');
      assert.strictEqual(held.active?.type, 'I');
    });

    it('cannot hold twice before the piece locks', () => {
      const state = playingState({ active: { type: 'T', rotation: 0, row: 0, col: 3 } });
      const held = hold(state, () => 0.5);
      const heldAgain = hold(held, () => 0.5);
      assert.deepStrictEqual(heldAgain, held);
    });

    it('re-enables hold after the active piece locks', () => {
      const bottomRow = TOTAL_ROWS - 1;
      const board = createEmptyBoard();
      const piece: ActivePiece = { type: 'O', rotation: 0, row: bottomRow - 1, col: 4 };
      const state = playingState({ board, active: piece, canHold: false });
      const dropped = hardDrop(state, () => 0.5);
      assert.strictEqual(dropped.canHold, true);
    });
  });

  describe('10. Gravity Tick & Lock Delay', () => {
    it('moves the piece down on gravity tick when space is available', () => {
      const state = playingState({ active: { type: 'O', rotation: 0, row: 0, col: 4 } });
      const ticked = advanceGravity(state, () => 0.5);
      assert.strictEqual(ticked.active?.row, 1);
    });

    it('accumulates lock delay once grounded and locks after the threshold', () => {
      const bottomRow = TOTAL_ROWS - 1;
      const board = createEmptyBoard();
      let state = playingState({
        board,
        active: { type: 'O', rotation: 0, row: bottomRow - 1, col: 4 },
        gravityMs: 200,
      });

      // First grounded tick starts the lock delay without locking yet.
      state = advanceGravity(state, () => 0.5);
      assert.strictEqual(state.lockDelayMs, 200);
      assert.ok(state.board[bottomRow].every((cell) => cell === null));

      // Enough accumulated delay locks the piece into the board.
      state = advanceGravity(state, () => 0.5);
      state = advanceGravity(state, () => 0.5);
      assert.ok(state.board[bottomRow].some((cell) => cell === 'O'));
    });

    it('does not advance when paused or idle', () => {
      const state = playingState({ status: STATUS_PAUSED });
      const ticked = advanceGravity(state, () => 0.5);
      assert.deepStrictEqual(ticked, state);
    });
  });

  describe('11. Game Over', () => {
    it('ends the game when a newly spawned piece has no room', () => {
      const board = createEmptyBoard();
      // Block the spawn area (but leave one gap so these rows aren't themselves clearable).
      board[0].fill('I');
      board[0][9] = null;
      board[1].fill('I');
      board[1][9] = null;
      const bottomRow = TOTAL_ROWS - 1;
      const piece: ActivePiece = { type: 'O', rotation: 0, row: bottomRow - 1, col: 4 };
      const state = playingState({ board, active: piece });

      const dropped = hardDrop(state, () => 0.5);
      assert.strictEqual(dropped.status, STATUS_GAME_OVER);
      assert.strictEqual(dropped.active, null);
    });
  });

  describe('12. Reducer: Lifecycle Actions', () => {
    it('transitions idle -> countdown -> playing', () => {
      let state = createInitialTetrisState(0, () => 0.5);
      state = tetrisReducer(state, { type: 'START' }, () => 0.5);
      assert.strictEqual(state.status, STATUS_COUNTDOWN);

      state = tetrisReducer(state, { type: 'COUNTDOWN_TICK' }, () => 0.5);
      state = tetrisReducer(state, { type: 'COUNTDOWN_TICK' }, () => 0.5);
      state = tetrisReducer(state, { type: 'COUNTDOWN_TICK' }, () => 0.5);
      assert.strictEqual(state.status, STATUS_PLAYING);
    });

    it('pauses and resumes', () => {
      let state = playingState();
      state = tetrisReducer(state, { type: 'PAUSE' }, () => 0.5);
      assert.strictEqual(state.status, STATUS_PAUSED);

      const stillPaused = tetrisReducer(state, { type: 'TICK' }, () => 0.5);
      assert.strictEqual(stillPaused.status, STATUS_PAUSED);

      state = tetrisReducer(state, { type: 'RESUME' }, () => 0.5);
      assert.strictEqual(state.status, STATUS_PLAYING);
    });

    it('restart resets the board and score but preserves the high score', () => {
      const state = playingState({ score: 999, highScore: 999, linesCleared: 12 });
      const restarted = tetrisReducer(state, { type: 'RESTART' }, () => 0.5);
      assert.strictEqual(restarted.status, STATUS_COUNTDOWN);
      assert.strictEqual(restarted.score, 0);
      assert.strictEqual(restarted.linesCleared, 0);
      assert.strictEqual(restarted.highScore, 999);
    });

    it('SET_HIGH_SCORE never lowers the existing high score', () => {
      const state = playingState({ highScore: 500 });
      const lowered = tetrisReducer(state, { type: 'SET_HIGH_SCORE', highScore: 100 }, () => 0.5);
      assert.strictEqual(lowered.highScore, 500);

      const raised = tetrisReducer(state, { type: 'SET_HIGH_SCORE', highScore: 1000 }, () => 0.5);
      assert.strictEqual(raised.highScore, 1000);
    });
  });

  describe('13. Ghost Piece', () => {
    it('projects straight down to the lowest valid resting row', () => {
      const board = createEmptyBoard();
      const piece: ActivePiece = { type: 'O', rotation: 0, row: 0, col: 4 };
      const ghost = getGhostPiece(board, piece);
      assert.strictEqual(ghost.row, TOTAL_ROWS - 2);
    });

    it('stops on top of existing terrain', () => {
      const board = createEmptyBoard();
      board[10][4] = 'I';
      board[10][5] = 'I';
      const piece: ActivePiece = { type: 'O', rotation: 0, row: 0, col: 4 };
      const ghost = getGhostPiece(board, piece);
      assert.strictEqual(ghost.row, 8);
    });
  });

  describe('14. Merge Into Board', () => {
    it('writes the piece type into every occupied cell', () => {
      const board = createEmptyBoard();
      const piece: ActivePiece = { type: 'L', rotation: 0, row: 0, col: 0 };
      const merged = mergePieceIntoBoard(board, piece);
      const occupied = getOccupiedCoordinates(piece);
      for (const { row, col } of occupied) {
        assert.strictEqual(merged[row][col], 'L');
      }
      // Original board is untouched (pure function).
      assert.ok(board.every((row) => row.every((cell) => cell === null)));
    });
  });

  describe('15. TetrisEngine Integration', () => {
    it('drives a full countdown -> playing -> pause -> resume -> restart cycle', () => {
      const engine = new TetrisEngine(250, seededRandom([0.1, 0.4, 0.7]));
      engine.start();
      assert.strictEqual(engine.getState().status, STATUS_COUNTDOWN);

      engine.countdownTick();
      engine.countdownTick();
      engine.countdownTick();
      assert.strictEqual(engine.getState().status, STATUS_PLAYING);

      engine.pause();
      assert.strictEqual(engine.getState().status, STATUS_PAUSED);
      engine.resume();
      assert.strictEqual(engine.getState().status, STATUS_PLAYING);

      engine.restart();
      assert.strictEqual(engine.getState().status, STATUS_COUNTDOWN);
      assert.strictEqual(engine.getState().highScore, 250);
      assert.strictEqual(engine.isGameOver(), false);
    });

    it('notifies subscribers on every dispatch', () => {
      const engine = new TetrisEngine(0, () => 0.5);
      let callCount = 0;
      const unsubscribe = engine.subscribe(() => {
        callCount++;
      });
      engine.start();
      engine.countdownTick();
      unsubscribe();
      engine.countdownTick();
      assert.strictEqual(callCount, 2);
    });

    it('moveLeft/moveRight/rotate/hold delegate to the reducer', () => {
      const engine = new TetrisEngine(0, () => 0.5);
      engine.start();
      engine.countdownTick();
      engine.countdownTick();
      engine.countdownTick();
      const startingCol = engine.getState().active?.col ?? 0;

      engine.moveRight();
      assert.strictEqual(engine.getState().active?.col, startingCol + 1);

      engine.moveLeft();
      assert.strictEqual(engine.getState().active?.col, startingCol);

      const startingType = engine.getState().active?.type;
      engine.hold();
      assert.strictEqual(engine.getState().holdType, startingType);
    });
  });
});
