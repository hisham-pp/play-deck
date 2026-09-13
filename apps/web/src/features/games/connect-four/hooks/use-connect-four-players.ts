import { useMemo } from 'react';
import type { PlayerPresence } from '@/features/multiplayer/services/supabase-transport.service';
import { usePlayerStore } from '@/stores/player.store';
import {
  AI_DEFAULT_NAME,
  DISC_RED,
  MODE_MULTIPLAYER,
  MODE_SINGLE,
  PLAYER_1_DEFAULT_NAME,
  PLAYER_2_DEFAULT_NAME,
} from '../engine/connect-four-constants';
import type { AIDifficulty, ConnectFourDisc, GameMode } from '../types/connect-four.types';

export interface ConnectFourPlayerDisplay {
  name: string;
  avatar?: string;
  isMe: boolean;
  isAI: boolean;
  roleTag: string;
}

interface UseConnectFourPlayersOptions {
  mode: GameMode;
  humanPlayerDisc: ConnectFourDisc;
  aiDifficulty: AIDifficulty;
  myDisc: ConnectFourDisc | null;
  opponent: PlayerPresence | null;
}

interface ResolvePlayerParams {
  mode: GameMode;
  humanPlayerDisc: ConnectFourDisc;
  aiDifficulty: AIDifficulty;
  myDisc: ConnectFourDisc | null;
  opponent: PlayerPresence | null;
  player: { displayName?: string; avatar?: string } | null;
}

function resolvePlayer1({
  mode,
  humanPlayerDisc,
  aiDifficulty,
  myDisc,
  opponent,
  player,
}: ResolvePlayerParams): ConnectFourPlayerDisplay {
  if (mode === MODE_MULTIPLAYER) {
    if (myDisc === DISC_RED) {
      return {
        name: player?.displayName || 'Host (You)',
        avatar: player?.avatar,
        isMe: true,
        isAI: false,
        roleTag: 'Red (Host)',
      };
    }
    return {
      name: opponent?.displayName || 'Host',
      avatar: opponent?.avatar,
      isMe: false,
      isAI: false,
      roleTag: 'Red (Host)',
    };
  }

  if (mode === MODE_SINGLE) {
    const isHuman = humanPlayerDisc === DISC_RED;
    return {
      name: isHuman
        ? player?.displayName || PLAYER_1_DEFAULT_NAME
        : `${AI_DEFAULT_NAME} (${aiDifficulty.toUpperCase()})`,
      avatar: isHuman ? player?.avatar : undefined,
      isMe: isHuman,
      isAI: !isHuman,
      roleTag: 'Red Discs',
    };
  }

  return {
    name: player?.displayName || PLAYER_1_DEFAULT_NAME,
    avatar: player?.avatar,
    isMe: true,
    isAI: false,
    roleTag: 'Red Discs (First)',
  };
}

function resolvePlayer2({
  mode,
  humanPlayerDisc,
  aiDifficulty,
  myDisc,
  opponent,
  player,
}: ResolvePlayerParams): ConnectFourPlayerDisplay {
  if (mode === MODE_MULTIPLAYER) {
    if (myDisc === DISC_RED) {
      return {
        name: opponent?.displayName || 'Waiting for opponent...',
        avatar: opponent?.avatar,
        isMe: false,
        isAI: false,
        roleTag: 'Yellow (Guest)',
      };
    }
    return {
      name: player?.displayName || 'Guest (You)',
      avatar: player?.avatar,
      isMe: true,
      isAI: false,
      roleTag: 'Yellow (Guest)',
    };
  }

  if (mode === MODE_SINGLE) {
    const isHuman = humanPlayerDisc !== DISC_RED;
    return {
      name: isHuman
        ? player?.displayName || PLAYER_2_DEFAULT_NAME
        : `${AI_DEFAULT_NAME} (${aiDifficulty.toUpperCase()})`,
      avatar: isHuman ? player?.avatar : undefined,
      isMe: isHuman,
      isAI: !isHuman,
      roleTag: isHuman ? 'Yellow Discs' : 'Yellow Discs (AI)',
    };
  }

  return {
    name: PLAYER_2_DEFAULT_NAME,
    avatar: undefined,
    isMe: false,
    isAI: false,
    roleTag: 'Yellow Discs (Second)',
  };
}

export function useConnectFourPlayers({
  mode,
  humanPlayerDisc,
  aiDifficulty,
  myDisc,
  opponent,
}: UseConnectFourPlayersOptions) {
  const { player } = usePlayerStore();

  const player1 = useMemo(
    () =>
      resolvePlayer1({
        mode,
        humanPlayerDisc,
        aiDifficulty,
        myDisc,
        opponent,
        player,
      }),
    [mode, humanPlayerDisc, aiDifficulty, myDisc, opponent, player],
  );

  const player2 = useMemo(
    () =>
      resolvePlayer2({
        mode,
        humanPlayerDisc,
        aiDifficulty,
        myDisc,
        opponent,
        player,
      }),
    [mode, humanPlayerDisc, aiDifficulty, myDisc, opponent, player],
  );

  return { player1, player2 };
}
