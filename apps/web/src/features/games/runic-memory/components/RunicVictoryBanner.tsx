'use client';

import { Trophy } from 'lucide-react';
import React from 'react';
import { Button } from '@playdeck/ui';
import { MODE_SOLO, PLAYER_1 } from '../engine/runic-memory-constants';
import type { RunicGameState } from '../types/runic-memory.types';

interface RunicVictoryBannerProps {
  state: RunicGameState;
  player1Name: string;
  player2Name: string;
  onResetRound: () => void;
  onOpenSetup: () => void;
}

const BTN_TYPE = 'button';

function resolveVictoryHeading(state: RunicGameState, p1Name: string, p2Name: string): string {
  if (state.mode === MODE_SOLO) return 'Sacred Sigils Cleared!';
  if (state.winner === 'tie') return 'Deadlock Draw of the Ancients!';
  return state.winner === PLAYER_1 ? `${p1Name} Wins the Duel!` : `${p2Name} Wins the Duel!`;
}

export function RunicVictoryBanner({
  state,
  player1Name,
  player2Name,
  onResetRound,
  onOpenSetup,
}: RunicVictoryBannerProps) {
  const heading = resolveVictoryHeading(state, player1Name, player2Name);

  return (
    <div className="w-full p-4 rounded-xl bg-gradient-to-r from-purple-950/60 via-amber-950/40 to-purple-950/60 border border-amber-400/50 shadow-arcade flex flex-col items-center text-center gap-3 animate-fade-in">
      <div className="flex items-center gap-2 text-amber-400">
        <Trophy className="w-6 h-6 animate-bounce" />
        <h3 className="text-xl font-black font-display tracking-tight text-white">{heading}</h3>
      </div>
      <p className="text-xs text-deck-300 max-w-md">
        Board completed in <span className="font-bold text-amber-400">{state.moves}</span> turns (
        {state.elapsedSeconds} seconds) with a maximum combo streak of{' '}
        <span className="font-bold text-orange-400">×{state.maxCombo}</span>.
      </p>
      <div className="flex items-center gap-2">
        <Button type={BTN_TYPE} variant="primary" size="sm" onClick={onResetRound}>
          Play Again
        </Button>
        <Button type={BTN_TYPE} variant="outline" size="sm" onClick={onOpenSetup}>
          Change Configuration
        </Button>
      </div>
    </div>
  );
}
