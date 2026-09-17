import assert from 'node:assert';
import { describe, it } from 'node:test';
import { fromAlgebraic } from './chess-board';
import { ChessEngine } from './chess-engine';
import { groupSanByTurn, parseUci, toUci } from './chess-notation';

function square(name: string): number {
  const index = fromAlgebraic(name);
  assert.ok(index !== null, `"${name}" is not a square`);
  return index;
}

/** Plays a move on an engine and returns the SAN it recorded. */
function san(engine: ChessEngine, from: string, to: string, promotion?: 'q' | 'r' | 'b' | 'n') {
  const record = engine.moveTo(square(from), square(to), promotion);
  assert.ok(record, `${from}${to} should be legal`);
  return record.san;
}

describe('Chess notation', () => {
  describe('standard algebraic notation', () => {
    it('writes a quiet pawn move as the destination alone', () => {
      const engine = new ChessEngine();
      assert.strictEqual(san(engine, 'e2', 'e4'), 'e4');
    });

    it('writes a piece move with its letter', () => {
      const engine = new ChessEngine();
      san(engine, 'e2', 'e4');
      san(engine, 'e7', 'e5');
      assert.strictEqual(san(engine, 'g1', 'f3'), 'Nf3');
    });

    it('writes a pawn capture with the departure file', () => {
      const engine = new ChessEngine({ fen: '4k3/8/8/3p4/4P3/8/8/4K3 w - - 0 1' });
      assert.strictEqual(san(engine, 'e4', 'd5'), 'exd5');
    });

    it('writes a piece capture with an x', () => {
      const engine = new ChessEngine({ fen: '4k3/8/8/3p4/8/8/8/3RK3 w - - 0 1' });
      assert.strictEqual(san(engine, 'd1', 'd5'), 'Rxd5');
    });

    it('writes both castles', () => {
      const short = new ChessEngine({ fen: 'r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1' });
      assert.strictEqual(san(short, 'e1', 'g1'), 'O-O');

      const long = new ChessEngine({ fen: 'r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1' });
      assert.strictEqual(san(long, 'e1', 'c1'), 'O-O-O');
    });

    it('writes promotion with the chosen piece', () => {
      const engine = new ChessEngine({ fen: '8/4P3/8/8/8/8/8/k3K3 w - - 0 1' });
      assert.strictEqual(san(engine, 'e7', 'e8', 'r'), 'e8=R');
    });

    it('writes a capture-promotion with file, capture and piece', () => {
      const engine = new ChessEngine({ fen: '3r4/4P3/8/8/8/8/8/k3K3 w - - 0 1' });
      assert.strictEqual(san(engine, 'e7', 'd8', 'q'), 'exd8=Q');
    });

    it('marks check with a plus', () => {
      const engine = new ChessEngine({ fen: '4k3/8/8/8/8/8/8/4KR2 w - - 0 1' });
      assert.strictEqual(san(engine, 'f1', 'f8'), 'Rf8+');
    });

    it('marks checkmate with a hash and never also a plus', () => {
      const engine = new ChessEngine({ fen: '6k1/5ppp/8/8/8/8/8/R6K w - - 0 1' });
      assert.strictEqual(san(engine, 'a1', 'a8'), 'Ra8#');
    });
  });

  describe('disambiguation', () => {
    it('adds the file when two pieces of a kind differ by file', () => {
      // Knights on b1 and f3 can both reach d2.
      const engine = new ChessEngine({ fen: '4k3/8/8/8/8/5N2/8/1N2K3 w - - 0 1' });
      assert.strictEqual(san(engine, 'b1', 'd2'), 'Nbd2');
    });

    it('adds the rank when the pieces share a file', () => {
      // Rooks on a1 and a5 can both reach a3.
      const engine = new ChessEngine({ fen: '4k3/8/8/R7/8/8/8/R3K3 w - - 0 1' });
      assert.strictEqual(san(engine, 'a1', 'a3'), 'R1a3');
    });

    it('adds file and rank when neither alone is enough', () => {
      // Queens on h1, h4 and e1 all reach e4. The h1 queen shares its file with
      // one rival and its rank with the other, so only both coordinates name it.
      const engine = new ChessEngine({ fen: '8/8/k7/8/7Q/K7/8/4Q2Q w - - 0 1' });
      assert.strictEqual(san(engine, 'h1', 'e4'), 'Qh1e4');
    });

    it('leaves an unambiguous move undecorated', () => {
      // The stray pawn keeps material sufficient; a lone knight and king is a
      // dead position the engine would have already drawn.
      const engine = new ChessEngine({ fen: '4k3/8/8/8/7p/5N2/8/4K3 w - - 0 1' });
      assert.strictEqual(san(engine, 'f3', 'd2'), 'Nd2');
    });

    it('never disambiguates a king, of which there is only one', () => {
      const engine = new ChessEngine({ fen: '4k3/8/8/8/7p/8/8/4K3 w - - 0 1' });
      assert.strictEqual(san(engine, 'e1', 'e2'), 'Ke2');
    });
  });

  describe('coordinate notation', () => {
    it('round-trips a plain move', () => {
      const engine = new ChessEngine();
      const record = engine.moveTo(square('e2'), square('e4'));
      assert.ok(record);
      assert.strictEqual(record.uci, 'e2e4');
      assert.deepStrictEqual(parseUci('e2e4'), { from: square('e2'), to: square('e4') });
    });

    it('round-trips a promotion', () => {
      const engine = new ChessEngine({ fen: '6k1/4P3/8/8/8/8/8/4K3 w - - 0 1' });
      const record = engine.moveTo(square('e7'), square('e8'), 'n');
      assert.ok(record);
      assert.strictEqual(record.uci, 'e7e8n');
      assert.strictEqual(toUci(record.move), 'e7e8n');
      assert.deepStrictEqual(parseUci('e7e8n'), {
        from: square('e7'),
        to: square('e8'),
        promotion: 'n',
      });
    });

    it('rejects malformed coordinates', () => {
      assert.strictEqual(parseUci(''), null);
      assert.strictEqual(parseUci('e2e'), null);
      assert.strictEqual(parseUci('z2e4'), null);
      assert.strictEqual(parseUci('e2e9'), null);
      assert.strictEqual(parseUci('e7e8k'), null, 'a pawn may not promote to a king');
    });
  });

  describe('move list grouping', () => {
    it('pairs plies into numbered moves', () => {
      const turns = groupSanByTurn([
        { san: 'e4', ply: 1, color: 'w' },
        { san: 'e5', ply: 2, color: 'b' },
        { san: 'Nf3', ply: 3, color: 'w' },
      ]);

      assert.deepStrictEqual(turns, [
        { moveNumber: 1, white: 'e4', black: 'e5', whitePly: 1, blackPly: 2 },
        { moveNumber: 2, white: 'Nf3', black: null, whitePly: 3, blackPly: null },
      ]);
    });

    it('starts a turn with Black when the game does', () => {
      const turns = groupSanByTurn([{ san: 'e5', ply: 1, color: 'b' }]);
      assert.deepStrictEqual(turns, [
        { moveNumber: 1, white: null, black: 'e5', whitePly: null, blackPly: 1 },
      ]);
    });
  });
});
