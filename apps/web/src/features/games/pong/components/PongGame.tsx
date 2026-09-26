'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GameCategoryBadge, GameStatusBadge } from '@/components/game/GameBadge';
import { OnlineRoomSetupCard } from '@/features/multiplayer/components/OnlineRoomSetupCard';
import { RoomVoiceDock } from '@/features/voice/components/RoomVoiceDock';
import { useGameSessionStore } from '@/stores/game-session.store';
import { useLibraryStore } from '@/stores/library.store';
import { useMultiplayerStore } from '@/stores/multiplayer.store';
import { usePlayerStore } from '@/stores/player.store';
import type { PaddleInput, PongInputs, PongMode } from '../engine/pong-types';
import { usePongEngine } from '../hooks/use-pong-engine';
import { usePongKeyboard } from '../hooks/use-pong-keyboard';
import { type PongSnapshotPayload, usePongMultiplayer } from '../hooks/use-pong-multiplayer';
import { usePongTouch } from '../hooks/use-pong-touch';
import { PongCanvas } from './PongCanvas';
import { PongControls } from './PongControls';
import { PongMobileControls } from './PongMobileControls';
import { PongOverlay } from './PongOverlay';
import { PongScoreboard } from './PongScoreboard';
import { PongSettingsModal } from './PongSettingsModal';
import { PongStatsModal } from './PongStatsModal';

