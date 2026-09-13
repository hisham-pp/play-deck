import { useEffect, useMemo } from 'react';
import type { TransportMessage } from '@/features/multiplayer/services/supabase-transport.service';
import { useMultiplayerStore } from '@/stores/multiplayer.store';
import { usePlayerStore } from '@/stores/player.store';
import { DISC_RED, DISC_YELLOW, MODE_MULTIPLAYER } from '../engine/connect-four-constants';
import { ConnectFourEngine } from '../engine/connect-four-engine';
import type { ConnectFourDisc, GameMode } from '../types/connect-four.types';

function handleRemoteMessage(
  msg: TransportMessage,
  localPlayerId: string | undefined,
  engine: ConnectFourEngine,
): void {
  if (msg.senderId === localPlayerId) return;

  switch (msg.type) {
    case 'MOVE': {
      const { column, player: disc } = msg.payload as {
        column: number;
        player: ConnectFourDisc;
      };
      engine.dropPiece(column, disc);
      break;
    }
    case 'RESET_ROUND':
      engine.resetRound();
      break;
    case 'RESET_MATCH':
      engine.resetMatch();
      break;
    default:
      break;
  }
}

export function useConnectFourMultiplayer(
  engine: ConnectFourEngine,
  mode: GameMode,
  turn: ConnectFourDisc,
) {
  const { player } = usePlayerStore();
  const { roomCode, myMark, opponent, sendGameAction, onActionReceived, leaveRoom } =
    useMultiplayerStore();

  const myDisc: ConnectFourDisc | null = useMemo(() => {
    if (myMark === 'X') return DISC_RED;
    if (myMark === 'O') return DISC_YELLOW;
    return null;
  }, [myMark]);

  useEffect(() => {
    if (mode !== MODE_MULTIPLAYER || !roomCode) return;
    return onActionReceived((msg) => handleRemoteMessage(msg, player?.id, engine));
  }, [engine, mode, roomCode, player?.id, onActionReceived]);

  const validateAndBroadcastDrop = (column: number): boolean => {
    if (mode !== MODE_MULTIPLAYER) return true;
    if (!myDisc || !player || turn !== myDisc) return false;

    sendGameAction('MOVE', { column, player: myDisc }, player.id);
    return true;
  };

  const broadcastResetRound = () => {
    if (mode === MODE_MULTIPLAYER && player) {
      sendGameAction('RESET_ROUND', {}, player.id);
    }
  };

  const broadcastResetMatch = () => {
    if (mode === MODE_MULTIPLAYER && player) {
      sendGameAction('RESET_MATCH', {}, player.id);
    }
  };

  return {
    roomCode,
    myDisc,
    opponent,
    validateAndBroadcastDrop,
    broadcastResetRound,
    broadcastResetMatch,
    leaveRoom,
  };
}
