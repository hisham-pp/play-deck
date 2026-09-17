import { useEffect, useMemo } from 'react';
import type { TransportMessage } from '@/features/multiplayer/services/supabase-transport.service';
import { useMultiplayerStore } from '@/stores/multiplayer.store';
import { usePlayerStore } from '@/stores/player.store';
import { MODE_MULTIPLAYER, PLAYER_1, PLAYER_2 } from '../engine/runic-memory-constants';
import { RunicMemoryEngine } from '../engine/runic-memory-engine';
import type { ActivePlayer, DifficultyLevel, GameMode } from '../types/runic-memory.types';

function handleRemoteMessage(
  msg: TransportMessage,
  localPlayerId: string | undefined,
  engine: RunicMemoryEngine,
): void {
  if (msg.senderId === localPlayerId) return;

  switch (msg.type) {
    case 'RUNIC_START_GAME': {
      const { seed, difficulty } = msg.payload as { seed: number; difficulty: DifficultyLevel };
      engine.resetMatch(difficulty, MODE_MULTIPLAYER, undefined, seed);
      break;
    }
    case 'RUNIC_FLIP_CARD': {
      const { index, player } = msg.payload as { index: number; player: ActivePlayer };
      engine.flipCard(index, player);
      break;
    }
    case 'RUNIC_RESET_ROUND': {
      const { seed } = msg.payload as { seed: number };
      engine.resetRound(seed);
      break;
    }
    case 'RUNIC_RESET_MATCH': {
      const { seed, difficulty } = msg.payload as { seed: number; difficulty: DifficultyLevel };
      engine.resetMatch(difficulty, MODE_MULTIPLAYER, undefined, seed);
      break;
    }
    default:
      break;
  }
}

function resolvePlayerRole(mark: 'X' | 'O' | null): ActivePlayer | null {
  if (mark === 'X') return PLAYER_1;
  if (mark === 'O') return PLAYER_2;
  return null;
}

export function useRunicMultiplayer(engine: RunicMemoryEngine, mode: GameMode, turn: ActivePlayer) {
  const { player } = usePlayerStore();
  const { roomCode, myMark, opponent, sendGameAction, onActionReceived, leaveRoom } =
    useMultiplayerStore();

  const myRole = useMemo(() => resolvePlayerRole(myMark), [myMark]);

  useEffect(() => {
    if (mode !== MODE_MULTIPLAYER || !roomCode) return;
    return onActionReceived((msg) => handleRemoteMessage(msg, player?.id, engine));
  }, [engine, mode, roomCode, player?.id, onActionReceived]);

  const broadcastAction = (type: string, payload: unknown) => {
    if (mode === MODE_MULTIPLAYER && player) {
      sendGameAction(type, payload, player.id);
    }
  };

  const validateAndBroadcastFlip = (index: number): boolean => {
    if (mode !== MODE_MULTIPLAYER) return true;
    const canFlip = Boolean(myRole && player && turn === myRole);
    if (!canFlip) return false;

    sendGameAction('RUNIC_FLIP_CARD', { index, player: myRole }, player!.id);
    return true;
  };

  const broadcastStartGame = (seed: number, difficulty: DifficultyLevel) => {
    broadcastAction('RUNIC_START_GAME', { seed, difficulty });
  };

  const broadcastResetRound = (seed: number) => {
    broadcastAction('RUNIC_RESET_ROUND', { seed });
  };

  const broadcastResetMatch = (seed: number, difficulty: DifficultyLevel) => {
    broadcastAction('RUNIC_RESET_MATCH', { seed, difficulty });
  };

  return {
    roomCode,
    myRole,
    opponent,
    broadcastStartGame,
    validateAndBroadcastFlip,
    broadcastResetRound,
    broadcastResetMatch,
    leaveRoom,
  };
}
