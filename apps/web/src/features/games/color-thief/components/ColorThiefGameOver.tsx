'use client';

import { LogOut, RefreshCw, Trophy } from 'lucide-react';
import React from 'react';
import { Button, Card, CardContent } from '@playdeck/ui';
import { ABILITIES } from '../engine/color-thief-constants';
import type {
  ColorThiefGameState,
  ColorThiefScore,
  ColorThiefSeat,
} from '../types/color-thief.types';
import { paintTheme } from '../utils/color-thief-colors';

export interface ColorThiefGameOverProps {
  state: ColorThiefGameState;
  seats: ColorThiefSeat[];
  scores: ColorThiefScore[];
  /** Guests cannot restart an online match; only the host can. */
  canRestart: boolean;
  onRestart: () => void;
  onExit: () => void;
}

export function ColorThiefGameOver({
  state,
  seats,
  scores,
  canRestart,
  onRestart,
  onExit,
}: ColorThiefGameOverProps) {
  const winners = state.winnerIds
    .map((id) => seats.find((seat) => seat.id === id)?.displayName ?? 'Someone')
    .join(' & ');

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Match complete"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-sm"
    >
      <Card className="w-full max-w-md border-amber-500/40 bg-slate-900 shadow-2xl">
        <CardContent className="space-y-6 p-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-amber-500 bg-amber-500/20 text-amber-400">
            <Trophy className="h-8 w-8" />
          </div>

          <div>
            <h3 className="text-2xl font-black text-slate-100">
              {state.winnerIds.length > 1 ? 'Shared arena' : `${winners} takes the arena`}
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              {state.winnerIds.length > 1
                ? `${winners} finish dead level.`
                : 'Final territory count'}
            </p>
          </div>

          <ol className="space-y-2 rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-left">
            {scores.map((score, rank) => {
              const seat = seats.find((s) => s.seatIndex === score.seatIndex);
              const player = state.players.find((p) => p.seatIndex === score.seatIndex);
              if (!seat || !player) return null;
              const theme = paintTheme(seat.color);

              return (
                <li
                  key={score.playerId}
                  className="flex items-center justify-between gap-3 py-1 text-sm"
                >
                  <span className="font-bold text-amber-400">#{rank + 1}</span>
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded border text-[10px] font-black"
                    style={{
                      background: theme.hex,
                      borderColor: theme.rimHex,
                      color: theme.rimHex,
                    }}
                    aria-hidden="true"
                  >
                    {theme.glyph}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-slate-200">
                    {seat.displayName}
                    {/* Every colour is public once the match is over. */}
                    <span className="ml-1 text-[11px] text-slate-500">
                      {ABILITIES[player.ability].name}
                    </span>
                  </span>
                  <span className="font-mono font-bold text-slate-100">{score.tiles}</span>
                </li>
              );
            })}
          </ol>

          <div className="flex gap-2">
            {canRestart && (
              <Button onClick={onRestart} className="flex-1">
                <RefreshCw className="mr-2 h-4 w-4" /> Play again
              </Button>
            )}
            <Button variant="outline" onClick={onExit} className="flex-1">
              <LogOut className="mr-2 h-4 w-4" /> Leave
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
