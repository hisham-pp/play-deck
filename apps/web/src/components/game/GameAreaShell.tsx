'use client';

import { ArrowLeft, Users } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';
import { GameDefinition } from '@playdeck/game-types';
import { Badge } from '@/components/ui/Badge';
import { useGameSessionStore } from '@/stores/game-session.store';
import { useLibraryStore } from '@/stores/library.store';
import { usePlayerStore } from '@/stores/player.store';
import { GameStage } from './GameStage';

export function GameAreaShell({ game }: { game: GameDefinition }) {
  const { player } = usePlayerStore();
  const { currentSession, startSession, endSession } = useGameSessionStore();
  const { addRecentSession } = useLibraryStore();
  const [status, setStatus] = useState<'idle' | 'running' | 'over'>('idle');
  const [mockScore, setMockScore] = useState(0);

  const handleStart = () => {
    if (!player) return;
    const session = startSession(game, player);
    addRecentSession(session);
    setStatus('running');
    setMockScore(0);
  };

  const handleScore = (delta: number) => {
    setMockScore((s) => Math.max(0, s + delta));
  };

  const handleEnd = (won: boolean) => {
    if (!player) return;
    const result = endSession(won ? player.id : undefined, !won);
    if (result && currentSession) {
      addRecentSession(currentSession);
    }
    setStatus('over');
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
      <div>
        <Link
          href="/games"
          className="inline-flex items-center gap-2 text-xs font-medium text-deck-500 hover:text-deck-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to games</span>
        </Link>
      </div>

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
        <p className="text-sm text-deck-600 dark:text-deck-400 max-w-md">{game.description}</p>
      </div>

      <div className="relative rounded-xl border border-surface-border bg-surface-raised overflow-hidden shadow-arcade">
        <div className="h-10 px-4 border-b border-surface-border bg-surface-overlay flex items-center justify-between text-xs text-deck-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-semibold text-deck-800 dark:text-deck-200">V1 Shell Session</span>
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
            {status === 'running' && (
              <span className="font-mono text-amber-500 font-bold">SCORE: {mockScore}</span>
            )}
          </div>
        </div>

        <div className="min-h-[380px] flex flex-col items-center justify-center p-8 text-center bg-surface-base/50 arcade-texture">
          <GameStage
            game={game}
            status={status}
            currentSession={currentSession}
            onStart={handleStart}
            onScoreChange={handleScore}
            onEnd={handleEnd}
          />
        </div>

        <div className="p-4 border-t border-surface-border bg-surface-overlay/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-deck-500">
            <span>
              Players: {game.players.min} - {game.players.max}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-deck-400 font-medium">Multiplayer</span>
            <Badge variant="warning" size="sm">
              Coming Soon
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
