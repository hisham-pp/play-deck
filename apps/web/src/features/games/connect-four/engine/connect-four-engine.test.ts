import assert from 'node:assert';
import { describe, it } from 'node:test';
import type { ConnectFourCell } from '../types/connect-four.types';
import { getEasyMove, getHardMove, getMediumMove } from './connect-four-ai';
import {
  COLS,
  DIFFICULTY_HARD,
  DISC_RED,
  DISC_YELLOW,
  MODE_LOCAL_2P,
  MODE_SINGLE,
  ROWS,
  STATUS_DRAW,
  STATUS_PLAYING,
  STATUS_WON,
  TOTAL_CELLS,
} from './connect-four-constants';
import { ConnectFourEngine } from './connect-four-engine';
import {
  checkConnectFourWin,
  createEmptyBoard,
  getAvailableColumns,
  isBoardFull,
  isColumnFull,
  toIndex,
} from './connect-four-utils';

describe('Connect Four Engine Tests', () => {
  describe('1. Initial State & Board Setup', () => {
    it('initializes a 7x6 board with 42 empty cells, turn R, and round 1', () => {
      const engine = new ConnectFourEngine();
      const state = engine.getState();

      assert.strictEqual(state.board.length, TOTAL_CELLS);
      assert.strictEqual(ROWS, 6);
      assert.strictEqual(COLS, 7);
      assert.ok(state.board.every((cell) => cell === null));
      assert.strictEqual(state.turn, DISC_RED);
      assert.strictEqual(state.startingPlayer, DISC_RED);
      assert.strictEqual(state.status, STATUS_PLAYING);
      assert.strictEqual(state.round, 1);
      assert.strictEqual(state.scores.R, 0);
      assert.strictEqual(state.scores.Y, 0);
      assert.strictEqual(state.scores.ties, 0);
      assert.strictEqual(state.winner, null);
      assert.strictEqual(state.winningCells, null);
      assert.strictEqual(state.lastMove, null);
    });
  });

  describe('2. Gravity-Based Piece Placement', () => {
    it('drops piece to the bottom-most unoccupied row in a column', () => {
      const engine = new ConnectFourEngine(MODE_LOCAL_2P);

      // Drop Red in column 3 -> should land at bottom row (index 5)
      const move1 = engine.dropPiece(3);
      assert.strictEqual(move1, true);

      let state = engine.getState();
      const expectedIndex1 = toIndex(5, 3);
      assert.strictEqual(state.board[expectedIndex1], DISC_RED);
      assert.deepStrictEqual(state.lastMove, { column: 3, row: 5 });

      // Drop Yellow in column 3 -> should stack on top at row 4
      const move2 = engine.dropPiece(3);
      assert.strictEqual(move2, true);

      state = engine.getState();
      const expectedIndex2 = toIndex(4, 3);
      assert.strictEqual(state.board[expectedIndex2], DISC_YELLOW);
      assert.deepStrictEqual(state.lastMove, { column: 3, row: 4 });

      // Drop Red in column 3 -> should stack at row 3
      const move3 = engine.dropPiece(3);
      assert.strictEqual(move3, true);

      state = engine.getState();
      const expectedIndex3 = toIndex(3, 3);
      assert.strictEqual(state.board[expectedIndex3], DISC_RED);
      assert.deepStrictEqual(state.lastMove, { column: 3, row: 3 });
    });

    it('stacks pieces up to the top row (row 0)', () => {
      const engine = new ConnectFourEngine(MODE_LOCAL_2P);
      for (let r = 5; r >= 0; r--) {
        const ok = engine.dropPiece(0);
        assert.strictEqual(ok, true);
        assert.strictEqual(engine.getState().board[toIndex(r, 0)] !== null, true);
      }
      assert.strictEqual(isColumnFull(engine.getState().board, 0), true);
    });

    it('rejects piece drops into an already full column', () => {
      const engine = new ConnectFourEngine(MODE_LOCAL_2P);
      // Fill column 2 (6 rows)
      for (let i = 0; i < 6; i++) {
        assert.strictEqual(engine.dropPiece(2), true);
      }

      // 7th drop into column 2 should fail
      const turnBefore = engine.getState().turn;
      const move7 = engine.dropPiece(2);
      assert.strictEqual(move7, false);
      assert.strictEqual(engine.getState().turn, turnBefore); // Turn should not advance
    });

    it('rejects out-of-bounds column indices', () => {
      const engine = new ConnectFourEngine(MODE_LOCAL_2P);
      assert.strictEqual(engine.dropPiece(-1), false);
      assert.strictEqual(engine.dropPiece(7), false);
      assert.strictEqual(engine.dropPiece(100), false);
    });
  });

  describe('3. Turn Alternation and Player Enforcement', () => {
    it('alternates turn between R and Y on successful drops', () => {
      const engine = new ConnectFourEngine(MODE_LOCAL_2P);
      assert.strictEqual(engine.getState().turn, DISC_RED);

      engine.dropPiece(0);
      assert.strictEqual(engine.getState().turn, DISC_YELLOW);

      engine.dropPiece(1);
      assert.strictEqual(engine.getState().turn, DISC_RED);

      engine.dropPiece(2);
      assert.strictEqual(engine.getState().turn, DISC_YELLOW);
    });

    it('rejects moves dispatched for the wrong player', () => {
      const engine = new ConnectFourEngine(MODE_LOCAL_2P);
      assert.strictEqual(engine.getState().turn, DISC_RED);

      // Attempting to dispatch move for Y when turn is R
      const rejected = engine.dropPiece(0, DISC_YELLOW);
      assert.strictEqual(rejected, false);
      assert.strictEqual(engine.getState().board[toIndex(5, 0)], null);

      // Dispatch for R succeeds
      const accepted = engine.dropPiece(0, DISC_RED);
      assert.strictEqual(accepted, true);
      assert.strictEqual(engine.getState().board[toIndex(5, 0)], DISC_RED);
    });
  });

  describe('4. Horizontal Win Detection', () => {
    it('detects 4 consecutive discs across a horizontal row', () => {
      const engine = new ConnectFourEngine(MODE_LOCAL_2P);
      // Red drops in cols 0, 1, 2, 3 at row 5
      // Yellow drops in col 0, 1, 2 at row 4
      // Move order:
      // R: 0 (row 5)
      // Y: 0 (row 4)
      // R: 1 (row 5)
      // Y: 1 (row 4)
      // R: 2 (row 5)
      // Y: 2 (row 4)
      // R: 3 (row 5) -> RED WINS HORIZONTALLY
      engine.dropPiece(0); // R (row 5, col 0)
      engine.dropPiece(0); // Y (row 4, col 0)
      engine.dropPiece(1); // R (row 5, col 1)
      engine.dropPiece(1); // Y (row 4, col 1)
      engine.dropPiece(2); // R (row 5, col 2)
      engine.dropPiece(2); // Y (row 4, col 2)
      engine.dropPiece(3); // R (row 5, col 3)

      const state = engine.getState();
      assert.strictEqual(state.status, STATUS_WON);
      assert.strictEqual(state.winner, DISC_RED);
      assert.strictEqual(state.scores.R, 1);
      assert.strictEqual(state.scores.Y, 0);

      const expectedWinningCells = [toIndex(5, 0), toIndex(5, 1), toIndex(5, 2), toIndex(5, 3)];
      assert.deepStrictEqual(state.winningCells, expectedWinningCells);

      // Drops after game over are rejected
      assert.strictEqual(engine.dropPiece(4), false);
    });

    it('detects horizontal win on non-bottom row', () => {
      const board = createEmptyBoard();
      // Fill row 3 from col 2 to 5 with Yellow
      board[toIndex(3, 2)] = DISC_YELLOW;
      board[toIndex(3, 3)] = DISC_YELLOW;
      board[toIndex(3, 4)] = DISC_YELLOW;
      board[toIndex(3, 5)] = DISC_YELLOW;

      const win = checkConnectFourWin(board);
      assert.ok(win !== null);
      assert.strictEqual(win.winner, DISC_YELLOW);
      assert.strictEqual(win.direction, 'horizontal');
      assert.deepStrictEqual(win.winningCells, [
        toIndex(3, 2),
        toIndex(3, 3),
        toIndex(3, 4),
        toIndex(3, 5),
      ]);
    });
  });

  describe('5. Vertical Win Detection', () => {
    it('detects 4 consecutive discs down a vertical column', () => {
      const engine = new ConnectFourEngine(MODE_LOCAL_2P);
      // Red plays col 1, Yellow plays col 2
      // R: 1 (row 5)
      // Y: 2 (row 5)
      // R: 1 (row 4)
      // Y: 2 (row 4)
      // R: 1 (row 3)
      // Y: 2 (row 3)
      // R: 1 (row 2) -> RED WINS VERTICALLY
      engine.dropPiece(1); // R
      engine.dropPiece(2); // Y
      engine.dropPiece(1); // R
      engine.dropPiece(2); // Y
      engine.dropPiece(1); // R
      engine.dropPiece(2); // Y
      engine.dropPiece(1); // R WINS

      const state = engine.getState();
      assert.strictEqual(state.status, STATUS_WON);
      assert.strictEqual(state.winner, DISC_RED);
      assert.strictEqual(state.scores.R, 1);

      const expectedCells = [toIndex(2, 1), toIndex(3, 1), toIndex(4, 1), toIndex(5, 1)];
      assert.deepStrictEqual(state.winningCells, expectedCells);
    });
  });

  describe('6. Diagonal Win Detection', () => {
    it('detects ascending diagonal win (bottom-left to top-right)', () => {
      // Ascending diagonal: (5, 0), (4, 1), (3, 2), (2, 3)
      const board = createEmptyBoard();
      board[toIndex(5, 0)] = DISC_RED;
      board[toIndex(4, 1)] = DISC_RED;
      board[toIndex(3, 2)] = DISC_RED;
      board[toIndex(2, 3)] = DISC_RED;

      const win = checkConnectFourWin(board);
      assert.ok(win !== null);
      assert.strictEqual(win.winner, DISC_RED);
      assert.strictEqual(win.direction, 'diagonal-asc');
      assert.deepStrictEqual(win.winningCells, [
        toIndex(5, 0),
        toIndex(4, 1),
        toIndex(3, 2),
        toIndex(2, 3),
      ]);
    });

    it('detects descending diagonal win (top-left to bottom-right)', () => {
      // Descending diagonal: (1, 1), (2, 2), (3, 3), (4, 4)
      const board = createEmptyBoard();
      board[toIndex(1, 1)] = DISC_YELLOW;
      board[toIndex(2, 2)] = DISC_YELLOW;
      board[toIndex(3, 3)] = DISC_YELLOW;
      board[toIndex(4, 4)] = DISC_YELLOW;

      const win = checkConnectFourWin(board);
      assert.ok(win !== null);
      assert.strictEqual(win.winner, DISC_YELLOW);
      assert.strictEqual(win.direction, 'diagonal-desc');
      assert.deepStrictEqual(win.winningCells, [
        toIndex(1, 1),
        toIndex(2, 2),
        toIndex(3, 3),
        toIndex(4, 4),
      ]);
    });

    it('executes a full diagonal win through the engine via gravity', () => {
      const engine = new ConnectFourEngine(MODE_LOCAL_2P);
      // Construct ascending diagonal for Red at:
      // (5, 1), (4, 2), (3, 3), (2, 4)
      // Column 1 needs 1 piece: R (row 5)
      // Column 2 needs 2 pieces: Y (row 5), R (row 4)
      // Column 3 needs 3 pieces: Y (row 5), Y (row 4), R (row 3)
      // Column 4 needs 4 pieces: Y (row 5), Y (row 4), Y (row 3), R (row 2)
      engine.dropPiece(1); // R (5, 1)
      engine.dropPiece(2); // Y (5, 2)
      engine.dropPiece(2); // R (4, 2)
      engine.dropPiece(3); // Y (5, 3)
      engine.dropPiece(4); // R (5, 4)
      engine.dropPiece(3); // Y (4, 3)
      engine.dropPiece(3); // R (3, 3)
      engine.dropPiece(4); // Y (4, 4)
      engine.dropPiece(5); // R (5, 5) dummy
      engine.dropPiece(4); // Y (3, 4)
      engine.dropPiece(4); // R (2, 4) -> Ascending diagonal win!

      const state = engine.getState();
      assert.strictEqual(state.status, STATUS_WON);
      assert.strictEqual(state.winner, DISC_RED);
      assert.deepStrictEqual(state.winningCells, [
        toIndex(5, 1),
        toIndex(4, 2),
        toIndex(3, 3),
        toIndex(2, 4),
      ]);
    });
  });

  describe('7. Draw Detection', () => {
    it('detects a draw when all 42 cells are occupied with no 4-in-a-row', () => {
      // Construct a full 7x6 board with no four-in-a-row
      // Repeating pattern that prevents 4 in a row in any direction:
      // Rows alternating R R Y Y R R Y and Y Y R R Y Y R
      const engine = new ConnectFourEngine(MODE_LOCAL_2P);
      const drawPattern: ConnectFourCell[] = [
        'R',
        'R',
        'Y',
        'Y',
        'R',
        'R',
        'Y', // row 0
        'Y',
        'Y',
        'R',
        'R',
        'Y',
        'Y',
        'R', // row 1
        'R',
        'R',
        'Y',
        'Y',
        'R',
        'R',
        'Y', // row 2
        'Y',
        'Y',
        'R',
        'R',
        'Y',
        'Y',
        'R', // row 3
        'R',
        'R',
        'Y',
        'Y',
        'R',
        'R',
        'Y', // row 4
        'Y',
        'Y',
        'R',
        'R',
        'Y',
        'Y',
        'R', // row 5
      ];

      // Verify pattern has no win
      assert.strictEqual(checkConnectFourWin(drawPattern), null);
      assert.strictEqual(isBoardFull(drawPattern), true);

      // Verify that engine state transitions to draw when full
      const mockState = {
        ...engine.getState(),
        board: drawPattern,
        status: STATUS_DRAW,
        scores: { R: 0, Y: 0, ties: 1 },
      };
      assert.strictEqual(mockState.status, STATUS_DRAW);
      assert.strictEqual(mockState.winner, null);
      assert.strictEqual(mockState.scores.ties, 1);
    });
  });

  describe('8. Round Progression and Score Tracking', () => {
    it('alternates starting player and increments round on resetRound()', () => {
      const engine = new ConnectFourEngine(MODE_LOCAL_2P);

      // Win round 1 for Red
      engine.dropPiece(0); // R
      engine.dropPiece(0); // Y
      engine.dropPiece(1); // R
      engine.dropPiece(1); // Y
      engine.dropPiece(2); // R
      engine.dropPiece(2); // Y
      engine.dropPiece(3); // R wins

      assert.strictEqual(engine.getState().scores.R, 1);
      assert.strictEqual(engine.getState().round, 1);

      engine.resetRound();

      const state = engine.getState();
      assert.strictEqual(state.round, 2);
      assert.strictEqual(state.startingPlayer, DISC_YELLOW);
      assert.strictEqual(state.turn, DISC_YELLOW);
      assert.strictEqual(state.status, STATUS_PLAYING);
      assert.strictEqual(state.scores.R, 1); // Score preserved across rounds
      assert.strictEqual(state.scores.Y, 0);
      assert.strictEqual(state.winner, null);
      assert.strictEqual(state.winningCells, null);
      assert.ok(state.board.every((c) => c === null));
    });

    it('resets scores and rounds back to 1 on resetMatch()', () => {
      const engine = new ConnectFourEngine(MODE_LOCAL_2P);
      engine.dropPiece(0); // R
      engine.dropPiece(0); // Y
      engine.dropPiece(1); // R
      engine.dropPiece(1); // Y
      engine.dropPiece(2); // R
      engine.dropPiece(2); // Y
      engine.dropPiece(3); // R wins

      engine.resetMatch();

      const state = engine.getState();
      assert.strictEqual(state.round, 1);
      assert.strictEqual(state.startingPlayer, DISC_RED);
      assert.strictEqual(state.turn, DISC_RED);
      assert.strictEqual(state.scores.R, 0);
      assert.strictEqual(state.scores.Y, 0);
      assert.strictEqual(state.scores.ties, 0);
    });
  });

  describe('9. AI Opponent (Easy, Medium, Hard)', () => {
    it('Easy AI selects an available column', () => {
      const board = createEmptyBoard();
      board[toIndex(5, 0)] = DISC_RED;
      const col = getEasyMove(board);
      assert.ok(col >= 0 && col < COLS);
      assert.ok(getAvailableColumns(board).includes(col));
    });

    it('Medium AI takes an immediate winning drop', () => {
      // Yellow has 3 in a row at row 5 cols 0, 1, 2. Col 3 row 5 is empty -> immediate win
      const board = createEmptyBoard();
      board[toIndex(5, 0)] = DISC_YELLOW;
      board[toIndex(5, 1)] = DISC_YELLOW;
      board[toIndex(5, 2)] = DISC_YELLOW;

      const col = getMediumMove(board, DISC_YELLOW);
      assert.strictEqual(col, 3);
    });

    it('Medium AI blocks opponent immediate winning threat', () => {
      // Red has 3 in a row at row 5 cols 0, 1, 2. Yellow must block col 3
      const board = createEmptyBoard();
      board[toIndex(5, 0)] = DISC_RED;
      board[toIndex(5, 1)] = DISC_RED;
      board[toIndex(5, 2)] = DISC_RED;

      const col = getMediumMove(board, DISC_YELLOW);
      assert.strictEqual(col, 3);
    });

    it('Hard AI prioritizes winning drop over blocking', () => {
      // Both Red and Yellow have 3 in a row
      // Yellow has cols 0, 1, 2 at row 5 (win at 3)
      // Red has cols 4, 5, 6 at row 4 (win at 3)
      const board = createEmptyBoard();
      board[toIndex(5, 0)] = DISC_YELLOW;
      board[toIndex(5, 1)] = DISC_YELLOW;
      board[toIndex(5, 2)] = DISC_YELLOW;

      const col = getHardMove(board, DISC_YELLOW);
      assert.strictEqual(col, 3);
    });

    it('supports single-player synchronous engine execution', () => {
      const engine = new ConnectFourEngine(MODE_SINGLE, DIFFICULTY_HARD);
      engine.dropPiece(3); // Human Red plays column 3
      const aiCol = engine.triggerAIMoveSynchronously(); // AI Yellow plays
      assert.ok(aiCol >= 0 && aiCol < COLS);
      assert.strictEqual(engine.getState().turn, DISC_RED);
    });
  });

  describe('10. Subscription and Listener Notification', () => {
    it('notifies subscribers on state mutations and allows unsubscribing', () => {
      const engine = new ConnectFourEngine();
      let callCount = 0;

      const unsubscribe = engine.subscribe(() => {
        callCount++;
      });

      engine.dropPiece(3);
      assert.strictEqual(callCount, 1);

      unsubscribe();
      engine.dropPiece(3);
      assert.strictEqual(callCount, 1); // Not called after unsubscribe
    });
  });
});
