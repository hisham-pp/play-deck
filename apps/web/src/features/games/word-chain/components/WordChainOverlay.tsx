'use client';

import { Play, RotateCcw, Settings2, Trophy } from 'lucide-react';
import React from 'react';
import { Button } from '@playdeck/ui';
import type { WordChainState } from '../types/word-chain.types';

export interface WordChainOverlayProps {
  state: WordChainState;
  countdown: number;
  onResume: () => void;
  onPlayAgain: () => void;
  onOpenSetup: () => void;
}

const PANEL =
  'absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 rounded-xl bg-surface-base/92 backdrop-blur-sm text-center px-6';

function Results({
  state,
  onPlayAgain,
  onOpenSetup,
}: Omit<WordChainOverlayProps, 'countdown' | 'onResume'>) {
  const ranked = [...state.players].sort((a, b) => b.score - a.score);

  return (
    <div className={PANEL} role="status">
      <Trophy className="w-10 h-10 text-amber-500" />
      <h2 className="font-display text-2xl font-black text-deck-950 dark:text-white">
        {state.message}
      </h2>

      <ol className="w-full max-w-xs flex flex-col gap-1">
        {ranked.map((player) => (
          <li
            key={player.id}
            className="flex items-center justify-between rounded-lg border border-surface-border bg-surface-raised px-3 py-1.5 text-xs"
          >
            <span className="font-bold text-deck-900 dark:text-white truncate">{player.name}</span>
            <span className="font-mono font-bold text-amber-500">{player.score}</span>
          </li>
        ))}
      </ol>

      <p className="text-xs text-deck-500">
        {state.chain.length} {state.chain.length === 1 ? 'word' : 'words'} in the chain
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button variant="arcade" onClick={onPlayAgain}>
          <RotateCcw className="w-4 h-4" />
          Play again
        </Button>
        <Button variant="outline" onClick={onOpenSetup}>
          <Settings2 className="w-4 h-4" />
          Change rules
        </Button>
      </div>
    </div>
  );
}

export function WordChainOverlay({
  state,
  countdown,
  onResume,
  onPlayAgain,
  onOpenSetup,
}: WordChainOverlayProps) {
  if (state.status === 'countdown') {
    return (
      <div className={PANEL} role="status" aria-live="assertive">
        <span className="text-[10px] font-bold uppercase tracking-widest text-deck-500 font-display">
          Get ready
        </span>
        <span className="font-display text-7xl font-black text-amber-500 leading-none tabular-nums">
          {Math.max(1, countdown)}
        </span>
        <p className="text-xs text-deck-500">{state.message}</p>
      </div>
    );
  }

  if (state.status === 'paused') {
    return (
      <div className={PANEL} role="status">
        <h2 className="font-display text-2xl font-black text-deck-950 dark:text-white">Paused</h2>
        <p className="text-xs text-deck-500">The chain is waiting — nobody loses a life.</p>
        <Button variant="arcade" onClick={onResume}>
          <Play className="w-4 h-4" />
          Resume
        </Button>
      </div>
    );
  }

  if (state.status === 'finished') {
    return <Results state={state} onPlayAgain={onPlayAgain} onOpenSetup={onOpenSetup} />;
  }

  return null;
}
