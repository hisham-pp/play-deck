import assert from 'node:assert';
import { describe, it } from 'node:test';
import { fromAlgebraic, squareShade, toAlgebraic } from './chess-board';
import { START_FEN } from './chess-constants';
import { createStartPosition, parseFen, repetitionKey, toFen } from './chess-fen';

describe('FEN and board coordinates', () => {
  describe('square naming', () => {
    it('places a8 first and h1 last', () => {
      assert.strictEqual(toAlgebraic(0), 'a8');
      assert.strictEqual(toAlgebraic(63), 'h1');
      assert.strictEqual(fromAlgebraic('a8'), 0);
      assert.strictEqual(fromAlgebraic('h1'), 63);
    });

    it('round-trips every square', () => {
      for (let index = 0; index < 64; index += 1) {
        assert.strictEqual(fromAlgebraic(toAlgebraic(index)), index);
      }
    });

    it('rejects names that are not squares', () => {
      assert.strictEqual(fromAlgebraic('j1'), null);
      assert.strictEqual(fromAlgebraic('a9'), null);
      assert.strictEqual(fromAlgebraic('a'), null);
      assert.strictEqual(fromAlgebraic('a10'), null);
    });

    it('shades the board from a light a8 corner', () => {
      assert.strictEqual(squareShade(fromAlgebraic('a8') as number), 'light');
      assert.strictEqual(squareShade(fromAlgebraic('b8') as number), 'dark');
      assert.strictEqual(squareShade(fromAlgebraic('a1') as number), 'dark');
      assert.strictEqual(squareShade(fromAlgebraic('h1') as number), 'light');
    });
  });

  describe('parsing', () => {
    it('reads the opening array', () => {
      const position = createStartPosition();

      assert.strictEqual(position.turn, 'w');
      assert.strictEqual(position.halfmoveClock, 0);
      assert.strictEqual(position.fullmoveNumber, 1);
      assert.strictEqual(position.enPassant, null);
      assert.deepStrictEqual(position.castling, { wk: true, wq: true, bk: true, bq: true });

      assert.deepStrictEqual(position.board[0], { color: 'b', type: 'r' });
      assert.deepStrictEqual(position.board[60], { color: 'w', type: 'k' });
      assert.strictEqual(position.board.filter(Boolean).length, 32);
    });

    it('reads partial castling rights and an en passant square', () => {
      const position = parseFen('4k3/8/8/3pP3/8/8/8/4K3 w Kq d6 3 17');

      assert.deepStrictEqual(position.castling, { wk: true, wq: false, bk: false, bq: true });
      assert.strictEqual(position.enPassant, fromAlgebraic('d6'));
      assert.strictEqual(position.halfmoveClock, 3);
      assert.strictEqual(position.fullmoveNumber, 17);
    });

    it('accepts a four-field FEN and defaults the clocks', () => {
      const position = parseFen('4k3/8/8/8/8/8/8/4K3 b - -');
      assert.strictEqual(position.halfmoveClock, 0);
      assert.strictEqual(position.fullmoveNumber, 1);
      assert.strictEqual(position.turn, 'b');
    });

    it('rejects malformed input rather than guessing', () => {
      assert.throws(() => parseFen('8/8/8/8'), /Invalid FEN/);
      assert.throws(() => parseFen('8/8/8/8/8/8/8/8 w -'), /four fields/i);
      assert.throws(() => parseFen('8/8/8/8/8/8/8/8 x - - 0 1'), /side to move/);
      assert.throws(() => parseFen('9/8/8/8/8/8/8/8 w - - 0 1'), /Invalid FEN/);
      assert.throws(() => parseFen('xxxxxxxx/8/8/8/8/8/8/8 w - - 0 1'), /Invalid FEN/);
    });
  });

  describe('serializing', () => {
    it('round-trips the opening position byte for byte', () => {
      assert.strictEqual(toFen(createStartPosition()), START_FEN);
    });

    it('round-trips positions with every field in play', () => {
      for (const fen of [
        '4k3/8/8/3pP3/8/8/8/4K3 w Kq d6 3 17',
        'r3k2r/8/8/8/8/8/8/R3K2R b KQkq - 0 1',
        '8/8/8/8/8/8/8/K6k w - - 99 120',
      ]) {
        assert.strictEqual(toFen(parseFen(fen)), fen);
      }
    });
  });

  describe('repetition keys', () => {
    it('ignores the clocks, which a repeated position need not match', () => {
      const early = parseFen('4k3/8/8/8/8/8/8/4K3 w - - 0 1');
      const late = parseFen('4k3/8/8/8/8/8/8/4K3 w - - 40 60');
      assert.strictEqual(repetitionKey(early), repetitionKey(late));
    });

    it('separates positions differing only in side to move', () => {
      const white = parseFen('4k3/8/8/8/8/8/8/4K3 w - - 0 1');
      const black = parseFen('4k3/8/8/8/8/8/8/4K3 b - - 0 1');
      assert.notStrictEqual(repetitionKey(white), repetitionKey(black));
    });

    it('separates positions differing only in castling rights', () => {
      const withRights = parseFen('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1');
      const without = parseFen('r3k2r/8/8/8/8/8/8/R3K2R w - - 0 1');
      assert.notStrictEqual(repetitionKey(withRights), repetitionKey(without));
    });
  });
});
