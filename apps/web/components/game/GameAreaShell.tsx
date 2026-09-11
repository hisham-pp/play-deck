'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { GameDefinition } from '@playdeck/game-types';
import { ArrowLeft, Users, Play, ShieldAlert, RotateCcw, Pause, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useGameSessionStore } from '@/stores/game-session.store';
import { usePlayerStore } from '@/stores/player.store';
import { useLibraryStore } from '@/stores/library.store';

interface GameAreaShellProps {
  game: GameDefinition;
}

export function GameAreaShell({ game }: GameAreaShellProps) {
  const { player } = usePlayerStore();
  const { currentSession, isPlaying, startSession, endSession } = useGameSessionStore();
  const { addRecentSession } = useLibraryStore();
  const [localGameStatus, setLocalGameStatus] = useState<'idle' | 'running' | 'over'>('idle');
  const [mockScore, setMockScore] = useState(0);

  const handleStartLocal = () => {
    if (!player) return;
    const session = startSession(game, player);
    addRecentSession(session);
    setLocalGameStatus('running');
    setMockScore(0);
  };

  const handleEndGame = (won: boolean) => {
    if (!player) return;
    const result = endSession(won ? player.id : undefined, !won);
    if (result && currentSession) {
      addRecentSession(currentSession);
    }
    setLocalGameStatus('over');
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
      {/* Back button */}
      <div>
        <Link
          href="/games"
          className="inline-flex items-center gap-2 text-xs font-medium text-deck-500 hover:text-deck-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to games</span>
        </Link>
      </div>

      {/* Game Title Header */}
      <div className="text-center flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <Badge variant={game.status === 'available' ? 'success' : 'neutral'}>
            {game.badge || game.status}
          </Badge>
          <Badge variant="outline">{game.category}</Badge>
        </div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-deck-950 dark:text-white font-display">
          {game.name}
        </h1>
        <p className="text-sm text-deck-600 dark:text-deck-400 max-w-md">
          {game.description}
        </p>
      </div>

      {/* Game Canvas / Area Box */}
      <div className="relative rounded-xl border border-surface-border bg-surface-raised overflow-hidden shadow-arcade">
        {/* Top arcade HUD bar */}
        <div className="h-10 px-4 border-b border-surface-border bg-surface-overlay flex items-center justify-between text-xs text-deck-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-semibold text-deck-800 dark:text-deck-200">
              V1 Shell Session
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>
                {game.players.min === game.players.max
                  ? `${game.players.min} Player`
                  : `${game.players.min} - ${game.players.max} Players`}
              </span>
            </div>
            {localGameStatus === 'running' && (
              <span className="font-mono text-amber-500 font-bold">SCORE: {mockScore}</span>
            )}
          </div>
        </div>

        {/* Game Stage Area */}
        <div className="min-h-[380px] flex flex-col items-center justify-center p-8 text-center bg-surface-base/50 arcade-texture">
          {localGameStatus === 'idle' && (
            <div className="flex flex-col items-center max-w-sm">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-3xl mb-4">
                {game.category === 'strategy' ? '♟️' : game.category === 'arcade' ? '🕹️' : '🧩'}
              </div>
              <h3 className="text-lg font-bold text-deck-900 dark:text-white mb-2 font-display">
                Ready for Launch
              </h3>
              <p className="text-xs text-deck-500 mb-6 leading-relaxed">
                Plug-and-play game shell ready. Session state will be tracked across your local
                Dexie IndexedDB instance.
              </p>

              {game.status === 'available' ? (
                <Button onClick={handleStartLocal} variant="primary" size="lg" className="w-full gap-2">
                  <Play className="w-4 h-4 fill-current" />
                  <span>Play Locally</span>
                </Button>
              ) : (
                <div className="p-3 rounded-md bg-surface-overlay border border-surface-border text-xs text-deck-400">
                  This game is scheduled for release in an upcoming update.
                </div>
              )}
            </div>
          )}

          {localGameStatus === 'running' && (
            <div className="flex flex-col items-center max-w-md w-full animate-fadeIn">
              <div className="p-6 rounded-lg border border-surface-border bg-surface-raised w-full mb-6">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-surface-border">
                  <span className="text-xs font-semibold text-deck-400 uppercase">
                    Turn Orchestration
                  </span>
                  <Badge variant="success">Active Match</Badge>
                </div>
                <div className="text-center py-6">
                  <div className="text-5xl mb-2">🎮</div>
                  <p className="text-sm font-semibold text-deck-800 dark:text-deck-200 mb-1">
                    Local Session in Progress
                  </p>
                  <p className="text-xs text-deck-500">
                    Domain session ID: <span className="font-mono">{currentSession?.id}</span>
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button
                    onClick={() => setMockScore((s) => s + 10)}
                    className="p-2 text-xs rounded bg-surface-overlay hover:bg-surface-border text-deck-700 dark:text-deck-300 font-medium transition-colors"
                  >
                    +10 Points
                  </button>
                  <button
                    onClick={() => setMockScore((s) => Math.max(0, s - 5))}
                    className="p-2 text-xs rounded bg-surface-overlay hover:bg-surface-border text-deck-700 dark:text-deck-300 font-medium transition-colors"
                  >
                    -5 Points
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full">
                <Button
                  onClick={() => handleEndGame(true)}
                  variant="primary"
                  size="md"
                  className="flex-1"
                >
                  Complete Match (Win)
                </Button>
                <Button
                  onClick={() => handleEndGame(false)}
                  variant="outline"
                  size="md"
                  className="flex-1"
                >
                  End (Draw/Exit)
                </Button>
              </div>
            </div>
          )}

          {localGameStatus === 'over' && (
            <div className="flex flex-col items-center max-w-sm animate-fadeIn">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 text-2xl mb-4">
                🏆
              </div>
              <h3 className="text-xl font-bold text-deck-900 dark:text-white mb-1 font-display">
                Session Finished
              </h3>
              <p className="text-xs text-deck-500 mb-6">
                Match saved to your personal library via IndexedDB.
              </p>
              <div className="flex items-center gap-3 w-full">
                <Button onClick={handleStartLocal} variant="primary" size="md" className="flex-1">
                  <RotateCcw className="w-4 h-4 mr-1.5" />
                  Play Again
                </Button>
                <Link href="/library" className="flex-1">
                  <Button variant="secondary" size="md" className="w-full">
                    View Library
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Footer controls & multiplayer banner */}
        <div className="p-4 border-t border-surface-border bg-surface-overlay/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-deck-500">
            <span>Players: {game.players.min} - {game.players.max}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-deck-400 font-medium">Multiplayer</span>
              <Badge variant="warning" size="sm">Coming Soon</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
