import assert from 'node:assert';
import { describe, it } from 'node:test';
import type { ChessGameState } from '../types/chess.types';
import { fromAlgebraic } from './chess-board';
import { START_FEN } from './chess-constants';
import { ChessEngine } from './chess-engine';

function square(name: string): number {
  const index = fromAlgebraic(name);
  assert.ok(index !== null, `"${name}" is not a square`);
  return index;
}

function move(engine: ChessEngine, from: string, to: string, promotion?: 'q' | 'r' | 'b' | 'n') {
  return engine.moveTo(square(from), square(to), promotion);
}

/** Plays a list of moves written as "e2e4", asserting each is legal. */
function playLine(engine: ChessEngine, line: string[]): void {
  for (const uci of line) {
    const record = move(engine, uci.slice(0, 2), uci.slice(2, 4));
    assert.ok(record, `${uci} should be legal`);
  }
}

describe('Chess engine', () => {
  describe('initial state', () => {
    it('starts from the standard array with White to move', () => {
      const state = new ChessEngine().getState();

      assert.strictEqual(state.position.turn, 'w');
      assert.strictEqual(state.status, 'playing');
      assert.strictEqual(state.result, null);
      assert.strictEqual(state.check, false);
      assert.strictEqual(state.history.length, 0);
      assert.strictEqual(state.legalMoves.length, 20);
      assert.strictEqual(new ChessEngine().getFen(), START_FEN);
    });

    it('accepts a starting position and a match id', () => {
      const fen = '4k3/8/8/8/8/8/4P3/4K3 w - - 0 1';
      const engine = new ChessEngine({ fen, matchId: 'match-1' });

      assert.strictEqual(engine.getFen(), fen);
      assert.strictEqual(engine.getState().matchId, 'match-1');
    });
  });

  describe('turn management', () => {
    it('alternates the side to move', () => {
      const engine = new ChessEngine();
      assert.strictEqual(engine.getState().position.turn, 'w');

      move(engine, 'e2', 'e4');
      assert.strictEqual(engine.getState().position.turn, 'b');

      move(engine, 'e7', 'e5');
      assert.strictEqual(engine.getState().position.turn, 'w');
    });

    it('refuses to move a piece belonging to the other side', () => {
      const engine = new ChessEngine();
      assert.strictEqual(move(engine, 'e7', 'e5'), null);
      assert.strictEqual(engine.getState().history.length, 0);
    });

    it('refuses an illegal move without disturbing the game', () => {
      const engine = new ChessEngine();
      const before = engine.getState();

      assert.strictEqual(move(engine, 'e2', 'e5'), null);
      assert.strictEqual(engine.getState(), before, 'state identity is unchanged');
    });
  });

  describe('move history', () => {
    it('records notation, coordinates and both positions per ply', () => {
      const engine = new ChessEngine();
      const record = move(engine, 'e2', 'e4');

      assert.ok(record);
      assert.strictEqual(record.ply, 1);
      assert.strictEqual(record.san, 'e4');
      assert.strictEqual(record.uci, 'e2e4');
      assert.strictEqual(record.fenBefore, START_FEN);
      assert.strictEqual(record.fenAfter, engine.getFen());
      assert.strictEqual(record.move.color, 'w');
      assert.strictEqual(record.check, false);
    });

    it('numbers plies consecutively', () => {
      const engine = new ChessEngine();
      playLine(engine, ['e2e4', 'e7e5', 'g1f3']);

      assert.deepStrictEqual(
        engine.getState().history.map((entry) => entry.ply),
        [1, 2, 3],
      );
      assert.deepStrictEqual(
        engine.getState().history.map((entry) => entry.san),
        ['e4', 'e5', 'Nf3'],
      );
    });

    it('flags the move that gives check', () => {
      const engine = new ChessEngine({ fen: '4k3/8/8/8/8/8/8/4KR2 w - - 0 1' });
      const record = move(engine, 'f1', 'f8');

      assert.ok(record);
      assert.strictEqual(record.check, true);
      assert.strictEqual(engine.getState().check, true);
    });
  });

  describe('undo', () => {
    it('restores the previous position exactly', () => {
      const engine = new ChessEngine();
      const opening = engine.getFen();

      move(engine, 'e2', 'e4');
      assert.strictEqual(engine.undo(), true);

      assert.strictEqual(engine.getFen(), opening);
      assert.strictEqual(engine.getState().history.length, 0);
      assert.strictEqual(engine.getState().position.turn, 'w');
    });

    it('restores castling rights that the undone move gave up', () => {
      const engine = new ChessEngine({ fen: 'r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1' });
      move(engine, 'e1', 'g1');
      assert.strictEqual(engine.getState().position.castling.wk, false);

      engine.undo();
      assert.strictEqual(engine.getState().position.castling.wk, true);
      assert.strictEqual(engine.getState().position.board[square('e1')]?.type, 'k');
      assert.strictEqual(engine.getState().position.board[square('h1')]?.type, 'r');
    });

    it('restores a captured piece and the en passant square', () => {
      const engine = new ChessEngine({ fen: '4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 1' });
      move(engine, 'e5', 'd6');
      assert.strictEqual(engine.getState().position.board[square('d5')], null);

      engine.undo();
      const restored = engine.getState().position;
      assert.strictEqual(restored.board[square('d5')]?.type, 'p');
      assert.strictEqual(restored.board[square('d5')]?.color, 'b');
      assert.strictEqual(restored.enPassant, square('d6'));
    });

    it('reopens a game that had ended in checkmate', () => {
      const engine = new ChessEngine({ fen: '6k1/5ppp/8/8/8/8/8/R6K w - - 0 1' });
      move(engine, 'a1', 'a8');
      assert.strictEqual(engine.getState().status, 'checkmate');

      engine.undo();
      assert.strictEqual(engine.getState().status, 'playing');
      assert.strictEqual(engine.getState().result, null);
      assert.strictEqual(engine.isGameOver(), false);
    });

    it('reports nothing to undo on a fresh game', () => {
      const engine = new ChessEngine();
      assert.strictEqual(engine.undo(), false);
    });

    it('unwinds a whole game one ply at a time', () => {
      const engine = new ChessEngine();
      const line = ['e2e4', 'e7e5', 'g1f3', 'b8c6', 'f1c4'];
      playLine(engine, line);

      for (let i = 0; i < line.length; i += 1) engine.undo();

      assert.strictEqual(engine.getFen(), START_FEN);
      assert.strictEqual(engine.getState().history.length, 0);
    });
  });

  describe('outcomes', () => {
    it('ends the game on checkmate with the mating side as winner', () => {
      const engine = new ChessEngine({ fen: '6k1/5ppp/8/8/8/8/8/R6K w - - 0 1' });
      move(engine, 'a1', 'a8');

      const state = engine.getState();
      assert.strictEqual(state.status, 'checkmate');
      assert.deepStrictEqual(state.result, { winner: 'w', reason: 'checkmate' });
      assert.strictEqual(state.legalMoves.length, 0);
      assert.strictEqual(engine.isGameOver(), true);
    });

    it('ends the game on stalemate as a draw', () => {
      // Qf7 takes every flight square from the king on h8 without checking it.
      const engine = new ChessEngine({ fen: '7k/8/8/8/8/8/8/5QK1 w - - 0 1' });
      move(engine, 'f1', 'f7');

      const state = engine.getState();
      assert.strictEqual(state.status, 'stalemate');
      assert.deepStrictEqual(state.result, { winner: null, reason: 'stalemate' });
    });

    it('refuses further moves once the game is over', () => {
      const engine = new ChessEngine({ fen: '6k1/5ppp/8/8/8/8/8/R6K w - - 0 1' });
      move(engine, 'a1', 'a8');

      assert.strictEqual(move(engine, 'h1', 'g1'), null);
      assert.strictEqual(engine.getState().history.length, 1);
    });

    it('awards the win to the opponent on resignation', () => {
      const engine = new ChessEngine();
      engine.resign('w');

      assert.strictEqual(engine.getState().status, 'resigned');
      assert.deepStrictEqual(engine.getState().result, { winner: 'b', reason: 'resignation' });
    });

    it('draws by agreement only after an offer', () => {
      const engine = new ChessEngine();

      engine.acceptDraw();
      assert.strictEqual(engine.getState().status, 'playing');

      engine.offerDraw('w');
      assert.strictEqual(engine.getState().drawOfferFrom, 'w');

      engine.acceptDraw();
      assert.deepStrictEqual(engine.getState().result, { winner: null, reason: 'agreement' });
    });

    it('clears a draw offer when it is declined', () => {
      const engine = new ChessEngine();
      engine.offerDraw('b');
      engine.declineDraw();

      assert.strictEqual(engine.getState().drawOfferFrom, null);
      assert.strictEqual(engine.getState().status, 'playing');
    });

    it('clears a standing draw offer once a move is played', () => {
      const engine = new ChessEngine();
      engine.offerDraw('w');
      move(engine, 'e2', 'e4');

      assert.strictEqual(engine.getState().drawOfferFrom, null);
    });
  });

  describe('subscriptions', () => {
    it('notifies subscribers with the new state after each change', () => {
      const engine = new ChessEngine();
      const seen: ChessGameState[] = [];
      const unsubscribe = engine.subscribe((state) => seen.push(state));

      move(engine, 'e2', 'e4');
      move(engine, 'e7', 'e5');

      assert.strictEqual(seen.length, 2);
      assert.strictEqual(seen[1], engine.getState());

      unsubscribe();
      move(engine, 'g1', 'f3');
      assert.strictEqual(seen.length, 2, 'no notifications after unsubscribing');
    });

    it('stays silent when an action changes nothing', () => {
      const engine = new ChessEngine();
      let calls = 0;
      engine.subscribe(() => {
        calls += 1;
      });

      move(engine, 'e2', 'e5');
      engine.undo();

      assert.strictEqual(calls, 0);
    });
  });

  describe('move queries for the interface', () => {
    it('lists the destinations of one piece', () => {
      const engine = new ChessEngine();
      assert.deepStrictEqual(
        engine.getLegalTargets(square('g1')).sort(),
        [square('f3'), square('h3')].sort(),
      );
    });

    it('reports when a move needs a promotion choice', () => {
      const engine = new ChessEngine({ fen: '8/4P3/8/8/8/8/8/k3K3 w - - 0 1' });
      assert.strictEqual(engine.needsPromotion(square('e7'), square('e8')), true);
      assert.strictEqual(engine.needsPromotion(square('e1'), square('d1')), false);
    });

    it('defaults an unspecified promotion to a queen', () => {
      const engine = new ChessEngine({ fen: '8/4P3/8/8/8/8/8/k3K3 w - - 0 1' });
      const record = move(engine, 'e7', 'e8');

      assert.ok(record);
      assert.strictEqual(record.move.promotion, 'q');
    });
  });

  describe('new game', () => {
    it('returns to the opening position and clears history', () => {
      const engine = new ChessEngine();
      playLine(engine, ['e2e4', 'e7e5']);
      engine.newGame();

      assert.strictEqual(engine.getFen(), START_FEN);
      assert.strictEqual(engine.getState().history.length, 0);
      assert.strictEqual(engine.getState().status, 'playing');
    });

    it('loads an arbitrary position', () => {
      const engine = new ChessEngine();
      const fen = '4k3/8/8/8/8/8/4P3/4K3 b - - 3 12';
      engine.loadFen(fen);

      assert.strictEqual(engine.getFen(), fen);
      assert.strictEqual(engine.getState().position.turn, 'b');
    });
  });
});