export function PongGame() {
  const { player, recordGamePlayed } = usePlayerStore();
  const { currentSession, endSession } = useGameSessionStore();
  const { addRecentSession } = useLibraryStore();
  const { roomCode, role, opponent, leaveRoom } = useMultiplayerStore();

  const [seatedOnMount] = useState(() => Boolean(useMultiplayerStore.getState().roomCode));
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  // Mobile button override inputs
  const [mobileP1Input, setMobileP1Input] = useState<PaddleInput>({ up: false, down: false });
  const [mobileP2Input, setMobileP2Input] = useState<PaddleInput>({ up: false, down: false });

  // Touch drag state
  const { handleTouchStartOrMove, handleTouchEndOrCancel, getTouchPaddleInput } = usePongTouch();

  const handleGameOver = useCallback(
    (winner: 'left' | 'right') => {
      const isOnlineMatch = Boolean(useMultiplayerStore.getState().roomCode);
      const myRole = useMultiplayerStore.getState().role;
      const won = isOnlineMatch
        ? myRole === 'host'
          ? winner === 'left'
          : winner === 'right'
        : winner === 'left';
      recordGamePlayed(won, 'arcade');

      if (currentSession && player) {
        const result = endSession(won ? player.id : undefined, !won);
        if (result) {
          addRecentSession({
            ...currentSession,
            status: 'completed',
            endedAt: new Date().toISOString(),
          });
        }
      }
    },
    [recordGamePlayed, currentSession, player, endSession, addRecentSession],
  );

  // Hook up keyboard
  const keyboardInputs = usePongKeyboard({
    enabled: !isSettingsOpen && !isStatsOpen,
  });

  // Track remote guest paddle input on host
  const remoteGuestInputRef = useRef<PaddleInput>({ up: false, down: false });

  // Combine inputs based on whether this client is host, guest, or offline
  const isOnline = Boolean(roomCode);
  const isGuest = isOnline && role === 'guest';
  const isHost = isOnline && role === 'host';

  const combinedInputs: PongInputs = useMemo(() => {
    const touchP1 = getTouchPaddleInput('left');
    const touchP2 = getTouchPaddleInput('right');

    if (isGuest) {
      // On guest: local player controls P2. Can use W/S or Arrows or touch or mobile
      const guestUp =
        keyboardInputs.player1.up ||
        keyboardInputs.player2.up ||
        mobileP2Input.up ||
        mobileP1Input.up;
      const guestDown =
        keyboardInputs.player1.down ||
        keyboardInputs.player2.down ||
        mobileP2Input.down ||
        mobileP1Input.down;
      const guestTargetY = touchP2.targetY ?? touchP1.targetY;

      return {
        player1: { up: false, down: false },
        player2: {
          up: guestUp,
          down: guestDown,
          targetY: guestTargetY,
        },
      };
    }

    if (isHost) {
      return {
        player1: {
          up: keyboardInputs.player1.up || mobileP1Input.up,
          down: keyboardInputs.player1.down || mobileP1Input.down,
          targetY: touchP1.targetY,
        },
        player2: remoteGuestInputRef.current,
      };
    }

    // Offline / Local
    return {
      player1: {
        up: keyboardInputs.player1.up || mobileP1Input.up,
        down: keyboardInputs.player1.down || mobileP1Input.down,
        targetY: touchP1.targetY,
      },
      player2: {
        up: keyboardInputs.player2.up || mobileP2Input.up,
        down: keyboardInputs.player2.down || mobileP2Input.down,
        targetY: touchP2.targetY,
      },
    };
  }, [isGuest, isHost, keyboardInputs, mobileP1Input, mobileP2Input, getTouchPaddleInput]);

  const {
    state,
    stats,
    particles,
    startGame,
    pauseGame,
    resumeGame,
    restartGame,
    setMode,
    setDifficulty,
    setWinningScore,
    refreshStats,
    applySnapshot,
  } = usePongEngine({
    onGameOver: handleGameOver,
    inputs: combinedInputs,
    isGuest,
  });

  // Switch to online mode if seated on mount
  useEffect(() => {
    if (seatedOnMount) {
      setMode('online');
    }
  }, [seatedOnMount, setMode]);

  // Set up multiplayer sync handlers
  const handleRemotePaddleInput = useCallback((input: PaddleInput) => {
    remoteGuestInputRef.current = input;
  }, []);

  const handleSnapshotReceived = useCallback(
    (snapshot: PongSnapshotPayload) => {
      applySnapshot(snapshot);
    },
    [applySnapshot],
  );

  const handleRequestStart = useCallback(() => {
    startGame();
  }, [startGame]);

  const handleRequestPause = useCallback(() => {
    pauseGame();
  }, [pauseGame]);

  const handleRequestRestart = useCallback(() => {
    restartGame();
  }, [restartGame]);

  const { sendPaddleInput, requestStart, requestPause, requestRestart, hasOpponent } =
    usePongMultiplayer(state.config.mode === 'online', state, {
      onRemotePaddleInput: handleRemotePaddleInput,
      onSnapshotReceived: handleSnapshotReceived,
      onRequestStart: handleRequestStart,
      onRequestPause: handleRequestPause,
      onRequestRestart: handleRequestRestart,
    });

  // Guest continuously forwards paddle input
  useEffect(() => {
    if (!isGuest) return;
    sendPaddleInput(combinedInputs.player2);
  }, [isGuest, combinedInputs.player2, sendPaddleInput]);

  const handlePauseToggle = useCallback(() => {
    if (isGuest) {
      if (state.status === 'playing') requestPause();
      else if (state.status === 'paused' || state.status === 'ready') requestStart();
      return;
    }

    if (state.status === 'playing') {
      pauseGame();
    } else if (state.status === 'paused') {
      resumeGame();
    } else if (state.status === 'ready') {
      startGame();
    }
  }, [isGuest, requestPause, requestStart, state.status, pauseGame, resumeGame, startGame]);

  const handleStartMatch = useCallback(() => {
    if (isGuest) {
      requestStart();
    } else {
      startGame();
    }
  }, [isGuest, requestStart, startGame]);

  const handleRestartMatch = useCallback(() => {
    if (isGuest) {
      requestRestart();
    } else {
      restartGame();
    }
  }, [isGuest, requestRestart, restartGame]);

  const handleModeChange = useCallback(
    (nextMode: PongMode) => {
      if (nextMode !== 'online' && roomCode) {
        leaveRoom();
      }
      setMode(nextMode);
    },
    [roomCode, leaveRoom, setMode],
  );

  const handleMobileP1 = useCallback((dir: 'up' | 'down', active: boolean) => {
    setMobileP1Input((prev) => ({
      ...prev,
      [dir]: active,
    }));
  }, []);

  const handleMobileP2 = useCallback((dir: 'up' | 'down', active: boolean) => {
    setMobileP2Input((prev) => ({
      ...prev,
      [dir]: active,
    }));
  }, []);

  const p1Name = isHost ? player?.displayName || 'Host' : opponent?.displayName || 'Host';
  const p2Name = isGuest ? player?.displayName || 'Guest' : opponent?.displayName || 'Challenger';

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-4 py-2 px-3 select-none">
      {/* Top Header & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/games"
          onClick={() => {
            if (roomCode) leaveRoom();
          }}
          className="inline-flex items-center gap-2 text-xs font-medium text-deck-500 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to catalog</span>
        </Link>
        <div className="flex items-center gap-2">
          <GameStatusBadge status="available" label="Ready to Play" />
          <GameCategoryBadge category="arcade" />
        </div>
      </div>

      {/* Title & Description */}
      <div className="text-center flex flex-col items-center gap-1">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white font-display">
          Pong
        </h1>
        <p className="text-xs md:text-sm text-deck-400 max-w-md">
          The timeless paddle duel. Deflect the accelerating ball, master angular shots, and
          outrally the AI or your friend.
        </p>
      </div>

      {/* Online Setup Card (when Online mode selected but not in a room yet) */}
      {state.config.mode === 'online' && !roomCode ? (
        <OnlineRoomSetupCard
          title="Pong Online 1v1"
          gameName="Pong"
          subtitle="Host a match or enter a 6-digit code to challenge a friend."
          description="Real-time arcade paddle duel powered by WebRTC audio mesh and low-latency physics."
          onBack={() => handleModeChange('single-player')}
        />
      ) : (
        <>
          {/* WebRTC Voice Chat Dock in Online Mode */}
          {state.config.mode === 'online' && roomCode && (
            <RoomVoiceDock />
          )}

          {/* Scoreboard */}
          <PongScoreboard
            state={state}
            p1Name={p1Name}
            p2Name={p2Name}
            role={isOnline ? role : null}
          />

          {/* Court Arena & Canvas */}
          <div className="relative w-full">
            <PongCanvas
              state={state}
              particles={particles}
              onTouchStartOrMove={handleTouchStartOrMove}
              onTouchEndOrCancel={handleTouchEndOrCancel}
            />
            <PongOverlay
              state={state}
              onStart={handleStartMatch}
              onResume={resumeGame}
              onRestart={handleRestartMatch}
              isOnline={state.config.mode === 'online'}
              hasOpponent={hasOpponent}
              roomCode={roomCode}
              role={role}
              p1Name={p1Name}
              p2Name={p2Name}
            />
          </div>

          {/* Mobile Touch Directional Controls */}
          <PongMobileControls
            mode={state.config.mode}
            role={isOnline ? role : null}
            onP1Move={handleMobileP1}
            onP2Move={handleMobileP2}
          />

          {/* Controls & Toolbar */}
          <PongControls
            state={state}
            onPauseToggle={handlePauseToggle}
            onRestart={handleRestartMatch}
            onModeChange={handleModeChange}
            onDifficultyChange={setDifficulty}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenStats={() => setIsStatsOpen(true)}
          />

          {/* Settings Modal */}
          <PongSettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            state={state}
            onModeChange={handleModeChange}
            onDifficultyChange={setDifficulty}
            onWinningScoreChange={setWinningScore}
          />

          {/* Stats Modal */}
          <PongStatsModal
            isOpen={isStatsOpen}
            onClose={() => setIsStatsOpen(false)}
            stats={stats}
            onStatsReset={refreshStats}
          />
        </>
      )}
    </div>
  );
}
