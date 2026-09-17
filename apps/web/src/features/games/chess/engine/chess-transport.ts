import type { ChessMoveRecord, PieceColor } from '../types/chess.types';
import type { ChessEngine } from './chess-engine';
import { parseUci } from './chess-notation';

/**
 * The wire format for a single played move.
 *
 * Deliberately small and free of board state: a peer replays the move through
 * its own rule engine rather than trusting a serialized position. `fenBefore`
 * and `fenAfter` ride along only as consistency checks, so two clients that
 * have drifted apart find out immediately instead of silently diverging.
 */
export interface ChessMoveEnvelope {
  type: 'chess/move';
  matchId: string;
  /** Number of plies that had been played before this move: 0 for White's first. */
  ply: number;
  /** Coordinate notation, e.g. "e2e4" or "e7e8q". */
  uci: string;
  color: PieceColor;
  fenBefore: string;
  fenAfter: string;
  sentAt: number;
}

/**
 * What a future network layer has to provide. Nothing in this module knows
 * whether that is a WebSocket, WebRTC, a Supabase channel or a loopback used in
 * tests.
 */
export interface ChessTransport {
  send(envelope: ChessMoveEnvelope): void;
  subscribe(handler: (envelope: ChessMoveEnvelope) => void): () => void;
}

export type ApplyEnvelopeResult =
  | { status: 'applied'; record: ChessMoveRecord }
  | { status: 'duplicate' }
  | { status: 'buffered'; expectedPly: number }
  | { status: 'wrong-match' }
  | { status: 'rejected'; reason: string }
  | { status: 'diverged'; expectedFen: string; receivedFen: string };

export function createEnvelope(
  matchId: string,
  record: ChessMoveRecord,
  sentAt: number = Date.now(),
): ChessMoveEnvelope {
  return {
    type: 'chess/move',
    matchId,
    ply: record.ply - 1,
    uci: record.uci,
    color: record.move.color,
    fenBefore: record.fenBefore,
    fenAfter: record.fenAfter,
    sentAt,
  };
}

/**
 * Validates a remote move against the local engine and plays it.
 *
 * The local rules are the authority: a peer can only ever cause a move that
 * this engine independently agrees is legal.
 */
export function applyEnvelope(
  engine: ChessEngine,
  envelope: ChessMoveEnvelope,
): ApplyEnvelopeResult {
  const state = engine.getState();

  if (envelope.matchId !== state.matchId) return { status: 'wrong-match' };

  const playedPlies = state.history.length;
  if (envelope.ply < playedPlies) return { status: 'duplicate' };
  if (envelope.ply > playedPlies) return { status: 'buffered', expectedPly: playedPlies };

  if (envelope.fenBefore !== engine.getFen()) {
    return { status: 'diverged', expectedFen: engine.getFen(), receivedFen: envelope.fenBefore };
  }

  const input = parseUci(envelope.uci);
  if (!input) return { status: 'rejected', reason: `Unreadable move "${envelope.uci}"` };

  const record = engine.move(input);
  if (!record) return { status: 'rejected', reason: `Illegal move "${envelope.uci}"` };

  if (record.fenAfter !== envelope.fenAfter) {
    return { status: 'diverged', expectedFen: record.fenAfter, receivedFen: envelope.fenAfter };
  }

  return { status: 'applied', record };
}

/**
 * Binds an engine to a transport: local moves are broadcast, remote moves are
 * validated and replayed, and messages that arrive early are held until the
 * plies before them land.
 *
 * This is the seam a real multiplayer mode plugs into. Nothing here touches the
 * UI, so the React layer keeps subscribing to the same engine it always did.
 */
export class ChessMatchSynchronizer {
  private readonly pending = new Map<number, ChessMoveEnvelope>();
  private unsubscribe: (() => void) | null = null;

  private readonly engine: ChessEngine;
  private readonly transport: ChessTransport;
  /**
   * The colour this client may move, or null for an observer that plays
   * nothing and replays every move it is sent -- a spectator, or a client
   * catching up on a backlog after reconnecting.
   */
  private readonly localColor: PieceColor | null;
  private readonly onRemoteResult?: (result: ApplyEnvelopeResult) => void;

  constructor(
    engine: ChessEngine,
    transport: ChessTransport,
    localColor: PieceColor | null,
    onRemoteResult?: (result: ApplyEnvelopeResult) => void,
  ) {
    this.engine = engine;
    this.transport = transport;
    this.localColor = localColor;
    this.onRemoteResult = onRemoteResult;
  }

  connect(): void {
    this.unsubscribe?.();
    this.unsubscribe = this.transport.subscribe((envelope) => this.receive(envelope));
  }

  disconnect(): void {
    this.unsubscribe?.();
    this.unsubscribe = null;
    this.pending.clear();
  }

  /**
   * Plays a local move and broadcasts it. Returns null when the move was
   * illegal or it was not this client's turn, in which case nothing is sent.
   */
  sendMove(
    from: number,
    to: number,
    promotion?: ChessMoveRecord['move']['promotion'],
  ): ChessMoveRecord | null {
    const state = this.engine.getState();
    if (this.localColor === null || state.position.turn !== this.localColor) return null;

    const record = this.engine.move({ from, to, promotion: promotion ?? undefined });
    if (!record) return null;

    this.transport.send(createEnvelope(state.matchId, record));
    return record;
  }

  private receive(envelope: ChessMoveEnvelope): void {
    // Our own broadcast coming back is already played locally.
    if (this.localColor !== null && envelope.color === this.localColor) return;

    const result = applyEnvelope(this.engine, envelope);
    if (result.status === 'buffered') {
      this.pending.set(envelope.ply, envelope);
    }
    this.onRemoteResult?.(result);

    if (result.status === 'applied') this.drainPending();
  }

  /** Replays any held messages that the latest move has now made current. */
  private drainPending(): void {
    let next = this.pending.get(this.engine.getState().history.length);
    while (next) {
      this.pending.delete(next.ply);
      const result = applyEnvelope(this.engine, next);
      this.onRemoteResult?.(result);
      if (result.status !== 'applied') return;
      next = this.pending.get(this.engine.getState().history.length);
    }
  }
}
