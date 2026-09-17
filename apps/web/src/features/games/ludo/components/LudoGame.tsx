'use client';

import { Trophy, RefreshCw, LogOut, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useState, useCallback, useEffect, useRef } from 'react';
import { Button, Card, CardContent } from '@playdeck/ui';
import { LudoVoiceDock } from '@/features/voice/components/LudoVoiceDock';
import { useLudoMultiplayerStore } from '@/stores/ludo-multiplayer.store';
import { usePlayerStore } from '@/stores/player.store';
import { STATUS_PLAYING } from '../engine/ludo-constants';
import { useLudoBotTurn } from '../hooks/use-ludo-bot-turn';
import { useLudoEngine } from '../hooks/use-ludo-engine';
import { useLudoPieceSelection } from '../hooks/use-ludo-piece-selection';
import { useLudoSession } from '../hooks/use-ludo-session';
import { useLudoSound } from '../hooks/use-ludo-sound';
import type { LudoPlayer } from '../types/ludo.types';
import { LudoBoard } from './LudoBoard';
import { LudoControls } from './LudoControls';
import { LudoDice } from './LudoDice';
import { LudoGameHeader } from './LudoGameHeader';
import { LudoLobby } from './LudoLobby';
import { LudoOfflineSetup } from './LudoOfflineSetup';
import { LudoPlayerPanel } from './LudoPlayerPanel';
import { LudoRoomLobby } from './LudoRoomLobby';

type GameMode = 'lobby' | 'offline-setup' | 'online-room' | 'playing';

const MODE_LOBBY = 'lobby';
const MODE_PLAYING = 'playing';
const MODE_ONLINE_ROOM = 'online-room';

/** Hosts a fresh online room for the local player, unless they are already in one. */
function useOpenOnlineRoom() {
  const player = usePlayerStore((s) => s.player);
  const createRoom = useLudoMultiplayerStore((s) => s.createRoom);

  return useCallback(() => {
    if (!player || useLudoMultiplayerStore.getState().roomCode) return;
    void createRoom({
      id: player.id,
      displayName: player.displayName,
      avatar: player.avatar || '🕹️',
    });
  }, [createRoom, player]);
}

