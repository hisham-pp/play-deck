'use client';

import { LogOut, RefreshCw, Trophy } from 'lucide-react';
import { Button, Card, CardContent } from '@playdeck/ui';
import type { SnakeLadderGameState, SnakeLadderPlayer } from '../types/snake-and-ladder.types';
import { seatColorTheme } from '../utils/snake-ladder-colors';

interface SnakeLadderGameOverProps {
  state: SnakeLadderGameState;
  seats: SnakeLadderPlayer[];
  /** Guests cannot restart an online match; only the host can. */
  canRestart: boolean;
  onRestart: () => void;
  onExit: () => void;
}

export function SnakeLadderGameOver({
  state,
  seats,
  canRestart,
  onRestart,
  onExit,
}: SnakeLadderGameOverProps) {
  // Finishers in order, then anyone still on the board by how far they got.
  const ranked = [...state.players].sort((a, b) => {
    if (a.finishRank && b.finishRank) return a.finishRank - b.finishRank;
    if (a.finishRank) return -1;
    if (b.finishRank) return 1;
    return b.position - a.position;
  });

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
            <h3 className="text-2xl font-black text-slate-100">Match complete</h3>
            <p className="mt-1 text-sm text-slate-400">Final standings</p>
          </div>

          <ol className="space-y-2 rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-left">
            {ranked.map((player, index) => {
              const seat = seats.find((s) => s.seatIndex === player.seatIndex);
              const theme = seatColorTheme(player.color);
              return (
                <li
                  key={player.playerId}
                  className="flex items-center justify-between gap-3 py-1 text-sm"
                >
                  <span className="font-bold text-amber-400">#{index + 1}</span>
                  <span className="min-w-0 flex-1 truncate text-slate-200">
                    <span aria-hidden="true" className="mr-1.5">
                      {theme.symbol}
                    </span>
                    {seat?.displayName ?? theme.label}
                  </span>
                  <span className="text-xs text-slate-400">
                    {player.finished ? 'Home' : `Square ${player.position}`}
                  </span>
                </li>
              );
            })}
          </ol>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onExit}>
              <LogOut className="mr-2 h-4 w-4" /> Exit
            </Button>
            {canRestart && (
              <Button
                className="flex-1 bg-amber-500 font-bold text-slate-950 hover:bg-amber-600"
                onClick={onRestart}
              >
                <RefreshCw className="mr-2 h-4 w-4" /> Play again
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
