'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { TransportMessage } from '@/features/multiplayer/services/supabase-transport.service';
import { useMultiplayerStore } from '@/stores/multiplayer.store';
import { usePlayerStore } from '@/stores/player.store';
import type { FootballPlayerAction, FootballState } from '../engine/football-engine';

export interface FootballSnapshotPayload {
  players: FootballState['players'];
  ball: FootballState['ball'];
  blueScore: number;
  redScore: number;
  status: FootballState['status'];
  winnerTeam: FootballState['winnerTeam'];
  timeRemainingSec: number;
  stateTimerSec: number;
  targetScore: number;
  lastScorer: FootballState['lastScorer'];
}

export interface FootballMultiplayerHandlers {
  onRemoteAction: (action: FootballPlayerAction) => void;
  onSnapshotReceived: (snapshot: FootballSnapshotPayload) => void;
  onRequestRestart: () => void;
}

export function useFootballMultiplayer(
  isOnline: boolean,
  gameState: FootballState,
  handlers: FootballMultiplayerHandlers,
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
        case 'FOOTBALL_ACTION':
          if (isAuthority) {
            handlersRef.current.onRemoteAction(msg.payload as FootballPlayerAction);
          }
          break;
        case 'FOOTBALL_SNAPSHOT':
          if (isGuest) {
            handlersRef.current.onSnapshotReceived(msg.payload as FootballSnapshotPayload);
          }
          break;
        case 'FOOTBALL_RESTART':
          if (isAuthority) {
            handlersRef.current.onRequestRestart();
          }
          break;
      }
    });
  }, [isOnline, roomCode, player?.id, onActionReceived, isAuthority, isGuest]);

  // Host broadcasts authoritative physics snapshots (~33ms = 30fps)
  const lastBroadcastRef = useRef(0);
  const stateRef = useRef(gameState);
  stateRef.current = gameState;

  useEffect(() => {
    if (!isOnline || !canSend || !isAuthority) return;

    const interval = setInterval(() => {
      const cur = stateRef.current;
      const now = performance.now();
      if (cur.status === 'playing' || cur.status === 'kickoff' || now - lastBroadcastRef.current >= 33) {
        lastBroadcastRef.current = now;
        sendGameAction(
          'FOOTBALL_SNAPSHOT',
          {
            players: cur.players,
            ball: cur.ball,
            blueScore: cur.blueScore,
            redScore: cur.redScore,
            status: cur.status,
            winnerTeam: cur.winnerTeam,
            timeRemainingSec: cur.timeRemainingSec,
            stateTimerSec: cur.stateTimerSec,
            targetScore: cur.targetScore,
            lastScorer: cur.lastScorer,
          },
          player!.id,
        );
      }
    }, 33);

    return () => clearInterval(interval);
  }, [isOnline, canSend, isAuthority, player, sendGameAction]);

  const sendAction = useCallback(
    (action: FootballPlayerAction) => {
      if (!canSend || !isGuest || !player) return;
      sendGameAction('FOOTBALL_ACTION', action, player.id);
    },
    [canSend, isGuest, player, sendGameAction],
  );

  const requestRestart = useCallback(() => {
    if (!canSend || !player) return;
    sendGameAction('FOOTBALL_RESTART', {}, player.id);
  }, [canSend, player, sendGameAction]);

  return {
    roomCode,
    role,
    opponent,
    isAuthority,
    isGuest,
    hasOpponent,
    sendAction,
    requestRestart,
    leaveRoom,
  };
}
