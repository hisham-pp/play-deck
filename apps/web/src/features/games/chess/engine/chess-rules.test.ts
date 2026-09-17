import assert from 'node:assert';
import { describe, it } from 'node:test';
import type { ChessPosition } from '../types/chess.types';
import { fromAlgebraic, toAlgebraic } from './chess-board';
import { parseFen, toFen } from './chess-fen';
import {
  findMove,
  generateLegalMoves,
  isInCheck,
  legalTargetsFrom,
  requiresPromotion,
} from './chess-legal';
import { applyMove } from './chess-make-move';

/** Resolves a square name, failing the test loudly if the name is wrong. */
function square(name: string): number {
  const index = fromAlgebraic(name);
  assert.ok(index !== null, `"${name}" is not a square`);
  return index;
}

/** Plays a move by square names, asserting it is legal. */
function play(
  position: ChessPosition,
  from: string,
  to: string,
  promotion?: 'q' | 'r' | 'b' | 'n',
) {
  const move = findMove(generateLegalMoves(position), {
    from: square(from),
    to: square(to),
    promotion,
  });
  assert.ok(move, `${from}${to} should be legal`);
  return applyMove(position, move);
}

function targets(position: ChessPosition, from: string): string[] {
  return legalTargetsFrom(generateLegalMoves(position), square(from)).map(toAlgebraic).sort();
}

