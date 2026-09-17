import type { ChessResult, PieceColor } from '../types/chess.types';
import { opponentOf } from './chess-board';
import type { ChessEngine } from './chess-engine';
import { parseUci } from './chess-notation';
import { createMatchId } from './chess-state';
import {
  ChessMatchSynchronizer,
  type ApplyEnvelopeResult,
  type ChessMoveEnvelope,
  type ChessTransport,
} from './chess-transport';

/** Everything besides moves that two clients have to agree on. */
export type ChessControlMessage =
  | { type: 'chess/new-game'; matchId: string }
  | { type: 'chess/sync-request' }
  | { type: 'chess/sync'; matchId: string; moves: string[]; ended: ChessResult | null }
  | { type: 'chess/takeback-request'; color: PieceColor }
  | { type: 'chess/takeback-reply'; accepted: boolean; plies: number }
  | { type: 'chess/resign'; color: PieceColor }
  | { type: 'chess/draw-offer'; color: PieceColor }
  | { type: 'chess/draw-reply'; accepted: boolean };

export type ChessWireMessage = ChessMoveEnvelope | ChessControlMessage;

/** A channel that carries every chess message between two peers. */
export interface ChessWire {
  send(message: ChessWireMessage): void;
  subscribe(handler: (message: ChessWireMessage) => void): () => void;
}

export interface ChessOnlineMatchOptions {
  engine: ChessEngine;
  wire: ChessWire;
  localColor: PieceColor;
  /**
   * The peer whose game is the reference copy. It answers resync requests, so
   * a client that joins late or reloads rebuilds the game from its moves.
   */
  authoritative: boolean;
  onChange?: () => void;
  onMoveResult?: (result: ApplyEnvelopeResult) => void;
}

/**
 * One online game between two clients.
 *
 * Moves travel through `ChessMatchSynchronizer`, which replays each through the
 * local rules; the handful of decisions that are not moves -- a new game, a
 * takeback, a resignation, a draw -- travel as control messages here. Nothing
 * in this class touches React or knows what the wire is.
 */
export class ChessOnlineMatch {
  private readonly engine: ChessEngine;
  private readonly wire: ChessWire;
  private readonly localColor: PieceColor;
  private readonly authoritative: boolean;
  private readonly onChange?: () => void;
  private readonly synchronizer: ChessMatchSynchronizer;
  private unsubscribe: (() => void) | null = null;

  /** The colour that has asked to take a move back, while it waits for an answer. */
  pendingTakebackFrom: PieceColor | null = null;

  constructor(options: ChessOnlineMatchOptions) {
    this.engine = options.engine;
    this.wire = options.wire;
    this.localColor = options.localColor;
    this.authoritative = options.authoritative;
    this.onChange = options.onChange;
    this.synchronizer = new ChessMatchSynchronizer(
      this.engine,
      this.moveTransport(),
      this.localColor,
      options.onMoveResult,
    );
  }

  connect(): void {
    this.disconnect();
    this.synchronizer.connect();
    this.unsubscribe = this.wire.subscribe((message) => this.receive(message));
    if (!this.authoritative) this.wire.send({ type: 'chess/sync-request' });
  }

  disconnect(): void {
    this.synchronizer.disconnect();
    this.unsubscribe?.();
    this.unsubscribe = null;
  }

  get color(): PieceColor {
    return this.localColor;
  }

  /**
   * Re-establishes agreement after the other peer (re)appears: the reference
   * client pushes its game, the other asks for it. Messages sent before a
   * channel finished subscribing are lost, so this is called on every arrival
   * rather than trusted to have happened once.
   */
  resync(): void {
    if (this.authoritative) this.wire.send(this.snapshot());
    else this.wire.send({ type: 'chess/sync-request' });
  }

  move(from: number, to: number, promotion?: 'q' | 'r' | 'b' | 'n') {
    const record = this.synchronizer.sendMove(from, to, promotion);
    if (record) this.setPendingTakeback(null);
    return record;
  }

  startNewGame(): void {
    const matchId = createMatchId();
    this.engine.newGame(undefined, matchId);
    this.setPendingTakeback(null);
    this.wire.send({ type: 'chess/new-game', matchId });
  }

  requestTakeback(): void {
    if (this.engine.getState().history.length === 0) return;
    this.setPendingTakeback(this.localColor);
    this.wire.send({ type: 'chess/takeback-request', color: this.localColor });
  }

