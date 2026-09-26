'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import type { Player } from '@playdeck/game-types';
import { RoomChatBox } from '@/features/chat/components/RoomChatBox';
import type { PlayerPresence } from '@/features/multiplayer/services/supabase-transport.service';
import { RoomVoiceDock } from '@/features/voice/components/RoomVoiceDock';
import { usePlayerStore } from '@/stores/player.store';
import { MODE_AI, MODE_MULTIPLAYER } from '../engine/runic-memory-constants';
import { useRunicEngine } from '../hooks/use-runic-engine';
import { useRunicKeyboard } from '../hooks/use-runic-keyboard';
import { useRunicMultiplayer } from '../hooks/use-runic-multiplayer';
import { useRunicSession } from '../hooks/use-runic-session';
import { useRunicVoiceCommands } from '../hooks/use-runic-voice-commands';
import type {
  ActivePlayer,
  AIDifficulty,
  DifficultyLevel,
  GameMode,
} from '../types/runic-memory.types';
import { RunicMemoryArena } from './RunicMemoryArena';
import { RunicMemorySetupModal } from './RunicMemorySetupModal';

interface PlayerProfileConfig {
  isMultiplayer: boolean;
  myRole: ActivePlayer | null;
  player: Player | null;
  opponent: PlayerPresence | null;
  mode: GameMode;
  aiDifficulty: AIDifficulty;
}

function resolvePlayerProfiles(cfg: PlayerProfileConfig) {
  const { isMultiplayer, myRole, player, opponent, mode, aiDifficulty } = cfg;

  const p1Name = isMultiplayer
    ? myRole === 'P1'
      ? player?.displayName || 'Host'
      : opponent?.displayName || 'Host'
    : player?.displayName || 'Player 1';

  const p1Avatar = isMultiplayer
    ? myRole === 'P1'
      ? player?.avatar
      : opponent?.avatar
    : player?.avatar;

  const p2Name = isMultiplayer
    ? myRole === 'P2'
      ? player?.displayName || 'Guest'
      : opponent?.displayName || 'Guest'
    : mode === MODE_AI
      ? `Bot (${aiDifficulty})`
      : 'Player 2';

  const p2Avatar = isMultiplayer
    ? myRole === 'P2'
      ? player?.avatar
      : opponent?.avatar
    : mode === MODE_AI
      ? '🤖'
      : '🧙';

  return { p1Name, p1Avatar, p2Name, p2Avatar };
}

export function RunicMemoryGame() {
  const { player } = usePlayerStore();
  const { handleGameOver } = useRunicSession();

  const { engine, state, flipCard, resetRound, resetMatch } = useRunicEngine(handleGameOver);

  const {
    roomCode,
    myRole,
    opponent,
    validateAndBroadcastFlip,
    broadcastResetRound,
    broadcastResetMatch,
    leaveRoom,
  } = useRunicMultiplayer(engine, state.mode, state.turn);

  const [isSetupOpen, setIsSetupOpen] = useState(!roomCode);
  const isMultiplayer = state.mode === MODE_MULTIPLAYER;

  // Arriving already seated (invite or join link): switch to multiplayer so the
  // host's board seed is received.
  useEffect(() => {
    if (roomCode && !isMultiplayer) resetMatch(state.difficulty, MODE_MULTIPLAYER);
  }, [roomCode, isMultiplayer, resetMatch, state.difficulty]);

  const handleFlipCard = (index: number) => {
    if (isMultiplayer && !validateAndBroadcastFlip(index)) {
      return;
    }
    flipCard(index, isMultiplayer ? (myRole ?? undefined) : undefined);
  };

  const handleResetRound = () => {
    const seed = Math.floor(Math.random() * 1000000);
    if (isMultiplayer) broadcastResetRound(seed);
    resetRound(seed);
  };

  const handleStartMatch = (config: {
    mode: GameMode;
    difficulty: DifficultyLevel;
    aiDifficulty: AIDifficulty;
  }) => {
    if (state.mode === MODE_MULTIPLAYER && config.mode !== MODE_MULTIPLAYER) {
      leaveRoom();
    }
    const seed = Math.floor(Math.random() * 1000000);
    if (config.mode === MODE_MULTIPLAYER) {
      broadcastResetMatch(seed, config.difficulty);
    }
    resetMatch(config.difficulty, config.mode, config.aiDifficulty, seed);
  };

  const { focusedIndex } = useRunicKeyboard({
    difficulty: state.difficulty,
    isEnabled: !isSetupOpen,
    onFlip: handleFlipCard,
    onReset: handleResetRound,
  });

  const {
    isSupported: isVoiceSupported,
    isListening,
    lastCommand,
    toggleListening,
  } = useRunicVoiceCommands({
    totalCards: state.board.length,
    isEnabled: !isSetupOpen,
    onFlipCard: handleFlipCard,
    onReset: handleResetRound,
  });

  const { p1Name, p1Avatar, p2Name, p2Avatar } = resolvePlayerProfiles({
    isMultiplayer,
    myRole,
    player,
    opponent,
    mode: state.mode,
    aiDifficulty: state.aiDifficulty,
  });

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col items-center gap-4 py-2 px-3 select-none">
      <div className="w-full flex items-center justify-between">
        <Link
          href="/games"
          className="inline-flex items-center gap-2 text-xs font-medium text-deck-500 hover:text-deck-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to games</span>
        </Link>
        <span className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">
          Runic Memory
        </span>
      </div>

      <RunicMemoryArena
        state={state}
        focusedIndex={focusedIndex}
        roomCode={roomCode}
        myRole={myRole}
        player1Name={p1Name}
        player1Avatar={p1Avatar}
        player2Name={p2Name}
        player2Avatar={p2Avatar}
        isVoiceCommandsSupported={isVoiceSupported}
        isListening={isListening}
        lastCommand={lastCommand}
        onFlipCard={handleFlipCard}
        onResetRound={handleResetRound}
        onOpenSetup={() => setIsSetupOpen(true)}
        onLeaveRoom={leaveRoom}
        onToggleVoiceCommands={toggleListening}
      />

      <RunicMemorySetupModal
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        currentMode={state.mode}
        currentDifficulty={state.difficulty}
        currentAiDifficulty={state.aiDifficulty}
        onStartMatch={handleStartMatch}
      />

      {isMultiplayer && roomCode && (
        <>
          <RoomChatBox roomCode={roomCode} />
          <RoomVoiceDock defaultOpen={false} />
        </>
      )}
    </div>
  );
}
