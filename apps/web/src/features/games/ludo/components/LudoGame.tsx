'use client';

import { Trophy, RefreshCw, LogOut, ArrowRight } from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';
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
  const player = usePlayerStore((s) => s.player);

  const { engine, state, rollForPlayer, movePiece, pause, resume, restart } =
    useLudoEngine(configuredPlayers);

  const { botThinking } = useLudoBotTurn(engine, state, configuredPlayers);

  useLudoSound(state);
  useLudoSession(state, configuredPlayers, player?.id ?? null);

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

  // Auto-move single option if user doesn't pick within 1.2 seconds
  useEffect(() => {
    if (
      state?.status === 'playing' &&
      isMyTurn &&
      state.turnPhase === 'awaiting-move' &&
      legalPieceIds.length > 0
    ) {
      const timer = setTimeout(() => {
        if (legalPieceIds.length > 0) {
          handleSelectPiece(legalPieceIds[0]);
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [state?.status, state?.turnPhase, isMyTurn, legalPieceIds, handleSelectPiece]);

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
    <div className="max-w-5xl mx-auto space-y-4 px-2 sm:px-4 py-2">
      <LudoGameHeader
        state={state}
        configuredPlayers={configuredPlayers}
        localSeatIndex={localSeatIndex}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
        <div className="lg:col-span-3 space-y-4">
          <LudoBoard
            state={state}
            legalPieceIds={legalPieceIds}
            onSelectPiece={handleSelectPiece}
            onRollDice={handleRollDice}
          />

          {/* Piece Action Selector Overlay Bar */}
          {isMyTurn && state.turnPhase === 'awaiting-move' && legalPieceIds.length > 0 && (
            <div className="p-3 rounded-xl bg-slate-900 border border-amber-500/40 shadow-xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
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

          <LudoPlayerPanel state={state} botThinking={botThinking} />
        </div>

        <div className="space-y-4">
          <LudoDice state={state} isMyTurn={isMyTurn} onRollDice={handleRollDice} />
          <LudoControls
            state={state}
            onPause={() => currentSeat && pause(currentSeat.id)}
            onResume={() => currentSeat && resume(currentSeat.id)}
            onLeave={() => setMode(MODE_LOBBY)}
          />
        </div>
      </div>

      {isGameOver && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
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
