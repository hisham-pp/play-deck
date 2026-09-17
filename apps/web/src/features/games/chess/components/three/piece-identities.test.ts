import assert from 'node:assert';
import { describe, it } from 'node:test';
import { fromAlgebraic } from '../../engine/chess-board';
import { ChessEngine } from '../../engine/chess-engine';
import { identitiesMatchBoard, nextIdentityState, type IdentityState } from './piece-identities';

function square(name: string): number {
  const index = fromAlgebraic(name);
  assert.ok(index !== null, `"${name}" is not a square`);
  return index;
}

/** Advances the identity state to whatever the engine currently shows. */
function sync(previous: IdentityState | null, engine: ChessEngine): IdentityState {
  const state = engine.getState();
  return nextIdentityState(previous, state.position.board, state.history);
}

describe('Piece identities across moves', () => {
  it('gives every piece on a fresh board its own id', () => {
    const engine = new ChessEngine();
    const state = sync(null, engine);

    assert.strictEqual(Object.keys(state.identities).length, 32);
    assert.strictEqual(new Set(Object.values(state.identities)).size, 32);
    assert.ok(identitiesMatchBoard(state.identities, engine.getState().position.board));
  });

  it('carries a moved piece’s id to its new square', () => {
    const engine = new ChessEngine();
    const before = sync(null, engine);
    const pawn = before.identities[square('e2')];

    engine.moveTo(square('e2'), square('e4'));
    const after = sync(before, engine);

    assert.strictEqual(after.identities[square('e4')], pawn);
    assert.strictEqual(after.identities[square('e2')], undefined);
  });

  it('retires the id of a captured piece', () => {
    const engine = new ChessEngine({ fen: '4k3/8/8/3p4/4P3/8/8/4K3 w - - 0 1' });
    const before = sync(null, engine);
    const captured = before.identities[square('d5')];
    const capturer = before.identities[square('e4')];

    engine.moveTo(square('e4'), square('d5'));
    const after = sync(before, engine);

    assert.strictEqual(after.identities[square('d5')], capturer);
    assert.ok(!Object.values(after.identities).includes(captured));
  });

  it('retires the pawn taken en passant, which is not on the landing square', () => {
    const engine = new ChessEngine({ fen: '4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 1' });
    const before = sync(null, engine);
    const taken = before.identities[square('d5')];

    engine.moveTo(square('e5'), square('d6'));
    const after = sync(before, engine);

    assert.strictEqual(after.identities[square('d5')], undefined);
    assert.ok(!Object.values(after.identities).includes(taken));
    assert.ok(identitiesMatchBoard(after.identities, engine.getState().position.board));
  });

  it('moves the rook’s id as well as the king’s when castling', () => {
    const engine = new ChessEngine({ fen: 'r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1' });
    const before = sync(null, engine);
    const king = before.identities[square('e1')];
    const rook = before.identities[square('h1')];

    engine.moveTo(square('e1'), square('g1'));
    const after = sync(before, engine);

    assert.strictEqual(after.identities[square('g1')], king);
    assert.strictEqual(after.identities[square('f1')], rook);
    assert.strictEqual(after.identities[square('h1')], undefined);
  });

  it('keeps the id when a pawn promotes, so the piece grows in place', () => {
    const engine = new ChessEngine({ fen: '8/4P3/8/8/8/8/8/k3K3 w - - 0 1' });
    const before = sync(null, engine);
    const pawn = before.identities[square('e7')];

    engine.moveTo(square('e7'), square('e8'), 'q');
    const after = sync(before, engine);

    assert.strictEqual(after.identities[square('e8')], pawn);
  });

  it('rebuilds after a takeback rather than trusting stale ids', () => {
    const engine = new ChessEngine();
    const start = sync(null, engine);

    engine.moveTo(square('e2'), square('e4'));
    const moved = sync(start, engine);

    engine.undo();
    const undone = sync(moved, engine);

    assert.ok(identitiesMatchBoard(undone.identities, engine.getState().position.board));
    assert.strictEqual(undone.ply, 0);
    assert.strictEqual(Object.keys(undone.identities).length, 32);
  });

  it('issues fresh ids on a rebuild so none collide with the old ones', () => {
    const engine = new ChessEngine();
    const start = sync(null, engine);

    engine.moveTo(square('e2'), square('e4'));
    const moved = sync(start, engine);
    engine.undo();
    const rebuilt = sync(moved, engine);

    const oldIds = new Set(Object.values(moved.identities));
    const newIds = Object.values(rebuilt.identities);
    assert.ok(
      newIds.every((id) => !oldIds.has(id)),
      'rebuilt ids are all new',
    );
  });

  it('returns the same state when nothing changed', () => {
    const engine = new ChessEngine();
    const first = sync(null, engine);
    assert.strictEqual(sync(first, engine), first);
  });

  it('stays in step across a long game', () => {
    const engine = new ChessEngine();
    let identities = sync(null, engine);

    for (const [from, to] of [
      ['e2', 'e4'],
      ['e7', 'e5'],
      ['g1', 'f3'],
      ['b8', 'c6'],
      ['f1', 'b5'],
      ['g8', 'f6'],
      ['e1', 'g1'],
      ['f6', 'e4'],
    ]) {
      assert.ok(engine.moveTo(square(from), square(to)), `${from}${to} should be legal`);
      identities = sync(identities, engine);
      assert.ok(
        identitiesMatchBoard(identities.identities, engine.getState().position.board),
        `identities match the board after ${from}${to}`,
      );
    }

    const ids = Object.values(identities.identities);
    assert.strictEqual(new Set(ids).size, ids.length, 'ids stay unique');
  });
});
