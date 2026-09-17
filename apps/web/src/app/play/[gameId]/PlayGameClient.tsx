'use client';

import { notFound } from 'next/navigation';
import React, { Suspense, useEffect, useState } from 'react';
import { GameDefinition } from '@playdeck/game-types';
import { GameAreaShell } from '@/components/game/GameAreaShell';
import { gameService } from '@/features/games/services/game-service';
import { JoinLinkGate } from '@/features/multiplayer/components/JoinLinkGate';

interface PlayGameClientProps {
  gameId: string;
}

export function PlayGameClient({ gameId }: PlayGameClientProps) {
  const [game, setGame] = useState<GameDefinition | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    gameService.findGame(gameId).then((found) => {
      setGame(found);
      setLoading(false);
    });
  }, [gameId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
        <span className="text-xs font-semibold text-deck-400 uppercase tracking-wider font-display">
          Initializing Session Stage...
        </span>
      </div>
    );
  }

  if (!game) {
    notFound();
  }

  // Search params are client-only; the gate reads `?room=` from a shared join link.
  return (
    <Suspense fallback={null}>
      <JoinLinkGate game={game}>
        <GameAreaShell game={game} />
      </JoinLinkGate>
    </Suspense>
  );
}
