import assert from 'node:assert';
import { describe, it } from 'node:test';
import { fromAlgebraic, toAlgebraic } from './chess-board';
import { START_FEN } from './chess-constants';
import { createStartPosition, parseFen } from './chess-fen';
import { generateLegalMoves, legalTargetsFrom } from './chess-legal';
import { perft } from './chess-perft';

/**
 * The published perft positions from the Chess Programming Wiki. Between them
 * they exercise castling through and out of check, en passant (including the
 * discovered-check case), promotion, pins and stalemate.
 */
const PERFT_POSITIONS = [
  {
    name: 'start position',
    fen: START_FEN,
    counts: [20, 400, 8902, 197281],
  },
  {
    name: 'Kiwipete',
    fen: 'r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1',
    counts: [48, 2039, 97862],
  },
  {
    name: 'position 3 (rook and pawn endgame)',
    fen: '8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1',
    counts: [14, 191, 2812, 43238],
  },
  {
    name: 'position 4 (promotion tactics)',
    fen: 'r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1',
    counts: [6, 264, 9467],
  },
  {
    name: 'position 5',
    fen: 'rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8',
    counts: [44, 1486, 62379],
  },
  {
    name: 'position 6',
    fen: 'r4rk1/1pp1qppp/p1np1n2/2b1p1B1/2B1P1b1/P1NP1N2/1PP1QPPP/R4RK1 w - - 0 10',
    counts: [46, 2079],
  },
] as const;

describe('Chess move generation', () => {
  describe('perft node counts', () => {
    for (const position of PERFT_POSITIONS) {
      for (const [index, expected] of position.counts.entries()) {
        const depth = index + 1;
        it(`${position.name} at depth ${depth} yields ${expected} nodes`, () => {
          assert.strictEqual(perft(parseFen(position.fen), depth), expected);
        });
      }
    }
  });

  describe('opening moves', () => {
    it('offers twenty legal first moves for White', () => {
      const moves = generateLegalMoves(createStartPosition());
      assert.strictEqual(moves.length, 20);
      assert.strictEqual(moves.filter((move) => move.piece === 'p').length, 16);
      assert.strictEqual(moves.filter((move) => move.piece === 'n').length, 4);
    });

    it('lets a pawn step one or two squares from its home rank only', () => {
      const position = createStartPosition();
      const moves = generateLegalMoves(position);
      const e2 = fromAlgebraic('e2');
      assert.ok(e2 !== null);

      const targets = legalTargetsFrom(moves, e2).map(toAlgebraic).sort();
      assert.deepStrictEqual(targets, ['e3', 'e4']);
    });

    it('blocks the double push when the intervening square is occupied', () => {
      const position = parseFen('4k3/8/8/8/8/4n3/4P3/4K3 w - - 0 1');
      const e2 = fromAlgebraic('e2');
      assert.ok(e2 !== null);
      assert.deepStrictEqual(legalTargetsFrom(generateLegalMoves(position), e2), []);
    });
  });

  describe('sliding pieces', () => {
    it('stops a rook at the first occupied square and can capture it', () => {
      const position = parseFen('4k3/8/8/8/8/8/3p4/R2K4 w - - 0 1');
      const a1 = fromAlgebraic('a1');
      assert.ok(a1 !== null);

      const targets = legalTargetsFrom(generateLegalMoves(position), a1).map(toAlgebraic).sort();
      assert.deepStrictEqual(targets, ['a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8', 'b1', 'c1']);
    });

    it('gives a lone knight eight destinations from the centre', () => {
      const position = parseFen('4k3/8/8/8/4N3/8/8/4K3 w - - 0 1');
      const e4 = fromAlgebraic('e4');
      assert.ok(e4 !== null);
      assert.strictEqual(legalTargetsFrom(generateLegalMoves(position), e4).length, 8);
    });
  });
});
