import { useEffect } from 'react';
import type { TransportMessage } from '@/features/multiplayer/services/supabase-transport.service';
import { useMultiplayerStore } from '@/stores/multiplayer.store';
import { usePlayerStore } from '@/stores/player.store';
import { MODE_ONLINE } from '../engine/pen-fight-constants';
import type { PenFightEngine } from '../engine/pen-fight-engine';
import type { FlickImpulse, PenFightMode, PenFightPlayerId } from '../types/pen-fight.types';

interface RemoteFlickPayload {
  playerId: PenFightPlayerId;
  direction: FlickImpulse;
  power: number;
}

export function usePenFightMultiplayer(
  engine: PenFightEngine,
  mode: PenFightMode,
  activePlayer: PenFightPlayerId,
  onRemoteFlick: (playerId: PenFightPlayerId, direction: FlickImpulse, power: number) => void,
) {
  const { player } = usePlayerStore();
  const { roomCode, role, opponent, sendGameAction, onActionReceived } = useMultiplayerStore();

  useEffect(() => {
    if (mode !== MODE_ONLINE || !roomCode) return;

    return onActionReceived((msg: TransportMessage) => {
      if (msg.senderId === player?.id) return;

      switch (msg.type) {
        case 'FLICK': {
          const { playerId, direction, power } = msg.payload as RemoteFlickPayload;
          onRemoteFlick(playerId, direction, power);
          break;
        }
        case 'RESET_MATCH':
          engine.startMatch();
          break;
        case 'NEXT_ROUND':
          engine.nextRound();
          break;
        case 'REMATCH':
          engine.requestRematch();
          break;
        default:
          break;
      }
    });
  }, [engine, mode, roomCode, player?.id, onActionReceived, onRemoteFlick]);

  const isMyTurn = (): boolean => {
    if (mode !== MODE_ONLINE) return true;
    if (!role) return false;
    const localPlayerId: PenFightPlayerId = role === 'host' ? 'p1' : 'p2';
    return activePlayer === localPlayerId;
  };

  const broadcastFlick = (playerId: PenFightPlayerId, direction: FlickImpulse, power: number) => {
    if (mode === MODE_ONLINE && player && roomCode) {
      sendGameAction('FLICK', { playerId, direction, power }, player.id);
    }
  };

  const broadcastNextRound = () => {
    if (mode === MODE_ONLINE && player && roomCode) {
      sendGameAction('NEXT_ROUND', {}, player.id);
    }
  };

  const broadcastRematch = () => {
    if (mode === MODE_ONLINE && player && roomCode) {
      sendGameAction('REMATCH', {}, player.id);
    }
  };

  return {
    roomCode,
    role,
    opponentName: opponent?.displayName || null,
    isMyTurn,
    broadcastFlick,
    broadcastNextRound,
    broadcastRematch,
  };
}
