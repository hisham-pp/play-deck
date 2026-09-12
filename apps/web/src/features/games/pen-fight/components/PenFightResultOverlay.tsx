'use client';

import { ArrowRight, RotateCcw, Trophy } from 'lucide-react';
import React from 'react';
import { Button } from '@playdeck/ui';
import type { PenFightState } from '../types/pen-fight.types';

interface PenFightResultOverlayProps {
  state: PenFightState;
  onNextRound: () => void;
  onRematch: () => void;
  onOpenSetup: () => void;
}

export function PenFightResultOverlay({
  state,
  onNextRound,
  onRematch,
  onOpenSetup,
}: PenFightResultOverlayProps) {
  if (state.phase !== 'round-over' && state.phase !== 'match-over') return null;

  const isMatchOver = state.phase === 'match-over';
  const outcome = isMatchOver ? state.matchWinner : state.roundWinner;
  const isDraw = outcome === 'draw';
  const winnerPlayer = !isDraw && outcome ? state.players[outcome] : null;

  return (
    <div className="pointer-events-auto absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="mx-4 flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl border border-surface-border bg-surface-raised p-6 text-center shadow-arcade">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full border-4"
          style={{
            borderColor: winnerPlayer?.color ?? '#64748b',
            backgroundColor: winnerPlayer ? `${winnerPlayer.color}22` : 'transparent',
          }}
        >
          <Trophy className="h-7 w-7" style={{ color: winnerPlayer?.color ?? '#94a3b8' }} />
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-amber-500 font-display">
            {isMatchOver ? 'Match Over' : `Round ${state.round} Result`}
          </p>
          <h2 className="mt-1 text-xl font-black text-deck-950 dark:text-white font-display">
            {isDraw
              ? "It's a draw!"
              : `${winnerPlayer?.displayName} wins${isMatchOver ? ' the match!' : ' the round!'}`}
          </h2>
        </div>

        <div className="flex items-center gap-4 text-sm font-bold">
          <span style={{ color: state.players.p1.color }}>
            {state.players.p1.displayName}: {state.players.p1.roundWins}
          </span>
          <span className="text-deck-500">—</span>
          <span style={{ color: state.players.p2.color }}>
            {state.players.p2.displayName}: {state.players.p2.roundWins}
          </span>
        </div>

        <div className="flex w-full flex-col gap-2">
          {isMatchOver ? (
            <Button
              type="button"
              variant="primary"
              onClick={onRematch}
              className="w-full gap-2 font-bold"
            >
              <RotateCcw className="h-4 w-4" />
              Rematch
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              onClick={onNextRound}
              className="w-full gap-2 font-bold"
            >
              Next Round
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
          <Button
            type="button"
            variant="secondary"
            onClick={onOpenSetup}
            className="w-full font-semibold"
          >
            Change Setup
          </Button>
        </div>
      </div>
    </div>
  );
}
