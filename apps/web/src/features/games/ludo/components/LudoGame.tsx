'use client';

import { Trophy, RefreshCw, LogOut, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useState, useCallback, useEffect, useRef } from 'react';
import { Button, Card, CardContent } from '@playdeck/ui';
import { OnlineRoomSetupCard } from '@/features/multiplayer/components/OnlineRoomSetupCard';
import { LudoVoiceDock } from '@/features/voice/components/LudoVoiceDock';
import { useLudoMultiplayerStore } from '@/stores/ludo-multiplayer.store';
import { usePlayerStore } from '@/stores/player.store';
import { STATUS_PLAYING } from '../engine/ludo-constants';
import { useLudoBotTurn } from '../hooks/use-ludo-bot-turn';
import { useLudoEngine } from '../hooks/use-ludo-engine';
import { useLudoMultiplayer } from '../hooks/use-ludo-multiplayer';
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

export function LudoGame() {
  const roomCode = useLudoMultiplayerStore((s) => s.roomCode);
  const isHost = useLudoMultiplayerStore((s) => s.isHost());
  const adoptSeats = useLudoMultiplayerStore((s) => s.adoptSeats);
  const setRoomStatus = useLudoMultiplayerStore((s) => s.setStatus);
  const leaveRoom = useLudoMultiplayerStore((s) => s.leaveRoom);
  const createRoom = useLudoMultiplayerStore((s) => s.createRoom);
  const joinRoomByCode = useLudoMultiplayerStore((s) => s.joinRoomByCode);

  const [isHosting, setIsHosting] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [onlineError, setOnlineError] = useState<string | null>(null);

  // A player who arrives already seated (invite or join link) goes straight to the room.
  const [mode, setMode] = useState<GameMode>(() =>
    useLudoMultiplayerStore.getState().roomCode ? MODE_ONLINE_ROOM : MODE_LOBBY,
  );
  const [configuredPlayers, setConfiguredPlayers] = useState<LudoPlayer[]>([]);
  const [isDiceSettling, setIsDiceSettling] = useState(false);
  const player = usePlayerStore((s) => s.player);

  const isOnline = Boolean(roomCode);

  useEffect(() => {
    if (mode === MODE_PLAYING) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [mode]);

  const { engine, state, rollForPlayer, applyRoll, movePiece, pause, resume, restart } =
    useLudoEngine(configuredPlayers);

  const { requestRoll, requestMove, broadcastStart, broadcastRestart } = useLudoMultiplayer({
    enabled: isOnline,
    engine,
    state,
    players: configuredPlayers,
    localPlayerId: player?.id ?? null,
    applyRoll: (pId, val) => applyRoll(pId, val),
    applyMove: (pId, pieceId) => movePiece(pId, pieceId),
    onSeats: (seats) => {
      setConfiguredPlayers(seats);
      adoptSeats(seats);
    },
    onStart: (seats) => {
      setConfiguredPlayers(seats);
      adoptSeats(seats);
      setRoomStatus('playing');
      restart(seats);
      setMode(MODE_PLAYING);
    },
  });

  const { botThinking } = useLudoBotTurn(engine, state, configuredPlayers, {
    enabled: !isOnline || isHost,
    onBotRoll: (pId, val) => {
      if (isOnline) {
        requestRoll(pId);
      } else {
        applyRoll(pId, val);
      }
    },
    onBotMove: (pId, pieceId) => {
      if (isOnline) {
        requestMove(pId, pieceId);
      } else {
        movePiece(pId, pieceId);
      }
    },
  });

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
  // In human turn (offline or online), check if local player can act
  const isMyTurn = isOnline
    ? currentSeat?.id === player?.id
    : currentSeat
      ? currentSeat.type === 'human'
      : true;

  const localSeatIndex = isOnline
    ? configuredPlayers.findIndex((p) => p.id === player?.id)
    : state.currentTurnSeatIndex;

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
    adoptSeats(players);
    setRoomStatus('playing');
    broadcastStart(players);
    restart(players);
    setMode(MODE_PLAYING);
  };

  const handleRollDice = useCallback(() => {
    if (currentSeat) {
      if (isOnline) {
        requestRoll(currentSeat.id);
      } else {
        rollForPlayer(currentSeat.id);
      }
    }
  }, [isOnline, requestRoll, rollForPlayer, currentSeat]);

  const handleSelectPiece = useCallback(
    (pieceId: string) => {
      if (currentSeat) {
        if (isOnline) {
          requestMove(currentSeat.id, pieceId);
        } else {
          movePiece(currentSeat.id, pieceId);
        }
      }
    },
    [isOnline, requestMove, movePiece, currentSeat],
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
      if (isOnline) {
        broadcastRestart(configuredPlayers);
      }
      restart(configuredPlayers);
    }
  };

  const handleLeaveGame = () => {
    if (isOnline) {
      leaveRoom();
    }
    setMode(MODE_LOBBY);
  };

  const handleHostOnlineRoom = async () => {
    if (!player) return;
    setIsHosting(true);
    setOnlineError(null);
    const code = await createRoom({
      id: player.id,
      displayName: player.displayName,
      avatar: player.avatar || '🕹️',
    });
    setIsHosting(false);
    if (!code) {
      setOnlineError(useLudoMultiplayerStore.getState().error || 'Failed to create room');
    }
  };

  const handleJoinOnlineRoom = async (code: string) => {
    if (!player) return;
    setIsJoining(true);
    setOnlineError(null);
    const success = await joinRoomByCode(code, {
      id: player.id,
      displayName: player.displayName,
      avatar: player.avatar || '🕹️',
    });
    setIsJoining(false);
    if (!success) {
      setOnlineError(useLudoMultiplayerStore.getState().error || 'Failed to join room. Please check the code.');
    }
  };

  const handleSelectOnline = () => {
    setMode(MODE_ONLINE_ROOM);
    setOnlineError(null);
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
    if (!roomCode) {
      return (
        <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-6 py-4">
          <OnlineRoomSetupCard
            gameName="Ludo"
            gameIcon={<span>🎲</span>}
            subtitle="Roll the dice with friends online with live voice chat!"
            isHosting={isHosting}
            isJoining={isJoining}
            error={onlineError}
            onHost={handleHostOnlineRoom}
            onJoin={handleJoinOnlineRoom}
            onBack={() => setMode(MODE_LOBBY)}
          />
        </div>
      );
    }

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
              onLeave={handleLeaveGame}
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
                <Button variant="outline" className="flex-1" onClick={handleLeaveGame}>
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
