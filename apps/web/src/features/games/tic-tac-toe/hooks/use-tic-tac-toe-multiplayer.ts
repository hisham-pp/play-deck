import { useEffect } from 'react';
import type { TransportMessage } from '@/features/multiplayer/services/supabase-transport.service';
import { useMultiplayerStore } from '@/stores/multiplayer.store';
import { usePlayerStore } from '@/stores/player.store';
import { MODE_MULTIPLAYER } from '../engine/tic-tac-toe-constants';
import { TicTacToeEngine } from '../engine/tic-tac-toe-engine';
import type { GameMode, PlayerMark } from '../types/tic-tac-toe.types';

function handleRemoteMessage(
  msg: TransportMessage,
  localPlayerId: string | undefined,
  engine: TicTacToeEngine,
): void {
  if (msg.senderId === localPlayerId) return;

  switch (msg.type) {
    case 'MOVE': {
      const { index, player: mark } = msg.payload as { index: number; player: PlayerMark };
      engine.makeMove(index, mark);
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

export function useTicTacToeMultiplayer(engine: TicTacToeEngine, mode: GameMode, turn: PlayerMark) {
  const { player } = usePlayerStore();
  const { roomCode, myMark, opponent, sendGameAction, onActionReceived } = useMultiplayerStore();

  useEffect(() => {
    if (mode !== MODE_MULTIPLAYER || !roomCode) return;
    return onActionReceived((msg) => handleRemoteMessage(msg, player?.id, engine));
  }, [engine, mode, roomCode, player?.id, onActionReceived]);

  const validateAndBroadcastMove = (index: number): boolean => {
    if (mode !== MODE_MULTIPLAYER) return true;
    if (!myMark || !player || turn !== myMark) return false;

    sendGameAction('MOVE', { index, player: myMark }, player.id);
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
    myMark,
    opponentName: opponent?.displayName || null,
    validateAndBroadcastMove,
    broadcastResetRound,
    broadcastResetMatch,
  };
}
