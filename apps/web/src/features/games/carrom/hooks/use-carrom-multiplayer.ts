'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { TransportMessage } from '@/features/multiplayer/services/supabase-transport.service';
import { useMultiplayerStore } from '@/stores/multiplayer.store';
import { usePlayerStore } from '@/stores/player.store';
import type {
  CarromPiece,
  CarromPlayer,
  CarromSetupType,
  CarromState,
} from '../engine/carrom-engine';

export interface CarromAimPayload {
  strikerX: number;
  angleDeg: number;
  power: number;
}

export interface CarromShotPayload {
  strikerX: number;
  angleDeg: number;
  power: number;
}

export interface CarromSyncPayload {
  coins: CarromPiece[];
  striker: CarromPiece;
  activePlayer: CarromPlayer;
  phase: CarromState['phase'];
  coinsPocketedCount: CarromState['coinsPocketedCount'];
  queenState: CarromState['queenState'];
  winner: CarromPlayer | 'draw' | null;
  message?: string;
}

export interface CarromMultiplayerHandlers {
  onRemoteAim: (payload: CarromAimPayload) => void;
  onRemoteShot: (payload: CarromShotPayload) => void;
  onRemoteSync: (payload: CarromSyncPayload) => void;
  onRequestRestart: (setupType: CarromSetupType) => void;
}

export function useCarromMultiplayer(isOnline: boolean, handlers: CarromMultiplayerHandlers) {
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
        case 'CARROM_AIM':
          handlersRef.current.onRemoteAim(msg.payload as CarromAimPayload);
          break;
        case 'CARROM_SHOT':
          handlersRef.current.onRemoteShot(msg.payload as CarromShotPayload);
          break;
        case 'CARROM_SYNC':
          if (isGuest) {
            handlersRef.current.onRemoteSync(msg.payload as CarromSyncPayload);
          }
          break;
        case 'CARROM_RESTART':
          if (isAuthority) {
            handlersRef.current.onRequestRestart(
              (msg.payload as { setupType: CarromSetupType })?.setupType || 'classic',
            );
          }
          break;
      }
    });
  }, [isOnline, roomCode, player?.id, onActionReceived, isAuthority, isGuest]);

  const sendAim = useCallback(
    (payload: CarromAimPayload) => {
      if (!canSend || !player) return;
      sendGameAction('CARROM_AIM', payload, player.id);
    },
    [canSend, player, sendGameAction],
  );

  const sendShot = useCallback(
    (payload: CarromShotPayload) => {
      if (!canSend || !player) return;
      sendGameAction('CARROM_SHOT', payload, player.id);
    },
    [canSend, player, sendGameAction],
  );

  const sendSync = useCallback(
    (payload: CarromSyncPayload) => {
      if (!canSend || !isAuthority || !player) return;
      sendGameAction('CARROM_SYNC', payload, player.id);
    },
    [canSend, isAuthority, player, sendGameAction],
  );

  const requestRestart = useCallback(
    (setupType: CarromSetupType) => {
      if (!canSend || !player) return;
      sendGameAction('CARROM_RESTART', { setupType }, player.id);
    },
    [canSend, player, sendGameAction],
  );

  return {
    roomCode,
    role,
    opponent,
    isAuthority,
    isGuest,
    hasOpponent,
    sendAim,
    sendShot,
    sendSync,
    requestRestart,
    leaveRoom,
  };
}
