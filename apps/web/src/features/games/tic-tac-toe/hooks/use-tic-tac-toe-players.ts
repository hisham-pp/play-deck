import { useMemo } from 'react';
import type { Player } from '@playdeck/game-types';
import type { PlayerPresence } from '@/features/multiplayer/services/supabase-transport.service';
import { useMultiplayerStore } from '@/stores/multiplayer.store';
import { usePlayerStore } from '@/stores/player.store';
import { MODE_MULTIPLAYER, MODE_SINGLE } from '../engine/tic-tac-toe-constants';
import type { AIDifficulty, GameMode, PlayerMark } from '../types/tic-tac-toe.types';

export interface ArenaPlayerInfo {
  name: string;
  avatar: string;
  role: string;
  isMe: boolean;
}

export interface UseTicTacToePlayersParams {
  mode: GameMode;
  humanPlayerMark: PlayerMark;
  aiDifficulty: AIDifficulty;
  myMark: PlayerMark | null;
  roomCode: string | null;
}

const DEFAULT_AVATAR = '🕹️';
const YOU_LABEL = 'You';

function resolvePlayerX(
  mode: GameMode,
  humanPlayerMark: PlayerMark,
  aiDifficulty: AIDifficulty,
  myMark: PlayerMark | null,
  player: Player | null,
  opponent: PlayerPresence | null,
): ArenaPlayerInfo {
  if (mode === MODE_MULTIPLAYER) {
    if (myMark === 'X') {
      return {
        name: player?.displayName || YOU_LABEL,
        avatar: player?.avatar || DEFAULT_AVATAR,
        role: 'Host (You)',
        isMe: true,
      };
    }
    return {
      name: opponent?.displayName || 'Host',
      avatar: opponent?.avatar || DEFAULT_AVATAR,
      role: 'Host',
      isMe: false,
    };
  }

  if (mode === MODE_SINGLE) {
    if (humanPlayerMark === 'X') {
      return {
        name: player?.displayName || YOU_LABEL,
        avatar: player?.avatar || DEFAULT_AVATAR,
        role: YOU_LABEL,
        isMe: true,
      };
    }
    return {
      name: `AI (${aiDifficulty})`,
      avatar: '🤖',
      role: 'AI Bot',
      isMe: false,
    };
  }

  return { name: 'Player 1', avatar: DEFAULT_AVATAR, role: 'Player 1', isMe: true };
}

function resolvePlayerO(
  mode: GameMode,
  humanPlayerMark: PlayerMark,
  aiDifficulty: AIDifficulty,
  myMark: PlayerMark | null,
  roomCode: string | null,
  player: Player | null,
  opponent: PlayerPresence | null,
): ArenaPlayerInfo {
  if (mode === MODE_MULTIPLAYER) {
    if (myMark === 'O') {
      return {
        name: player?.displayName || YOU_LABEL,
        avatar: player?.avatar || DEFAULT_AVATAR,
        role: 'Guest (You)',
        isMe: true,
      };
    }
    return {
      name: opponent?.displayName || (roomCode ? 'Waiting...' : 'Guest'),
      avatar: opponent?.avatar || (roomCode ? '⏳' : DEFAULT_AVATAR),
      role: 'Guest',
      isMe: false,
    };
  }

  if (mode === MODE_SINGLE) {
    if (humanPlayerMark === 'O') {
      return {
        name: player?.displayName || YOU_LABEL,
        avatar: player?.avatar || DEFAULT_AVATAR,
        role: YOU_LABEL,
        isMe: true,
      };
    }
    return {
      name: `AI (${aiDifficulty})`,
      avatar: '🤖',
      role: 'AI Bot',
      isMe: false,
    };
  }

  return { name: 'Player 2', avatar: '🎮', role: 'Player 2', isMe: false };
}

export function useTicTacToePlayers({
  mode,
  humanPlayerMark,
  aiDifficulty,
  myMark,
  roomCode,
}: UseTicTacToePlayersParams) {
  const { player } = usePlayerStore();
  const { opponent } = useMultiplayerStore();

  const playerX = useMemo<ArenaPlayerInfo>(
    () => resolvePlayerX(mode, humanPlayerMark, aiDifficulty, myMark, player, opponent),
    [mode, humanPlayerMark, aiDifficulty, myMark, player, opponent],
  );

  const playerO = useMemo<ArenaPlayerInfo>(
    () => resolvePlayerO(mode, humanPlayerMark, aiDifficulty, myMark, roomCode, player, opponent),
    [mode, humanPlayerMark, aiDifficulty, myMark, roomCode, player, opponent],
  );

  return { playerX, playerO };
}
