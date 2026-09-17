'use client';

import { useEffect, useMemo, useReducer, useState } from 'react';
import { useMultiplayerStore } from '@/stores/multiplayer.store';
import { usePlayerStore } from '@/stores/player.store';
import type { ChessEngine } from '../engine/chess-engine';
import {
  ChessOnlineMatch,
  type ChessWire,
  type ChessWireMessage,
} from '../engine/chess-online-match';
import type { PieceColor } from '../types/chess.types';

/** The single game-action type every chess message rides under. */
const CHESS_ACTION = 'CHESS';

/**
 * Connects the chess engine to the shared room channel.
 *
 * The room host plays White and is the reference copy of the game; the guest
 * plays Black. Everything sent is a move or a decision, never UI state, and
 * every incoming move is checked by the local rules before it is played.
 */
export function useChessOnline(engine: ChessEngine) {
  const player = usePlayerStore((state) => state.player);
  const roomCode = useMultiplayerStore((state) => state.roomCode);
  const myMark = useMultiplayerStore((state) => state.myMark);
  const role = useMultiplayerStore((state) => state.role);
  const opponent = useMultiplayerStore((state) => state.opponent);
  const connectionStatus = useMultiplayerStore((state) => state.connectionStatus);
  const sendGameAction = useMultiplayerStore((state) => state.sendGameAction);
  const onActionReceived = useMultiplayerStore((state) => state.onActionReceived);
  const leaveRoom = useMultiplayerStore((state) => state.leaveRoom);

  const [match, setMatch] = useState<ChessOnlineMatch | null>(null);
  // The match keeps its takeback request outside the engine; this re-renders on it.
  const [revision, bump] = useReducer((count: number) => count + 1, 0);

  const localColor: PieceColor | null = useMemo(() => {
    if (myMark === 'X') return 'w';
    if (myMark === 'O') return 'b';
    return null;
  }, [myMark]);

  const playerId = player?.id ?? null;

  useEffect(() => {
    if (!roomCode || !localColor || !playerId) {
      setMatch(null);
      return;
    }

    const wire: ChessWire = {
      send: (message) => sendGameAction(CHESS_ACTION, message, playerId),
      subscribe: (handler) =>
        onActionReceived((incoming) => {
          if (incoming.type !== CHESS_ACTION || incoming.senderId === playerId) return;
          handler(incoming.payload as ChessWireMessage);
        }),
    };

    const next = new ChessOnlineMatch({
      engine,
      wire,
      localColor,
      authoritative: role === 'host',
      onChange: bump,
    });
    next.connect();
    setMatch(next);

    return () => next.disconnect();
  }, [engine, localColor, onActionReceived, playerId, role, roomCode, sendGameAction]);

  // Whenever the opponent (re)appears, agree on the game again.
  const opponentId = opponent?.playerId ?? null;
  useEffect(() => {
    if (match && opponentId) match.resync();
  }, [match, opponentId]);

  return {
    match,
    revision,
    roomCode,
    localColor,
    opponent,
    connectionStatus,
    isOnline: Boolean(match),
    pendingTakebackFrom: match?.pendingTakebackFrom ?? null,
    leaveRoom,
  };
}

export type ChessOnline = ReturnType<typeof useChessOnline>;
