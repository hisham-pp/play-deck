'use client';

import { useState, useCallback } from 'react';
import { Button, Card, CardContent } from '@playdeck/ui';
import { Trophy, RefreshCw, LogOut } from 'lucide-react';
import { usePlayerStore } from '@/stores/player.store';

import type { LudoPlayer } from '../types/ludo.types';
import { useLudoEngine } from '../hooks/use-ludo-engine';
import { useLudoBotTurn } from '../hooks/use-ludo-bot-turn';
import { useLudoSound } from '../hooks/use-ludo-sound';
import { useLudoSession } from '../hooks/use-ludo-session';
import { LudoLobby } from './LudoLobby';
import { LudoOfflineSetup } from './LudoOfflineSetup';
import { LudoRoomLobby } from './LudoRoomLobby';
import { LudoGameHeader } from './LudoGameHeader';
import { LudoBoard } from './LudoBoard';
import { LudoDice } from './LudoDice';
import { LudoPlayerPanel } from './LudoPlayerPanel';
import { LudoControls } from './LudoControls';

type GameMode = 'lobby' | 'offline-setup' | 'online-room' | 'playing';

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
    .map((a) => (a as { type: 'MOVE_PIECE'; playerId: string; payload: { pieceId: string } }).payload.pieceId);

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

  const handleRestart = () => {
    if (configuredPlayers.length > 0) {
      restart(configuredPlayers);
    }
  };

  if (mode === 'lobby') {
    return (
      <LudoLobby
        onSelectOffline={() => setMode('offline-setup')}
        onSelectOnline={() => setMode('online-room')}
      />
    );
  }

  if (mode === 'offline-setup') {
    return (
      <LudoOfflineSetup
        onStart={handleStartOfflineGame}
        onBack={() => setMode('lobby')}
      />
    );
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
          <LudoPlayerPanel state={state} botThinking={botThinking} />
        </div>

        <div className="space-y-4">
          <LudoDice state={state} isMyTurn={isMyTurn} onRollDice={handleRollDice} />
          <LudoControls
            state={state}
            onPause={() => currentSeat && pause(currentSeat.id)}
            onResume={() => currentSeat && resume(currentSeat.id)}
            onLeave={() => setMode('lobby')}
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
                <Button variant="outline" className="flex-1" onClick={() => setMode('lobby')}>
                  <LogOut className="w-4 h-4 mr-2" /> Exit
                </Button>
                <Button className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold" onClick={handleRestart}>
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
