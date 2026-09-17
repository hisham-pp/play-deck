import assert from 'node:assert';
import { describe, it } from 'node:test';
import type { PieceColor } from '../types/chess.types';
import { fromAlgebraic } from './chess-board';
import { ChessEngine } from './chess-engine';
import {
  applyEnvelope,
  ChessMatchSynchronizer,
  createEnvelope,
  type ChessMoveEnvelope,
  type ChessTransport,
} from './chess-transport';

function square(name: string): number {
  const index = fromAlgebraic(name);
  assert.ok(index !== null, `"${name}" is not a square`);
  return index;
}

/**
 * An in-memory bus standing in for a network. Messages are delivered only when
 * `flush` is called, so tests can reorder or withhold them the way a real
 * connection would.
 */
class LoopbackBus {
  private readonly handlers = new Map<string, ((envelope: ChessMoveEnvelope) => void)[]>();
  private readonly queue: { from: string; envelope: ChessMoveEnvelope }[] = [];

  endpoint(id: string): ChessTransport {
    return {
      send: (envelope) => {
        this.queue.push({ from: id, envelope });
      },
      subscribe: (handler) => {
        const existing = this.handlers.get(id) ?? [];
        this.handlers.set(id, [...existing, handler]);
        return () =>
          this.handlers.set(
            id,
            (this.handlers.get(id) ?? []).filter((h) => h !== handler),
          );
      },
    };
  }

  /** Delivers everything queued to every peer other than the sender. */
  flush(): void {
    const inFlight = this.queue.splice(0, this.queue.length);
    for (const { from, envelope } of inFlight) {
      for (const [id, handlers] of this.handlers) {
        if (id === from) continue;
        for (const handler of handlers) handler(envelope);
      }
    }
  }

  get pendingCount(): number {
    return this.queue.length;
  }
}

function seatedPair(matchId = 'match-1') {
  const bus = new LoopbackBus();
  const white = new ChessEngine({ matchId });
  const black = new ChessEngine({ matchId });

  const seat = (engine: ChessEngine, id: string, color: PieceColor) =>
    new ChessMatchSynchronizer(engine, bus.endpoint(id), color);

  const whiteSide = seat(white, 'white', 'w');
  const blackSide = seat(black, 'black', 'b');
  whiteSide.connect();
  blackSide.connect();

  return { bus, white, black, whiteSide, blackSide };
}

