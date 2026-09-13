import { useCallback, useEffect, useRef } from 'react';
import type { TransportMessage } from '@/features/multiplayer/services/supabase-transport.service';
import { useMultiplayerStore } from '@/stores/multiplayer.store';
import { usePlayerStore } from '@/stores/player.store';
import { MODE_ONLINE } from '../engine/pen-fight-constants';
import type { PenFightEngine } from '../engine/pen-fight-engine';
import type {
  FlickImpulse,
  PenFightMode,
  PenFightOutcome,
  PenFightPlayerId,
  PenSyncPayload,
  RoundResultPayload,
} from '../types/pen-fight.types';

interface RemoteFlickPayload {
  playerId: PenFightPlayerId;
  direction: FlickImpulse;
  power: number;
}

export interface PenFightMultiplayerHandlers {
  onRemoteFlick: (playerId: PenFightPlayerId, direction: FlickImpulse, power: number) => void;
  /** Snap the local arena onto the authority's pen poses. */
  onPenSync: (payload: PenSyncPayload) => void;
  /** Put both pens back on their marks, in step with the other device. */
  onResetPositions: () => void;
}

interface RemoteMessageContext {
  engine: PenFightEngine;
  isAuthority: boolean;
  handlers: PenFightMultiplayerHandlers;
}

/**
 * Applies one message from the other device. Snapshots and round results are only honoured by
 * the non-authority client — the authority's own simulation is the source of truth.
 */
function applyRemoteMessage(msg: TransportMessage, ctx: RemoteMessageContext): void {
  const { engine, isAuthority, handlers } = ctx;

  switch (msg.type) {
    case 'FLICK': {
      const { playerId, direction, power } = msg.payload as RemoteFlickPayload;
      handlers.onRemoteFlick(playerId, direction, power);
      return;
    }
    case 'PEN_SYNC': {
      if (!isAuthority) handlers.onPenSync(msg.payload as PenSyncPayload);
      return;
    }
    case 'ROUND_RESULT': {
      if (!isAuthority) engine.resolveRound((msg.payload as RoundResultPayload).winner);
      return;
    }
    case 'SYNC_START':
    case 'RESET_MATCH':
      engine.startMatch();
      handlers.onResetPositions();
      return;
    case 'NEXT_ROUND':
      engine.nextRound();
      handlers.onResetPositions();
      return;
    case 'REMATCH':
      engine.requestRematch();
      handlers.onResetPositions();
      return;
    default:
  }
}

/** Which pen this device drives, or null while the room has no assigned role yet. */
function localPlayerIdFor(role: 'host' | 'guest' | null): PenFightPlayerId | null {
  if (!role) return null;
  return role === 'host' ? 'p1' : 'p2';
}

/** Mirrors both display names into the engine, flipped so each device sees itself as "you". */
function usePenFightPlayerNames(
  engine: PenFightEngine,
  isOnline: boolean,
  role: 'host' | 'guest' | null,
  player: { displayName?: string } | null,
  opponentName: string | null,
) {
  const myName = player?.displayName || 'Player 1';
  const theirName = opponentName || 'Opponent';

  useEffect(() => {
    if (!isOnline || !role) return;
    const mine = localPlayerIdFor(role);
    if (!mine) return;
    const theirs: PenFightPlayerId = mine === 'p1' ? 'p2' : 'p1';
    engine.setPlayerName(mine, myName);
    engine.setPlayerName(theirs, theirName);
  }, [engine, isOnline, role, myName, theirName]);
}

export function usePenFightMultiplayer(
  engine: PenFightEngine,
  mode: PenFightMode,
  activePlayer: PenFightPlayerId,
  handlers: PenFightMultiplayerHandlers,
) {
  const { player } = usePlayerStore();
  const { roomCode, role, opponent, sendGameAction, onActionReceived } = useMultiplayerStore();

  const isOnline = mode === MODE_ONLINE;
  /** The host owns the simulation online; offline modes are always their own authority. */
  const isAuthority = !isOnline || role === 'host';
  const canSend = isOnline && Boolean(player) && Boolean(roomCode);

  // Handlers get a new identity every render; a ref keeps the subscription effect stable so the
  // channel listener is never torn down and re-opened mid-round.
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    if (!isOnline || !roomCode) return;

    return onActionReceived((msg: TransportMessage) => {
      if (msg.senderId === player?.id) return;
      applyRemoteMessage(msg, { engine, isAuthority, handlers: handlersRef.current });
    });
  }, [engine, isOnline, roomCode, player?.id, onActionReceived, isAuthority]);

  const opponentName = opponent?.displayName ?? null;
  usePenFightPlayerNames(engine, isOnline, role, player, opponentName);

  const emit = useCallback(
    (type: string, payload: unknown) => {
      if (!canSend || !player) return;
      sendGameAction(type, payload, player.id);
    },
    [canSend, player, sendGameAction],
  );

  /** Snapshots and round results are meaningless coming from the follower — never send them. */
  const emitAuthoritative = useCallback(
    (type: string, payload: unknown) => {
      if (isAuthority) emit(type, payload);
    },
    [emit, isAuthority],
  );

  const isMyTurn = (): boolean => {
    if (!isOnline) return true;
    return activePlayer === localPlayerIdFor(role);
  };

  return {
    roomCode,
    role,
    opponent,
    isAuthority,
    hasOpponent: Boolean(opponent),
    opponentName,
    isMyTurn,
    broadcastStartMatch: () => emit('SYNC_START', {}),
    broadcastFlick: (playerId: PenFightPlayerId, direction: FlickImpulse, power: number) =>
      emit('FLICK', { playerId, direction, power }),
    broadcastNextRound: () => emit('NEXT_ROUND', {}),
    broadcastRematch: () => emit('REMATCH', {}),
    broadcastPenSync: (payload: PenSyncPayload) => emitAuthoritative('PEN_SYNC', payload),
    broadcastRoundResult: (winner: PenFightOutcome) =>
      emitAuthoritative('ROUND_RESULT', { winner }),
  };
}