describe('Chess rules', () => {
  describe('castling', () => {
    const bothSides = 'r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1';

    it('offers both castles when the path is clear', () => {
      assert.deepStrictEqual(targets(parseFen(bothSides), 'e1').sort(), [
        'c1',
        'd1',
        'd2',
        'e2',
        'f1',
        'f2',
        'g1',
      ]);
    });

    it('moves the rook to the far side of the king when castling short', () => {
      const next = play(parseFen(bothSides), 'e1', 'g1');
      assert.strictEqual(next.board[square('g1')]?.type, 'k');
      assert.strictEqual(next.board[square('f1')]?.type, 'r');
      assert.strictEqual(next.board[square('h1')], null);
      assert.strictEqual(next.board[square('e1')], null);
    });

    it('places the rook on d1 when castling long', () => {
      const next = play(parseFen(bothSides), 'e1', 'c1');
      assert.strictEqual(next.board[square('c1')]?.type, 'k');
      assert.strictEqual(next.board[square('d1')]?.type, 'r');
      assert.strictEqual(next.board[square('a1')], null);
    });

    it('forbids castling out of check', () => {
      const position = parseFen('r3k2r/8/8/8/8/8/4r3/R3K2R w KQkq - 0 1');
      const options = targets(position, 'e1');
      assert.ok(!options.includes('g1'));
      assert.ok(!options.includes('c1'));
    });

    it('forbids castling through an attacked square', () => {
      const position = parseFen('r3k2r/8/8/8/8/8/5r2/R3K2R w KQkq - 0 1');
      assert.ok(!targets(position, 'e1').includes('g1'));
    });

    it('forbids castling into check', () => {
      const position = parseFen('r3k2r/8/8/8/8/8/6r1/R3K2R w KQkq - 0 1');
      assert.ok(!targets(position, 'e1').includes('g1'));
    });

    it('allows queenside castling while the b-file square is attacked', () => {
      // The king never visits b1, so an attack there is irrelevant.
      const position = parseFen('r3k2r/8/8/8/8/8/1r6/R3K2R w KQkq - 0 1');
      assert.ok(targets(position, 'e1').includes('c1'));
    });

    it('forbids castling when a piece stands between king and rook', () => {
      const position = parseFen('r3k2r/8/8/8/8/8/8/R3KB1R w KQkq - 0 1');
      assert.ok(!targets(position, 'e1').includes('g1'));
    });

    it('drops both rights once the king moves', () => {
      const next = play(parseFen(bothSides), 'e1', 'e2');
      assert.strictEqual(next.castling.wk, false);
      assert.strictEqual(next.castling.wq, false);
      assert.strictEqual(next.castling.bk, true);
    });

    it('drops one right when the matching rook moves', () => {
      const next = play(parseFen(bothSides), 'h1', 'g1');
      assert.strictEqual(next.castling.wk, false);
      assert.strictEqual(next.castling.wq, true);
    });

    it('drops the opponent right when a rook is captured on its home square', () => {
      const position = parseFen('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1');
      const next = play(position, 'a1', 'a8');
      assert.strictEqual(next.castling.bq, false);
      assert.strictEqual(next.castling.bk, true);
    });
  });

  describe('en passant', () => {
    it('publishes the target square after a double pawn push', () => {
      const next = play(parseFen('4k3/8/8/8/8/8/4P3/4K3 w - - 0 1'), 'e2', 'e4');
      assert.strictEqual(next.enPassant, square('e3'));
      assert.ok(toFen(next).includes(' e3 '));
    });

    it('clears the target square on the following move', () => {
      let position = play(parseFen('4k3/7p/8/8/8/8/4P3/4K3 w - - 0 1'), 'e2', 'e4');
      position = play(position, 'h7', 'h6');
      assert.strictEqual(position.enPassant, null);
    });

    it('captures the passing pawn, which does not stand on the landing square', () => {
      const position = parseFen('4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 1');
      const next = play(position, 'e5', 'd6');

      assert.strictEqual(next.board[square('d6')]?.type, 'p');
      assert.strictEqual(next.board[square('d6')]?.color, 'w');
      assert.strictEqual(next.board[square('d5')], null, 'the captured pawn is removed');
      assert.strictEqual(next.board[square('e5')], null);
    });

    it('expires if the capture is not made at once', () => {
      const position = parseFen('4k3/8/8/3pP3/8/8/7P/4K3 w - d6 0 1');
      assert.ok(targets(position, 'e5').includes('d6'));

      let later = play(position, 'h2', 'h3');
      later = play(later, 'e8', 'd8');
      assert.deepStrictEqual(targets(later, 'e5'), ['e6']);
    });

    it('forbids the capture when it would expose its own king', () => {
      // Removing both pawns from the fifth rank opens the black rook onto e5,
      // so this en passant capture is illegal despite being pseudo-legal.
      const position = parseFen('8/8/8/K2pP2r/8/8/8/4k3 w - d6 0 1');
      assert.ok(!targets(position, 'e5').includes('d6'));
    });
  });

  describe('promotion', () => {
    const pushing = '6k1/4P3/8/8/8/8/8/4K3 w - - 0 1';

    it('offers all four promotion pieces and no others', () => {
      const moves = generateLegalMoves(parseFen(pushing)).filter(
        (move) => move.from === square('e7') && move.to === square('e8'),
      );
      assert.deepStrictEqual(moves.map((move) => move.promotion).sort(), ['b', 'n', 'q', 'r']);
    });

    it('reports that the move needs a promotion choice', () => {
      const moves = generateLegalMoves(parseFen(pushing));
      assert.strictEqual(requiresPromotion(moves, square('e7'), square('e8')), true);
      assert.strictEqual(requiresPromotion(moves, square('e1'), square('d1')), false);
    });

    it('places the chosen piece, not a queen by default', () => {
      const next = play(parseFen(pushing), 'e7', 'e8', 'n');
      assert.strictEqual(next.board[square('e8')]?.type, 'n');
      assert.strictEqual(next.board[square('e8')]?.color, 'w');
    });

    it('promotes on a capture as well as a push', () => {
      const next = play(parseFen('3rk3/4P3/8/8/8/8/8/4K3 w - - 0 1'), 'e7', 'd8', 'q');
      assert.strictEqual(next.board[square('d8')]?.type, 'q');
      assert.strictEqual(next.board[square('d8')]?.color, 'w');
    });

    it('promotes Black pawns on the first rank', () => {
      const next = play(parseFen('4k3/8/8/8/8/8/4p3/6K1 b - - 0 1'), 'e2', 'e1', 'r');
      assert.strictEqual(next.board[square('e1')]?.type, 'r');
      assert.strictEqual(next.board[square('e1')]?.color, 'b');
    });
  });

  describe('check and pins', () => {
    it('allows only moves that answer the check', () => {
      // Black is in check from the rook on e1; the king must move or the check
      // must be blocked on e7.
      const position = parseFen('4k3/8/8/8/8/8/6B1/4R1K1 b - - 0 1');
      assert.strictEqual(isInCheck(position), true);

      const moves = generateLegalMoves(position);
      assert.ok(moves.length > 0);
      assert.ok(moves.every((move) => move.piece === 'k'));
    });

    it('pins a piece absolutely against its own king', () => {
      const position = parseFen('4r3/8/8/8/8/7k/4N3/4K3 w - - 0 1');
      assert.deepStrictEqual(targets(position, 'e2'), []);
    });

    it('lets a pinned piece capture the pinning piece', () => {
      const position = parseFen('4k3/8/8/8/8/6b1/5B2/4K3 w - - 0 1');
      assert.deepStrictEqual(targets(position, 'f2'), ['g3']);
    });

    it('forbids the king stepping along the line of a checking rook', () => {
      const position = parseFen('8/8/8/8/8/8/8/R3k3 b - - 0 1');
      const options = targets(position, 'e1');
      assert.ok(!options.includes('d1'));
      assert.ok(!options.includes('f1'));
    });

    it('forbids two kings touching', () => {
      const position = parseFen('8/8/8/3k4/8/3K4/8/8 w - - 0 1');
      const options = targets(position, 'd3');
      assert.ok(!options.includes('d4'));
      assert.ok(!options.includes('c4'));
      assert.ok(options.includes('d2'));
    });
  });

  describe('mate and stalemate', () => {
    it('recognises the two-move fool’s mate as checkmate', () => {
      let position = parseFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
      position = play(position, 'f2', 'f3');
      position = play(position, 'e7', 'e5');
      position = play(position, 'g2', 'g4');
      position = play(position, 'd8', 'h4');

      assert.strictEqual(isInCheck(position), true);
      assert.strictEqual(generateLegalMoves(position).length, 0);
    });

    it('recognises a back-rank mate', () => {
      const position = parseFen('6k1/5ppp/8/8/8/8/8/R5K1 b - - 0 1');
      const mated = play(position, 'g8', 'h8');
      const delivered = play(mated, 'a1', 'a8');

      assert.strictEqual(isInCheck(delivered), true);
      assert.strictEqual(generateLegalMoves(delivered).length, 0);
    });

    it('recognises stalemate as no legal moves without check', () => {
      const position = parseFen('7k/5Q2/6K1/8/8/8/8/8 b - - 0 1');
      assert.strictEqual(isInCheck(position), false);
      assert.strictEqual(generateLegalMoves(position).length, 0);
    });
  });

  describe('clocks', () => {
    it('resets the halfmove clock on a pawn move and on a capture', () => {
      const quiet = play(parseFen('4k3/8/8/8/8/5n2/8/4K1N1 w - - 7 20'), 'g1', 'f3');
      assert.strictEqual(quiet.halfmoveClock, 0, 'capture resets the clock');

      const knight = play(parseFen('4k3/8/8/8/8/8/8/4K1N1 w - - 7 20'), 'g1', 'f3');
      assert.strictEqual(knight.halfmoveClock, 8, 'a quiet move increments it');
    });

    it('increments the full move number only after Black moves', () => {
      const afterWhite = play(parseFen('4k3/8/8/8/8/8/8/4K1N1 w - - 0 20'), 'g1', 'f3');
      assert.strictEqual(afterWhite.fullmoveNumber, 20);

      const afterBlack = play(afterWhite, 'e8', 'd8');
      assert.strictEqual(afterBlack.fullmoveNumber, 21);
    });
  });
});