export function LudoGame() {
  // A player who arrives already seated (invite or join link) goes straight to the room.
  const [mode, setMode] = useState<GameMode>(() =>
    useLudoMultiplayerStore.getState().roomCode ? MODE_ONLINE_ROOM : MODE_LOBBY,
  );
  const [configuredPlayers, setConfiguredPlayers] = useState<LudoPlayer[]>([]);
  const [isDiceSettling, setIsDiceSettling] = useState(false);
  const player = usePlayerStore((s) => s.player);

  useEffect(() => {
    if (mode === MODE_PLAYING) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [mode]);

  const { engine, state, rollForPlayer, movePiece, pause, resume, restart } =
    useLudoEngine(configuredPlayers);

  const { botThinking } = useLudoBotTurn(engine, state, configuredPlayers);

  useLudoSound(state);
  useLudoSession(state, configuredPlayers, player?.id ?? null);

  // Every roll path (HUD button, hotkey, bot, clicking the die) increments this, so
  // the throw and the result reveal are both driven by engine state.
  const rollsThisTurn = state.dice.rollsThisTurn;
  const lastRollRef = useRef(rollsThisTurn);
  useEffect(() => {
    const previous = lastRollRef.current;
    lastRollRef.current = rollsThisTurn;
    if (rollsThisTurn > previous) {
      setIsDiceSettling(true);
    }
  }, [rollsThisTurn]);

  const currentSeat = configuredPlayers[state.currentTurnSeatIndex];
  // In human turn (offline or online), allow local human to roll
  const isMyTurn = currentSeat ? currentSeat.type === 'human' : true;
  const localSeatIndex = state.currentTurnSeatIndex;

  const legalActions = engine ? engine.getLegalActions(state.currentTurnSeatIndex) : [];
  // Sorted so a piece keeps the same hotkey for as long as it stays movable,
  // whatever order the engine happens to enumerate its actions in.
  const legalPieceIds = legalActions
    .filter((a) => a.type === 'MOVE_PIECE')
    .map(
      (a) =>
        (a as { type: 'MOVE_PIECE'; playerId: string; payload: { pieceId: string } }).payload
          .pieceId,
    )
    .sort();

  const handleStartOfflineGame = (players: LudoPlayer[]) => {
    setConfiguredPlayers(players);
    restart(players);
    setMode(MODE_PLAYING);
  };

  const handleStartOnlineGame = (players: LudoPlayer[]) => {
    setConfiguredPlayers(players);
    restart(players);
    setMode(MODE_PLAYING);
  };

  const handleRollDice = useCallback(() => {
    if (currentSeat) {
      rollForPlayer(currentSeat.id);
    }
  }, [rollForPlayer, currentSeat]);

  const handleSelectPiece = useCallback(
    (pieceId: string) => {
      if (currentSeat) {
        movePiece(currentSeat.id, pieceId);
      }
    },
    [movePiece, currentSeat],
  );

  const canSelectPiece =
    state?.status === STATUS_PLAYING &&
    isMyTurn &&
    !isDiceSettling &&
    state.turnPhase === 'awaiting-move' &&
    legalPieceIds.length > 0;

  useLudoPieceSelection(legalPieceIds, canSelectPiece, handleSelectPiece);

  const handleRestart = () => {
    if (configuredPlayers.length > 0) {
      restart(configuredPlayers);
    }
  };

  const openOnlineRoom = useOpenOnlineRoom();
  const handleSelectOnline = () => {
    setMode(MODE_ONLINE_ROOM);
    openOnlineRoom();
  };

  if (mode === MODE_LOBBY) {
    return (
      <LudoLobby
        onSelectOffline={() => setMode('offline-setup')}
        onSelectOnline={handleSelectOnline}
      />
    );
  }

  if (mode === 'offline-setup') {
    return <LudoOfflineSetup onStart={handleStartOfflineGame} onBack={() => setMode(MODE_LOBBY)} />;
  }

  if (mode === 'online-room') {
    return (
      <LudoRoomLobby onStartGame={handleStartOnlineGame} onLeave={() => setMode(MODE_LOBBY)} />
    );
  }

  if (!state) return null;

  const isGameOver = state.status === 'completed';

  return (
    <div className="fixed inset-0 z-50 h-[100dvh] w-screen select-none bg-slate-950">
      <LudoBoard
        state={state}
        legalPieceIds={legalPieceIds}
        numberedPieceIds={canSelectPiece ? legalPieceIds : []}
        onSelectPiece={handleSelectPiece}
        rolling={isDiceSettling}
        onRollSettled={() => setIsDiceSettling(false)}
        onRollDice={handleRollDice}
      />

      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3 sm:p-5">
        {/* Top Row: Header */}
        <div className="flex items-start gap-3">
          <Link
            href="/games"
            className="pointer-events-auto inline-flex items-center gap-2 rounded-lg border border-slate-700/70 bg-slate-900/80 px-3 py-2 text-xs font-medium text-slate-400 backdrop-blur-md transition-colors hover:text-slate-100"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to games</span>
          </Link>

          <div className="pointer-events-auto">
            <LudoGameHeader
              state={state}
              configuredPlayers={configuredPlayers}
              localSeatIndex={localSeatIndex}
            />
          </div>
        </div>

        {/* Bottom Row: seats on the left, dice and controls on the right */}
        <div className="flex items-end justify-between gap-3 sm:gap-4">
          <div className="pointer-events-auto">
            <LudoPlayerPanel
              state={state}
              configuredPlayers={configuredPlayers}
              botThinking={botThinking}
            />
          </div>

          <div className="pointer-events-auto space-y-3">
            <LudoDice
              state={state}
              isMyTurn={isMyTurn}
              isSettling={isDiceSettling}
              onRollDice={handleRollDice}
              moveOptionCount={canSelectPiece ? legalPieceIds.length : 0}
            />
            <LudoControls
              state={state}
              onPause={() => currentSeat && pause(currentSeat.id)}
              onResume={() => currentSeat && resume(currentSeat.id)}
              onLeave={() => setMode(MODE_LOBBY)}
            />
          </div>
        </div>
      </div>

      {/* Top-right is the only corner Ludo's HUD leaves free at every breakpoint. */}
      <LudoVoiceDock anchorClassName="right-3 top-3 sm:right-5 sm:top-5" />

      {isGameOver && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-md w-full border-amber-500/40 bg-slate-900 shadow-2xl">
            <CardContent className="p-6 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-500 text-amber-400 mx-auto flex items-center justify-center">
                <Trophy className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-2xl font-black text-slate-100">Game Completed!</h3>
                <p className="text-sm text-slate-400 mt-1">Final Rankings</p>
              </div>

              <div className="space-y-2 text-left bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                {state.winnerOrder.map((winnerId, rank) => {
                  const pSeat = configuredPlayers.find((p) => p.id === winnerId);
                  return (
                    <div key={winnerId} className="flex items-center justify-between text-sm py-1">
                      <span className="font-bold text-amber-400">#{rank + 1}</span>
                      <span className="text-slate-200">{pSeat?.displayName ?? winnerId}</span>
                      <span className="text-xs text-slate-400">{pSeat?.color}</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setMode(MODE_LOBBY)}>
                  <LogOut className="w-4 h-4 mr-2" /> Exit
                </Button>
                <Button
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"
                  onClick={handleRestart}
                >
                  <RefreshCw className="w-4 h-4 mr-2" /> Play Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