describe('Chess move transport', () => {
  describe('envelopes', () => {
    it('carries coordinates and both positions, not a board', () => {
      const engine = new ChessEngine({ matchId: 'm' });
      const record = engine.moveTo(square('e2'), square('e4'));
      assert.ok(record);

      const envelope = createEnvelope('m', record, 1000);
      assert.deepStrictEqual(envelope, {
        type: 'chess/move',
        matchId: 'm',
        ply: 0,
        uci: 'e2e4',
        color: 'w',
        fenBefore: record.fenBefore,
        fenAfter: record.fenAfter,
        sentAt: 1000,
      });
    });

    it('survives a JSON round trip', () => {
      const engine = new ChessEngine({ matchId: 'm' });
      const record = engine.moveTo(square('e2'), square('e4'));
      assert.ok(record);

      const envelope = createEnvelope('m', record, 1000);
      assert.deepStrictEqual(JSON.parse(JSON.stringify(envelope)), envelope);
    });
  });

  describe('applying a remote move', () => {
    it('replays the move through the receiving engine', () => {
      const source = new ChessEngine({ matchId: 'm' });
      const peer = new ChessEngine({ matchId: 'm' });

      const record = source.moveTo(square('e2'), square('e4'));
      assert.ok(record);

      const result = applyEnvelope(peer, createEnvelope('m', record));
      assert.strictEqual(result.status, 'applied');
      assert.strictEqual(peer.getFen(), source.getFen());
    });

    it('ignores a move that has already been played', () => {
      const source = new ChessEngine({ matchId: 'm' });
      const peer = new ChessEngine({ matchId: 'm' });
      const record = source.moveTo(square('e2'), square('e4'));
      assert.ok(record);

      const envelope = createEnvelope('m', record);
      applyEnvelope(peer, envelope);
      assert.strictEqual(applyEnvelope(peer, envelope).status, 'duplicate');
      assert.strictEqual(peer.getState().history.length, 1);
    });

    it('holds a move that arrives before the ply it follows', () => {
      const source = new ChessEngine({ matchId: 'm' });
      const peer = new ChessEngine({ matchId: 'm' });
      source.moveTo(square('e2'), square('e4'));
      const second = source.moveTo(square('e7'), square('e5'));
      assert.ok(second);

      const result = applyEnvelope(peer, createEnvelope('m', second));
      assert.deepStrictEqual(result, { status: 'buffered', expectedPly: 0 });
      assert.strictEqual(peer.getState().history.length, 0);
    });

    it('rejects a move belonging to another match', () => {
      const source = new ChessEngine({ matchId: 'other' });
      const peer = new ChessEngine({ matchId: 'm' });
      const record = source.moveTo(square('e2'), square('e4'));
      assert.ok(record);

      assert.strictEqual(
        applyEnvelope(peer, createEnvelope('other', record)).status,
        'wrong-match',
      );
    });

    it('rejects an illegal move rather than trusting the sender', () => {
      const peer = new ChessEngine({ matchId: 'm' });
      const forged: ChessMoveEnvelope = {
        type: 'chess/move',
        matchId: 'm',
        ply: 0,
        uci: 'e2e5',
        color: 'w',
        fenBefore: peer.getFen(),
        fenAfter: 'nonsense',
        sentAt: 0,
      };

      const result = applyEnvelope(peer, forged);
      assert.strictEqual(result.status, 'rejected');
      assert.strictEqual(peer.getState().history.length, 0);
    });

    it('rejects unreadable coordinates', () => {
      const peer = new ChessEngine({ matchId: 'm' });
      const result = applyEnvelope(peer, {
        type: 'chess/move',
        matchId: 'm',
        ply: 0,
        uci: 'zz99',
        color: 'w',
        fenBefore: peer.getFen(),
        fenAfter: '',
        sentAt: 0,
      });

      assert.strictEqual(result.status, 'rejected');
    });

    it('reports divergence when the sender started from another position', () => {
      const source = new ChessEngine({ matchId: 'm' });
      const peer = new ChessEngine({ matchId: 'm' });
      peer.moveTo(square('d2'), square('d4'));
      peer.undo();

      const record = source.moveTo(square('e2'), square('e4'));
      assert.ok(record);
      const envelope = { ...createEnvelope('m', record), fenBefore: 'drifted' };

      assert.strictEqual(applyEnvelope(peer, envelope).status, 'diverged');
      assert.strictEqual(peer.getState().history.length, 0);
    });
  });

  describe('two synchronized clients', () => {
    it('keeps both engines on the same position through a whole opening', () => {
      const { bus, white, black, whiteSide, blackSide } = seatedPair();

      const line: [ChessMatchSynchronizer, string, string][] = [
        [whiteSide, 'e2', 'e4'],
        [blackSide, 'e7', 'e5'],
        [whiteSide, 'g1', 'f3'],
        [blackSide, 'b8', 'c6'],
        [whiteSide, 'f1', 'b5'],
      ];

      for (const [side, from, to] of line) {
        const record = side.sendMove(square(from), square(to));
        assert.ok(record, `${from}${to} should be accepted`);
        bus.flush();
      }

      assert.strictEqual(white.getFen(), black.getFen());
      assert.deepStrictEqual(
        white.getState().history.map((entry) => entry.san),
        ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5'],
      );
      assert.deepStrictEqual(
        black.getState().history.map((entry) => entry.san),
        white.getState().history.map((entry) => entry.san),
      );
    });

    it('refuses to move on the opponent’s turn and sends nothing', () => {
      const { bus, black, blackSide } = seatedPair();

      assert.strictEqual(blackSide.sendMove(square('e7'), square('e5')), null);
      assert.strictEqual(black.getState().history.length, 0);
      assert.strictEqual(bus.pendingCount, 0);
    });

    it('synchronizes promotion by capture and both castles', () => {
      const matchId = 'special';
      const bus = new LoopbackBus();
      const fen = 'r1b1k2r/pppPpppp/8/8/8/8/PPP1PPPP/R3K2R w KQkq - 0 1';

      const white = new ChessEngine({ matchId, fen });
      const black = new ChessEngine({ matchId, fen });
      const whiteSide = new ChessMatchSynchronizer(white, bus.endpoint('w'), 'w');
      const blackSide = new ChessMatchSynchronizer(black, bus.endpoint('b'), 'b');
      whiteSide.connect();
      blackSide.connect();

      assert.ok(whiteSide.sendMove(square('d7'), square('c8'), 'n'));
      bus.flush();
      assert.ok(blackSide.sendMove(square('e8'), square('g8')));
      bus.flush();
      assert.ok(whiteSide.sendMove(square('e1'), square('c1')));
      bus.flush();

      assert.strictEqual(white.getFen(), black.getFen());
      assert.deepStrictEqual(
        black.getState().history.map((entry) => entry.san),
        ['dxc8=N', 'O-O', 'O-O-O'],
      );
    });

    it('synchronizes an en passant capture', () => {
      const matchId = 'ep';
      const bus = new LoopbackBus();
      const fen = '4k3/3p4/8/4P3/8/8/8/4K3 b - - 0 1';

      const white = new ChessEngine({ matchId, fen });
      const black = new ChessEngine({ matchId, fen });
      const whiteSide = new ChessMatchSynchronizer(white, bus.endpoint('w'), 'w');
      const blackSide = new ChessMatchSynchronizer(black, bus.endpoint('b'), 'b');
      whiteSide.connect();
      blackSide.connect();

      assert.ok(blackSide.sendMove(square('d7'), square('d5')));
      bus.flush();
      assert.ok(whiteSide.sendMove(square('e5'), square('d6')));
      bus.flush();

      assert.strictEqual(white.getFen(), black.getFen());
      assert.strictEqual(black.getState().position.board[square('d5')], null);
      assert.deepStrictEqual(
        black.getState().history.map((entry) => entry.san),
        ['d5', 'exd6'],
      );
    });

    /**
     * Two players alternate strictly, so neither can receive the other's moves
     * out of order. A spectator or a client replaying a backlog after
     * reconnecting can, which is what the buffer exists for.
     */
    it('replays a backlog that arrives out of order', () => {
      const matchId = 'backlog';
      const source = new ChessEngine({ matchId });
      const envelopes: ChessMoveEnvelope[] = [];

      for (const [from, to] of [
        ['e2', 'e4'],
        ['e7', 'e5'],
        ['g1', 'f3'],
        ['b8', 'c6'],
      ]) {
        const record = source.moveTo(square(from), square(to));
        assert.ok(record);
        envelopes.push(createEnvelope(matchId, record));
      }

      const handlers: ((envelope: ChessMoveEnvelope) => void)[] = [];
      const transport: ChessTransport = {
        send: () => assert.fail('an observer never sends'),
        subscribe: (handler) => {
          handlers.push(handler);
          return () => handlers.splice(handlers.indexOf(handler), 1);
        },
      };

      const observer = new ChessEngine({ matchId });
      new ChessMatchSynchronizer(observer, transport, null).connect();
      const deliver = (envelope: ChessMoveEnvelope) => handlers.forEach((h) => h(envelope));

      // Everything after the first move is held until the first move lands.
      deliver(envelopes[3]);
      deliver(envelopes[2]);
      deliver(envelopes[1]);
      assert.strictEqual(observer.getState().history.length, 0, 'nothing applies out of turn');

      deliver(envelopes[0]);

      assert.strictEqual(observer.getState().history.length, 4);
      assert.strictEqual(observer.getFen(), source.getFen());
      assert.deepStrictEqual(
        observer.getState().history.map((entry) => entry.san),
        ['e4', 'e5', 'Nf3', 'Nc6'],
      );
    });

    it('will not let an observer play a move', () => {
      const matchId = 'watch';
      const bus = new LoopbackBus();
      const observer = new ChessEngine({ matchId });
      const spectator = new ChessMatchSynchronizer(observer, bus.endpoint('obs'), null);
      spectator.connect();

      assert.strictEqual(spectator.sendMove(square('e2'), square('e4')), null);
      assert.strictEqual(observer.getState().history.length, 0);
    });

    it('stops delivering once a client disconnects', () => {
      const { bus, black, whiteSide, blackSide } = seatedPair();

      blackSide.disconnect();
      whiteSide.sendMove(square('e2'), square('e4'));
      bus.flush();

      assert.strictEqual(black.getState().history.length, 0);
    });
  });
});
