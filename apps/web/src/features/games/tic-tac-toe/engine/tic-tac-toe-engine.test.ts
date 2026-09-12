import assert from 'node:assert';
import { describe, it } from 'node:test';
import type { BoardCell } from '../types/tic-tac-toe.types';
import { computeAIMove, getEasyMove, getHardMove, getMediumMove } from './tic-tac-toe-ai';
import {
  DIFFICULTY_EASY,
  DIFFICULTY_HARD,
  DIFFICULTY_MEDIUM,
  MARK_O,
  MARK_X,
  MODE_LOCAL_2P,
  MODE_SINGLE,
  STATUS_DRAW,
  STATUS_PLAYING,
  STATUS_WON,
  WINNING_COMBINATIONS,
} from './tic-tac-toe-constants';
import { TicTacToeEngine } from './tic-tac-toe-engine';
import { checkWin, getAvailableMoves, isBoardFull } from './tic-tac-toe-utils';

describe('Tic-Tac-Toe Engine Tests', () => {
  describe('1. Initial State & Board Setup', () => {
    it('initializes a 3x3 board with 9 empty cells, turn X, and round 1', () => {
      const engine = new TicTacToeEngine();
      const state = engine.getState();

      assert.strictEqual(state.board.length, 9);
      assert.ok(state.board.every((cell) => cell === null));
      assert.strictEqual(state.turn, MARK_X);
      assert.strictEqual(state.startingPlayer, MARK_X);
      assert.strictEqual(state.status, STATUS_PLAYING);
      assert.strictEqual(state.round, 1);
      assert.strictEqual(state.scores.X, 0);
      assert.strictEqual(state.scores.O, 0);
      assert.strictEqual(state.scores.ties, 0);
      assert.strictEqual(state.winner, null);
      assert.strictEqual(state.winningLine, null);
    });
  });

  describe('2. Turn Alternation and Move Validation', () => {
    it('places mark and alternates turn from X to O', () => {
      const engine = new TicTacToeEngine(MODE_LOCAL_2P);
      assert.strictEqual(engine.getState().turn, MARK_X);

      const ok = engine.makeMove(0);
      assert.strictEqual(ok, true);
      assert.strictEqual(engine.getState().board[0], MARK_X);
      assert.strictEqual(engine.getState().turn, MARK_O);

      const ok2 = engine.makeMove(4);
      assert.strictEqual(ok2, true);
      assert.strictEqual(engine.getState().board[4], MARK_O);
      assert.strictEqual(engine.getState().turn, MARK_X);
    });

    it('rejects moves onto already occupied cells', () => {
      const engine = new TicTacToeEngine(MODE_LOCAL_2P);
      engine.makeMove(0);
      const invalidMove = engine.makeMove(0);

      assert.strictEqual(invalidMove, false);
      assert.strictEqual(engine.getState().board[0], MARK_X);
      assert.strictEqual(engine.getState().turn, MARK_O);
    });

    it('rejects out-of-bounds indices', () => {
      const engine = new TicTacToeEngine(MODE_LOCAL_2P);
      assert.strictEqual(engine.makeMove(-1), false);
      assert.strictEqual(engine.makeMove(9), false);
      assert.strictEqual(engine.makeMove(100), false);
    });

    it('rejects moves after the game is over', () => {
      const engine = new TicTacToeEngine(MODE_LOCAL_2P);
      // X wins row 0: 0, 1, 2
      engine.makeMove(0); // X
      engine.makeMove(3); // O
      engine.makeMove(1); // X
      engine.makeMove(4); // O
      engine.makeMove(2); // X wins

      assert.strictEqual(engine.getState().status, STATUS_WON);
      assert.strictEqual(engine.makeMove(5), false);
    });
  });

  describe('3. Win Detection (Rows, Columns, Diagonals)', () => {
    it('detects wins for all 8 winning combinations', () => {
      for (const combo of WINNING_COMBINATIONS) {
        const board: BoardCell[] = Array(9).fill(null);
        board[combo[0]] = MARK_X;
        board[combo[1]] = MARK_X;
        board[combo[2]] = MARK_X;

        const result = checkWin(board);
        assert.ok(result !== null);
        assert.strictEqual(result.winner, MARK_X);
        assert.deepStrictEqual(result.line, combo);
      }
    });

    it('detects diagonal win for O', () => {
      const engine = new TicTacToeEngine(MODE_LOCAL_2P);
      // X plays off-diagonal, O plays main diagonal [0, 4, 8]
      engine.makeMove(1); // X
      engine.makeMove(0); // O
      engine.makeMove(2); // X
      engine.makeMove(4); // O
      engine.makeMove(5); // X
      engine.makeMove(8); // O wins!

      const state = engine.getState();
      assert.strictEqual(state.status, STATUS_WON);
      assert.strictEqual(state.winner, MARK_O);
      assert.deepStrictEqual(state.winningLine, [0, 4, 8]);
      assert.strictEqual(state.scores.O, 1);
      assert.strictEqual(state.scores.X, 0);
    });
  });

  describe('4. Draw Detection', () => {
    it('detects a draw when all 9 cells are occupied with no winner', () => {
      const engine = new TicTacToeEngine(MODE_LOCAL_2P);
      // Board sequence leading to draw:
      // X O X
      // X O O
      // O X X
      // Indices:
      // 0: X, 1: O, 2: X
      // 3: X, 4: O, 5: O
      // 6: O, 7: X, 8: X
      engine.makeMove(0); // X
      engine.makeMove(1); // O
      engine.makeMove(2); // X
      engine.makeMove(4); // O
      engine.makeMove(3); // X
      engine.makeMove(5); // O
      engine.makeMove(7); // X
      engine.makeMove(6); // O
      engine.makeMove(8); // X

      const state = engine.getState();
      assert.strictEqual(state.status, STATUS_DRAW);
      assert.strictEqual(state.winner, null);
      assert.strictEqual(state.scores.ties, 1);
      assert.strictEqual(isBoardFull(state.board), true);
    });
  });

  describe('5. Round Progression and Score Tracking', () => {
    it('alternates starting player and increments round counter on resetRound()', () => {
      const engine = new TicTacToeEngine(MODE_LOCAL_2P);
      // Finish round 1 with X win
      engine.makeMove(0); // X
      engine.makeMove(3); // O
      engine.makeMove(1); // X
      engine.makeMove(4); // O
      engine.makeMove(2); // X wins

      assert.strictEqual(engine.getState().scores.X, 1);
      assert.strictEqual(engine.getState().round, 1);

      engine.resetRound();

      const state = engine.getState();
      assert.strictEqual(state.round, 2);
      assert.strictEqual(state.startingPlayer, MARK_O);
      assert.strictEqual(state.turn, MARK_O);
      assert.strictEqual(state.status, STATUS_PLAYING);
      assert.strictEqual(state.scores.X, 1); // Score preserved!
      assert.ok(state.board.every((c) => c === null));
    });

    it('resets scores and rounds back to 1 on resetMatch()', () => {
      const engine = new TicTacToeEngine(MODE_LOCAL_2P);
      engine.makeMove(0);
      engine.makeMove(3);
      engine.makeMove(1);
      engine.makeMove(4);
      engine.makeMove(2); // X wins

      engine.resetMatch();
      const state = engine.getState();
      assert.strictEqual(state.round, 1);
      assert.strictEqual(state.startingPlayer, MARK_X);
      assert.strictEqual(state.turn, MARK_X);
      assert.strictEqual(state.scores.X, 0);
      assert.strictEqual(state.scores.O, 0);
      assert.strictEqual(state.scores.ties, 0);
    });
  });

  describe('6. AI - Easy Mode', () => {
    it('selects an available empty cell', () => {
      const board: BoardCell[] = [
        MARK_X,
        MARK_O,
        MARK_X,
        MARK_O,
        null,
        MARK_O,
        MARK_X,
        MARK_X,
        MARK_O,
      ];
      const move = getEasyMove(board);
      assert.strictEqual(move, 4);

      const computedMove = computeAIMove(board, MARK_O, DIFFICULTY_EASY);
      assert.strictEqual(computedMove, 4);
    });

    it('returns valid moves over multiple random samples', () => {
      const board: BoardCell[] = Array(9).fill(null);
      board[0] = MARK_X;
      board[8] = MARK_O;

      for (let i = 0; i < 20; i++) {
        const move = getEasyMove(board);
        assert.ok(move !== 0 && move !== 8);
        assert.ok(move >= 0 && move <= 8);
      }
    });
  });

  describe('7. AI - Medium Mode', () => {
    it('takes the winning move when available', () => {
      // O has [0, 1] filled, index 2 is empty -> immediate win
      const board: BoardCell[] = [MARK_O, MARK_O, null, MARK_X, MARK_X, null, null, null, null];
      const move = getMediumMove(board, MARK_O);
      assert.strictEqual(move, 2);

      const computed = computeAIMove(board, MARK_O, DIFFICULTY_MEDIUM);
      assert.strictEqual(computed, 2);
    });

    it('blocks opponent immediate winning threat', () => {
      // X has [3, 4] filled, threatening index 5. O must block 5.
      const board: BoardCell[] = [MARK_O, null, null, MARK_X, MARK_X, null, null, null, null];
      const move = getMediumMove(board, MARK_O);
      assert.strictEqual(move, 5);

      const computed = computeAIMove(board, MARK_O, DIFFICULTY_MEDIUM);
      assert.strictEqual(computed, 5);
    });
  });

  describe('8. AI - Hard Mode (Optimal Minimax)', () => {
    it('computes optimal hard move through computeAIMove dispatcher', () => {
      const board: BoardCell[] = [MARK_O, MARK_O, null, MARK_X, MARK_X, null, null, null, null];
      const move = computeAIMove(board, MARK_O, DIFFICULTY_HARD);
      assert.strictEqual(move, 2);
    });

    it('supports single-player synchronous engine execution', () => {
      const engine = new TicTacToeEngine(MODE_SINGLE, DIFFICULTY_HARD);
      engine.makeMove(0); // Human X plays 0
      const aiMove = engine.triggerAIMoveSynchronously(); // AI O plays
      assert.ok(aiMove >= 0);
      assert.strictEqual(engine.getState().board[aiMove], MARK_O);
    });
    it('never loses across simulated games against random moves', () => {
      // AI plays as O (playing second) against a random player X
      for (let gameIdx = 0; gameIdx < 30; gameIdx++) {
        const board: BoardCell[] = Array(9).fill(null);
        let turn: 'X' | 'O' = MARK_X;

        while (!checkWin(board) && !isBoardFull(board)) {
          if (turn === MARK_X) {
            const avail = getAvailableMoves(board);
            const randomMove = avail[Math.floor(Math.random() * avail.length)];
            board[randomMove] = MARK_X;
            turn = MARK_O;
          } else {
            const aiMove = getHardMove(board, MARK_O);
            board[aiMove] = MARK_O;
            turn = MARK_X;
          }
        }

        const finalWin = checkWin(board);
        // Hard AI playing O must NEVER lose to random moves
        assert.notStrictEqual(
          finalWin?.winner,
          MARK_X,
          `Hard AI lost in game ${gameIdx}! Board: ${JSON.stringify(board)}`,
        );
      }
    });

    it('Hard AI vs Hard AI always ends in a draw (optimal equilibrium)', () => {
      const board: BoardCell[] = Array(9).fill(null);
      let turn: 'X' | 'O' = MARK_X;

      while (!checkWin(board) && !isBoardFull(board)) {
        const aiMove = getHardMove(board, turn);
        board[aiMove] = turn;
        turn = turn === MARK_X ? MARK_O : MARK_X;
      }

      const result = checkWin(board);
      assert.strictEqual(result, null, 'Two optimal minimax players must always draw');
      assert.strictEqual(isBoardFull(board), true);
    });

    it('prioritizes immediate win over merely blocking opponent', () => {
      // Both X and O have two in a row. O must take the win instead of just blocking.
      // O has [0, 1] (win at 2), X has [3, 4] (win at 5)
      const board: BoardCell[] = [MARK_O, MARK_O, null, MARK_X, MARK_X, null, null, null, null];
      const move = getHardMove(board, MARK_O);
      assert.strictEqual(move, 2);
    });
  });

  describe('9. Multiplayer-Ready Turn & Player Enforcement', () => {
    it('rejects moves dispatched for the wrong player', () => {
      const engine = new TicTacToeEngine(MODE_LOCAL_2P);
      // Turn is X, attempting to dispatch move for O should be rejected
      const rejected = engine.makeMove(0, MARK_O);
      assert.strictEqual(rejected, false);
      assert.strictEqual(engine.getState().board[0], null);

      // Move for X should succeed
      const accepted = engine.makeMove(0, MARK_X);
      assert.strictEqual(accepted, true);
      assert.strictEqual(engine.getState().board[0], MARK_X);
    });
  });

  describe('10. Subscription and Listener Notification', () => {
    it('notifies subscribers on state mutation and allows unsubscribe', () => {
      const engine = new TicTacToeEngine();
      let callCount = 0;

      const unsubscribe = engine.subscribe(() => {
        callCount++;
      });

      engine.makeMove(0);
      assert.strictEqual(callCount, 1);

      unsubscribe();
      engine.makeMove(4);
      assert.strictEqual(callCount, 1);
    });
  });
});
