import assert from 'node:assert';
import { describe, it } from 'node:test';
import type { PieceColor } from '../types/chess.types';
import { fromAlgebraic } from './chess-board';
import { ChessEngine } from './chess-engine';
import { ChessOnlineMatch, type ChessWire, type ChessWireMessage } from './chess-online-match';

function square(name: string): number {
  const index = fromAlgebraic(name);
  assert.ok(index !== null, `"${name}" is not a square`);
  return index;
}

/** Delivers messages only on `flush`, like a network with latency. */
class Wire {
  private readonly handlers = new Map<string, Set<(message: ChessWireMessage) => void>>();
  private readonly queue: { from: string; message: ChessWireMessage }[] = [];

  endpoint(id: string): ChessWire {
    const handlers = new Set<(message: ChessWireMessage) => void>();
    this.handlers.set(id, handlers);
    return {
      send: (message) => this.queue.push({ from: id, message }),
      subscribe: (handler) => {
        handlers.add(handler);
        return () => handlers.delete(handler);
      },
    };
  }

  flush(): void {
    while (this.queue.length > 0) {
      const { from, message } = this.queue.shift()!;
      for (const [id, handlers] of this.handlers) {
        if (id === from) continue;
        for (const handler of [...handlers]) handler(message);
      }
    }
  }
}

function seat(wire: Wire, id: string, color: PieceColor, authoritative: boolean, matchId: string) {
  const engine = new ChessEngine({ matchId });
  const match = new ChessOnlineMatch({
    engine,
    wire: wire.endpoint(id),
    localColor: color,
    authoritative,
  });
  match.connect();
  return { engine, match };
}

function pair() {
  const wire = new Wire();
  const host = seat(wire, 'host', 'w', true, 'm1');
  const guest = seat(wire, 'guest', 'b', false, 'm1');
  wire.flush();
  return { wire, host, guest };
}

function play(side: { match: ChessOnlineMatch }, from: string, to: string) {
  const record = side.match.move(square(from), square(to));
  assert.ok(record, `${from}${to} should be accepted`);
}

describe('Chess online match', () => {
  it('keeps both boards identical as moves are exchanged', () => {
    const { wire, host, guest } = pair();
    play(host, 'e2', 'e4');
    wire.flush();
    play(guest, 'e7', 'e5');
    wire.flush();

    assert.strictEqual(host.engine.getFen(), guest.engine.getFen());
    assert.strictEqual(host.engine.getState().history.length, 2);
  });

  it('refuses a move from the side that is not on move', () => {
    const { host, guest } = pair();
    assert.strictEqual(guest.match.move(square('e7'), square('e5')), null);
    assert.ok(host.match.move(square('e2'), square('e4')));
  });

  it('rebuilds a late joiner from the host move list', () => {
    const wire = new Wire();
    const host = seat(wire, 'host', 'w', true, 'real-match');
    play(host, 'd2', 'd4');
    wire.flush();

    // The guest starts on a different match id and catches up on connect.
    const guest = seat(wire, 'guest', 'b', false, 'stale');
    wire.flush();

    assert.strictEqual(guest.engine.getState().matchId, 'real-match');
    assert.strictEqual(guest.engine.getFen(), host.engine.getFen());

    play(guest, 'd7', 'd5');
    wire.flush();
    assert.strictEqual(host.engine.getFen(), guest.engine.getFen());
  });

  it('carries a resignation into the rebuilt game', () => {
    const wire = new Wire();
    const host = seat(wire, 'host', 'w', true, 'm');
    host.match.resign();
    const guest = seat(wire, 'guest', 'b', false, 'x');
    wire.flush();

    assert.strictEqual(guest.engine.getState().status, 'resigned');
    assert.strictEqual(guest.engine.getState().result?.winner, 'b');
  });

  it('starts a fresh game on both sides under one new match id', () => {
    const { wire, host, guest } = pair();
    play(host, 'e2', 'e4');
    wire.flush();

    guest.match.startNewGame();
    wire.flush();

    assert.strictEqual(host.engine.getState().history.length, 0);
    assert.strictEqual(host.engine.getState().matchId, guest.engine.getState().matchId);
    assert.notStrictEqual(host.engine.getState().matchId, 'm1');
  });

  describe('takebacks', () => {
    it('only happen once the opponent agrees', () => {
      const { wire, host, guest } = pair();
      play(host, 'e2', 'e4');
      wire.flush();

      host.match.requestTakeback();
      wire.flush();
      assert.strictEqual(guest.match.pendingTakebackFrom, 'w');
      assert.strictEqual(host.engine.getState().history.length, 1, 'nothing undone yet');

      guest.match.replyTakeback(true);
      wire.flush();

      assert.strictEqual(host.engine.getState().history.length, 0);
      assert.strictEqual(guest.engine.getState().history.length, 0);
      assert.strictEqual(host.match.pendingTakebackFrom, null);
    });

    it('take back the reply too when the opponent has already moved', () => {
      const { wire, host, guest } = pair();
      play(host, 'e2', 'e4');
      wire.flush();
      play(guest, 'e7', 'e5');
      wire.flush();

      host.match.requestTakeback();
      wire.flush();
      guest.match.replyTakeback(true);
      wire.flush();

      assert.strictEqual(host.engine.getState().history.length, 0);
      assert.strictEqual(host.engine.getFen(), guest.engine.getFen());
      assert.strictEqual(host.engine.getState().position.turn, 'w');
    });

    it('leave the game alone when declined', () => {
      const { wire, host, guest } = pair();
      play(host, 'e2', 'e4');
      wire.flush();
      host.match.requestTakeback();
      wire.flush();
      guest.match.replyTakeback(false);
      wire.flush();

      assert.strictEqual(host.engine.getState().history.length, 1);
      assert.strictEqual(host.match.pendingTakebackFrom, null);
    });

    it('cannot be answered by the side that asked', () => {
      const { wire, host } = pair();
      play(host, 'e2', 'e4');
      wire.flush();
      host.match.requestTakeback();
      host.match.replyTakeback(true);
      assert.strictEqual(host.engine.getState().history.length, 1);
    });
  });

  describe('decisions', () => {
    it('ends the game on both boards when a player resigns', () => {
      const { wire, host, guest } = pair();
      guest.match.resign();
      wire.flush();

      assert.strictEqual(host.engine.getState().status, 'resigned');
      assert.strictEqual(host.engine.getState().result?.winner, 'w');
      assert.strictEqual(guest.engine.getState().result?.winner, 'w');
    });

    it('agrees a draw only when the other side accepts', () => {
      const { wire, host, guest } = pair();
      host.match.offerDraw();
      wire.flush();
      assert.strictEqual(guest.engine.getState().drawOfferFrom, 'w');

      host.match.replyDraw(true);
      assert.strictEqual(host.engine.getState().status, 'playing', 'the offerer cannot accept');

      guest.match.replyDraw(true);
      wire.flush();
      assert.strictEqual(host.engine.getState().status, 'draw');
      assert.strictEqual(guest.engine.getState().result?.reason, 'agreement');
    });

    it('clears a declined draw offer on both boards', () => {
      const { wire, host, guest } = pair();
      host.match.offerDraw();
      wire.flush();
      guest.match.replyDraw(false);
      wire.flush();

      assert.strictEqual(host.engine.getState().drawOfferFrom, null);
      assert.strictEqual(guest.engine.getState().drawOfferFrom, null);
      assert.strictEqual(host.engine.getState().status, 'playing');
    });
  });
});