  /** Answers the opponent's takeback request. */
  replyTakeback(accepted: boolean): void {
    const requester = this.pendingTakebackFrom;
    if (!requester || requester === this.localColor) return;

    const plies = accepted ? takebackTarget(this.engine, requester) : -1;
    if (accepted) rewindTo(this.engine, plies);
    this.setPendingTakeback(null);
    this.wire.send({ type: 'chess/takeback-reply', accepted, plies });
  }

  resign(): void {
    this.engine.resign(this.localColor);
    this.wire.send({ type: 'chess/resign', color: this.localColor });
  }

  offerDraw(): void {
    this.engine.offerDraw(this.localColor);
    this.wire.send({ type: 'chess/draw-offer', color: this.localColor });
  }

  /** Only the side that did not make the offer may answer it. */
  replyDraw(accepted: boolean): void {
    const offer = this.engine.getState().drawOfferFrom;
    if (!offer || offer === this.localColor) return;

    if (accepted) this.engine.acceptDraw();
    else this.engine.declineDraw();
    this.wire.send({ type: 'chess/draw-reply', accepted });
  }

  private moveTransport(): ChessTransport {
    return {
      send: (envelope) => this.wire.send(envelope),
      subscribe: (handler) =>
        this.wire.subscribe((message) => {
          if (message.type === 'chess/move') handler(message);
        }),
    };
  }

  private receive(message: ChessWireMessage): void {
    switch (message.type) {
      case 'chess/move':
        // Handled by the synchronizer; an opponent move answers any request.
        this.setPendingTakeback(null);
        return;
      case 'chess/new-game':
        this.engine.newGame(undefined, message.matchId);
        this.setPendingTakeback(null);
        return;
      case 'chess/sync-request':
        if (this.authoritative) this.wire.send(this.snapshot());
        return;
      case 'chess/sync':
        if (!this.authoritative) applySnapshot(this.engine, message);
        return;
      default:
        this.receiveDecision(message);
    }
  }

  private receiveDecision(message: ChessControlMessage): void {
    switch (message.type) {
      case 'chess/takeback-request':
        if (message.color !== this.localColor) this.setPendingTakeback(message.color);
        return;
      case 'chess/takeback-reply':
        if (message.accepted) rewindTo(this.engine, message.plies);
        this.setPendingTakeback(null);
        return;
      case 'chess/resign':
        this.engine.resign(message.color);
        return;
      case 'chess/draw-offer':
        this.engine.offerDraw(message.color);
        return;
      case 'chess/draw-reply':
        if (message.accepted) this.engine.acceptDraw();
        else this.engine.declineDraw();
        return;
      default:
        return;
    }
  }

  private snapshot(): ChessControlMessage {
    const state = this.engine.getState();
    const decided =
      state.result &&
      (state.result.reason === 'resignation' || state.result.reason === 'agreement');
    return {
      type: 'chess/sync',
      matchId: state.matchId,
      moves: state.history.map((record) => record.uci),
      ended: decided ? state.result : null,
    };
  }

  private setPendingTakeback(color: PieceColor | null): void {
    if (this.pendingTakebackFrom === color) return;
    this.pendingTakebackFrom = color;
    this.onChange?.();
  }
}

/**
 * How far back a takeback goes. If the requester has already been answered,
 * both their move and the reply come off; otherwise just their own move.
 */
export function takebackTarget(engine: ChessEngine, requester: PieceColor): number {
  const { history, position } = engine.getState();
  const plies = position.turn === requester ? 2 : 1;
  return Math.max(0, history.length - plies);
}

function rewindTo(engine: ChessEngine, plies: number): void {
  if (plies < 0) return;
  while (engine.getState().history.length > plies) {
    if (!engine.undo()) return;
  }
}

/**
 * Rebuilds a game from the reference client's move list. The moves are
 * replayed through the local rules rather than trusted as a position.
 */
function applySnapshot(
  engine: ChessEngine,
  snapshot: Extract<ChessControlMessage, { type: 'chess/sync' }>,
): void {
  engine.newGame(undefined, snapshot.matchId);
  for (const uci of snapshot.moves) {
    const input = parseUci(uci);
    if (!input || !engine.move(input)) return;
  }

  const ended = snapshot.ended;
  if (!ended) return;
  if (ended.reason === 'resignation' && ended.winner) {
    engine.resign(opponentOf(ended.winner));
  } else if (ended.reason === 'agreement') {
    engine.offerDraw(engine.getState().position.turn);
    engine.acceptDraw();
  }
}
