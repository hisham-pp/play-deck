import assert from 'node:assert';
import { describe, it } from 'node:test';
import { fromAlgebraic } from './chess-board';
import { PIECE_VALUES } from './chess-constants';
import { ChessEngine } from './chess-engine';
import { parseFen } from './chess-fen';
import {
  collectCaptures,
  hasInsufficientMaterial,
  isFiftyMoveDraw,
  materialAdvantage,
} from './chess-status';

function square(name: string): number {
  const index = fromAlgebraic(name);
  assert.ok(index !== null, `"${name}" is not a square`);
  return index;
}

function boardOf(fen: string) {
  return parseFen(fen).board;
}

function playLine(engine: ChessEngine, line: string[]): void {
  for (const uci of line) {
    const record = engine.moveTo(square(uci.slice(0, 2)), square(uci.slice(2, 4)));
    assert.ok(record, `${uci} should be legal`);
  }
}

describe('Chess draws and material', () => {
  describe('insufficient material', () => {
    it('is a dead position with two bare kings', () => {
      assert.strictEqual(hasInsufficientMaterial(boardOf('4k3/8/8/8/8/8/8/4K3 w - - 0 1')), true);
    });

    it('is a dead position with a single minor piece', () => {
      assert.strictEqual(hasInsufficientMaterial(boardOf('4k3/8/8/8/8/8/8/4KB2 w - - 0 1')), true);
      assert.strictEqual(hasInsufficientMaterial(boardOf('4k3/8/8/8/8/8/8/4KN2 w - - 0 1')), true);
    });

    it('is a dead position with bishops on one shade of square', () => {
      // f8 and c1 are both dark, so neither bishop can ever reach the other.
      assert.strictEqual(
        hasInsufficientMaterial(boardOf('4kb2/8/8/8/8/8/8/2B1K3 w - - 0 1')),
        true,
      );
    });

    it('is not dead with bishops on opposite shades', () => {
      assert.strictEqual(
        hasInsufficientMaterial(boardOf('3bk3/8/8/8/8/8/8/4KB2 w - - 0 1')),
        false,
      );
    });

    it('is not dead with two knights, where mate is possible if unforced', () => {
      assert.strictEqual(
        hasInsufficientMaterial(boardOf('4k3/8/8/8/8/8/8/3NKN2 w - - 0 1')),
        false,
      );
    });

    it('is not dead while a pawn, rook or queen survives', () => {
      assert.strictEqual(
        hasInsufficientMaterial(boardOf('4k3/8/8/8/8/8/4P3/4K3 w - - 0 1')),
        false,
      );
      assert.strictEqual(hasInsufficientMaterial(boardOf('4k3/8/8/8/8/8/8/4KR2 w - - 0 1')), false);
    });

    it('declares the draw as soon as the last mating piece is captured', () => {
      const engine = new ChessEngine({ fen: '4k3/8/8/8/8/8/4r3/4KB2 w - - 0 1' });
      engine.moveTo(square('f1'), square('e2'));

      const state = engine.getState();
      assert.strictEqual(state.status, 'draw');
      assert.deepStrictEqual(state.result, { winner: null, reason: 'insufficient-material' });
    });
  });

  describe('fifty move rule', () => {
    it('reads the halfmove clock straight off the position', () => {
      assert.strictEqual(isFiftyMoveDraw(parseFen('4k3/8/8/8/8/8/4P3/4K3 w - - 99 60')), false);
      assert.strictEqual(isFiftyMoveDraw(parseFen('4k3/8/8/8/8/8/4P3/4K3 w - - 100 60')), true);
    });

    it('draws the game on the hundredth quiet ply', () => {
      const engine = new ChessEngine({ fen: '4k3/8/8/8/8/8/4P3/R3K3 w - - 99 60' });
      assert.strictEqual(engine.getState().status, 'playing');

      engine.moveTo(square('a1'), square('a2'));
      assert.deepStrictEqual(engine.getState().result, { winner: null, reason: 'fifty-move' });
    });

    it('is held off by a pawn move, which resets the clock', () => {
      const engine = new ChessEngine({ fen: '4k3/8/8/8/8/8/4P3/R3K3 w - - 99 60' });
      engine.moveTo(square('e2'), square('e3'));

      assert.strictEqual(engine.getState().status, 'playing');
      assert.strictEqual(engine.getState().position.halfmoveClock, 0);
    });
  });

  describe('threefold repetition', () => {
    it('draws when the same position occurs a third time', () => {
      const engine = new ChessEngine({ fen: '4k3/8/8/8/8/8/r7/R3K3 w - - 0 1' });

      // Both rooks shuffle back and forth, returning the position twice over.
      playLine(engine, ['a1b1', 'a2b2', 'b1a1', 'b2a2', 'a1b1', 'a2b2', 'b1a1']);
      assert.strictEqual(engine.getState().status, 'playing');

      engine.moveTo(square('b2'), square('a2'));
      const state = engine.getState();
      assert.strictEqual(state.status, 'draw');
      assert.deepStrictEqual(state.result, { winner: null, reason: 'threefold-repetition' });
    });

    it('forgets a repetition that a takeback undid', () => {
      const engine = new ChessEngine({ fen: '4k3/8/8/8/8/8/r7/R3K3 w - - 0 1' });
      playLine(engine, ['a1b1', 'a2b2', 'b1a1', 'b2a2', 'a1b1', 'a2b2', 'b1a1', 'b2a2']);
      assert.strictEqual(engine.getState().status, 'draw');

      engine.undo();
      assert.strictEqual(engine.getState().status, 'playing');
      assert.strictEqual(engine.getState().result, null);
    });
  });

  describe('captured material', () => {
    it('separates each side’s captures', () => {
      const engine = new ChessEngine({ fen: '4k3/8/8/3p4/4P3/8/8/3RK3 w - - 0 1' });
      engine.moveTo(square('e4'), square('d5'));
      engine.moveTo(square('e8'), square('d8'));
      engine.moveTo(square('d1'), square('d5'));

      const moves = engine.getState().history.map((entry) => entry.move);
      const captured = collectCaptures(moves);

      assert.deepStrictEqual(captured.byWhite, ['p']);
      assert.deepStrictEqual(captured.byBlack, []);
    });

    it('scores the material lead in pawns from either point of view', () => {
      const captured = { byWhite: ['r' as const, 'p' as const], byBlack: ['n' as const] };

      assert.strictEqual(materialAdvantage(captured, 'w', PIECE_VALUES), 3);
      assert.strictEqual(materialAdvantage(captured, 'b', PIECE_VALUES), -3);
    });

    it('scores a level game as zero', () => {
      const captured = { byWhite: ['n' as const], byBlack: ['b' as const] };
      assert.strictEqual(materialAdvantage(captured, 'w', PIECE_VALUES), 0);
    });
  });
});
