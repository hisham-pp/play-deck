'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { TransportMessage } from '@/features/multiplayer/services/supabase-transport.service';
import { useMultiplayerStore } from '@/stores/multiplayer.store';
import { usePlayerStore } from '@/stores/player.store';
import type { PaddleInput, PongGameStatus, PongSide, PongState } from '../engine/pong-types';

export interface PongSnapshotPayload {
  ball: PongState['ball'];
  player1: PongState['player1'];
  player2: PongState['player2'];
  status: PongGameStatus;
  servePending: boolean;
  serverSide: PongSide;
  serveCountdown: number;
  rally: number;
  highestRallyInGame: number;
  winner: PongSide | null;
}

export interface PongMultiplayerHandlers {
  onRemotePaddleInput: (input: PaddleInput) => void;
  onSnapshotReceived: (snapshot: PongSnapshotPayload) => void;
  onRequestStart: () => void;
  onRequestPause: () => void;
  onRequestRestart: () => void;
}

export function usePongMultiplayer(
  isOnline: boolean,
  state: PongState,
  handlers: PongMultiplayerHandlers,
) {
  const { player } = usePlayerStore();
  const { roomCode, role, opponent, sendGameAction, onActionReceived, leaveRoom } =
    useMultiplayerStore();

  const isAuthority = role === 'host';
  const isGuest = role === 'guest';
  const hasOpponent = Boolean(opponent);
  const canSend = isOnline && Boolean(player) && Boolean(roomCode);

  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    if (!isOnline || !roomCode) return;

    return onActionReceived((msg: TransportMessage) => {
      if (msg.senderId === player?.id) return;

      switch (msg.type) {
        case 'PONG_PADDLE_INPUT':
          if (isAuthority) {
            handlersRef.current.onRemotePaddleInput(msg.payload as PaddleInput);
          }
          break;
        case 'PONG_SNAPSHOT':
          if (isGuest) {
            handlersRef.current.onSnapshotReceived(msg.payload as PongSnapshotPayload);
          }
          break;
        case 'PONG_START':
          if (isAuthority) {
            handlersRef.current.onRequestStart();
          }
          break;
        case 'PONG_PAUSE':
          if (isAuthority) {
            handlersRef.current.onRequestPause();
          }
          break;
        case 'PONG_RESTART':
          if (isAuthority) {
            handlersRef.current.onRequestRestart();
          }
          break;
      }
    });
  }, [isOnline, roomCode, player?.id, onActionReceived, isAuthority, isGuest]);

  // Host broadcasts snapshots periodically (every ~33ms = 30fps)
  const lastBroadcastRef = useRef(0);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    if (!isOnline || !canSend || !isAuthority) return;

    const interval = setInterval(() => {
      const cur = stateRef.current;
      const now = performance.now();
      if (cur.status !== 'playing' || now - lastBroadcastRef.current >= 33) {
        lastBroadcastRef.current = now;
        sendGameAction(
          'PONG_SNAPSHOT',
          {
            ball: cur.ball,
            player1: cur.player1,
            player2: cur.player2,
            status: cur.status,
            servePending: cur.servePending,
            serverSide: cur.serverSide,
            serveCountdown: cur.serveCountdown,
            rally: cur.rally,
            highestRallyInGame: cur.highestRallyInGame,
            winner: cur.winner,
          },
          player!.id,
        );
      }
    }, 33);

    return () => clearInterval(interval);
  }, [isOnline, canSend, isAuthority, player, sendGameAction]);

  const sendPaddleInput = useCallback(
    (input: PaddleInput) => {
      if (!canSend || !isGuest || !player) return;
      sendGameAction('PONG_PADDLE_INPUT', input, player.id);
    },
    [canSend, isGuest, player, sendGameAction],
  );

  const requestStart = useCallback(() => {
    if (!canSend || !player) return;
    sendGameAction('PONG_START', {}, player.id);
  }, [canSend, player, sendGameAction]);

  const requestPause = useCallback(() => {
    if (!canSend || !player) return;
    sendGameAction('PONG_PAUSE', {}, player.id);
  }, [canSend, player, sendGameAction]);

  const requestRestart = useCallback(() => {
    if (!canSend || !player) return;
    sendGameAction('PONG_RESTART', {}, player.id);
  }, [canSend, player, sendGameAction]);

  return {
    roomCode,
    role,
    opponent,
    isAuthority,
    isGuest,
    hasOpponent,
    sendPaddleInput,
    requestStart,
    requestPause,
    requestRestart,
    leaveRoom,
  };
}
