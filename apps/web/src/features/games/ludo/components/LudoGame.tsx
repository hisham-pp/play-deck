'use client';

import { Trophy, RefreshCw, LogOut, ArrowRight } from 'lucide-react';
import { useState, useCallback, useEffect, useRef } from 'react';
import { Button, Card, CardContent } from '@playdeck/ui';
import { usePlayerStore } from '@/stores/player.store';
import { useLudoBotTurn } from '../hooks/use-ludo-bot-turn';
import { useLudoEngine } from '../hooks/use-ludo-engine';
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

export function LudoGame() {
  const [mode, setMode] = useState<GameMode>('lobby');
  const [configuredPlayers, setConfiguredPlayers] = useState<LudoPlayer[]>([]);
  const [isDiceSettling, setIsDiceSettling] = useState(false);
  const player = usePlayerStore((s) => s.player);

  useEffect(() => {
    if (mode === 'playing') {
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
  const legalPieceIds = legalActions
    .filter((a) => a.type === 'MOVE_PIECE')
    .map(
      (a) =>
        (a as { type: 'MOVE_PIECE'; playerId: string; payload: { pieceId: string } }).payload
          .pieceId,
    );

  const handleStartOfflineGame = (players: LudoPlayer[]) => {
    setConfiguredPlayers(players);
    restart(players);
    setMode('playing');
  };

  const handleStartOnlineGame = (players: LudoPlayer[]) => {
    setConfiguredPlayers(players);
    restart(players);
    setMode('playing');
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

  // Auto-move single option after brief delay
  useEffect(() => {
    if (
      state?.status === 'playing' &&
      isMyTurn &&
      !isDiceSettling &&
      state.turnPhase === 'awaiting-move' &&
      legalPieceIds.length === 1
    ) {
      const timer = setTimeout(() => {
        handleSelectPiece(legalPieceIds[0]);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [state?.status, state?.turnPhase, isMyTurn, isDiceSettling, legalPieceIds, handleSelectPiece]);

  const handleRestart = () => {
    if (configuredPlayers.length > 0) {
      restart(configuredPlayers);
    }
  };

  if (mode === MODE_LOBBY) {
    return (
      <LudoLobby
        onSelectOffline={() => setMode('offline-setup')}
        onSelectOnline={() => setMode('online-room')}
      />
    );
  }

  if (mode === 'offline-setup') {
    return <LudoOfflineSetup onStart={handleStartOfflineGame} onBack={() => setMode(MODE_LOBBY)} />;
  }

  if (mode === 'online-room') {
    return <LudoRoomLobby onStartGame={handleStartOnlineGame} />;
  }

  if (!state) return null;

  const isGameOver = state.status === 'completed';

  return (
    <div className="fixed inset-0 z-50 h-[100dvh] w-screen bg-slate-950">
      <LudoBoard
        state={state}
        legalPieceIds={legalPieceIds}
        onSelectPiece={handleSelectPiece}
        rolling={isDiceSettling}
        onRollSettled={() => setIsDiceSettling(false)}
        onRollDice={handleRollDice}
      />

      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3 sm:p-5">
        {/* Top Row: Header */}
        <div className="pointer-events-auto self-start">
          <LudoGameHeader
            state={state}
            configuredPlayers={configuredPlayers}
            localSeatIndex={localSeatIndex}
          />
        </div>

        {/* Bottom Row: Full Width Layout */}
        <div className="flex flex-col gap-3 sm:gap-4">
          {/* Player Panel - Full Width */}
          <div className="pointer-events-auto">
            <LudoPlayerPanel
              state={state}
              configuredPlayers={configuredPlayers}
              botThinking={botThinking}
            />
          </div>

          {/* Action Bar + Dice + Controls Row */}
          <div className="flex gap-3 sm:gap-4 items-end justify-between">
            {/* Piece Action Selector */}
            <div className="flex-1">
              {isMyTurn &&
                !isDiceSettling &&
                state.turnPhase === 'awaiting-move' &&
                legalPieceIds.length > 0 && (
                  <div className="pointer-events-auto p-3 rounded-lg bg-slate-900/80 border border-amber-500/40 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
                    <div className="text-xs font-bold text-amber-400 flex items-center gap-2">
                      <span className="text-base">🎲</span>
                      <span>
                        {state.dice.value === 6
                          ? 'Rolled a 6! Select piece to exit base/move (Grants Extra Turn):'
                          : `Rolled a ${state.dice.value}! Select piece to move:`}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {legalPieceIds.map((pieceId, idx) => (
                        <Button
                          key={pieceId}
                          size="sm"
                          onClick={() => handleSelectPiece(pieceId)}
                          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md"
                        >
                          Move Piece #{idx + 1} <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            {/* Dice + Controls */}
            <div className="space-y-3 pointer-events-auto">
              <LudoDice
                state={state}
                isMyTurn={isMyTurn}
                isSettling={isDiceSettling}
                onRollDice={handleRollDice}
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
      </div>

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
