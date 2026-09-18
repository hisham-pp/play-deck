'use client';

import { LogOut, RotateCcw, Trophy } from 'lucide-react';
import { Button, Modal } from '@playdeck/ui';
import type { ShadowTagStanding } from '../types/shadow-tag.types';
import { ShadowTagScoreboard } from './ShadowTagScoreboard';

interface ShadowTagRoundOverProps {
  standings: ShadowTagStanding[];
  localPlayerId: string | null;
  canRematch: boolean;
  onRematch: () => void;
  onExit: () => void;
}

export function ShadowTagRoundOver({
  standings,
  localPlayerId,
  canRematch,
  onRematch,
  onExit,
}: ShadowTagRoundOverProps) {
  const winner = standings[0];
  const localRow = standings.find((row) => row.seat.id === localPlayerId);

  return (
    <Modal isOpen onClose={onExit} title="Lights up" size="md">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col items-center gap-1 text-center">
          <Trophy className="h-8 w-8 text-amber-400" aria-hidden="true" />
          <p className="font-display text-xl font-black text-white">
            {winner ? `${winner.seat.displayName} stayed hidden longest` : 'Round over'}
          </p>
          {localRow && (
            <p className="text-xs text-slate-400">
              You finished {ordinal(localRow.rank)} with {Math.round(localRow.runner.score)} points,{' '}
              {localRow.runner.tags} {localRow.runner.tags === 1 ? 'tag' : 'tags'} made and{' '}
              {Math.round(localRow.runner.bestEvasionMs / 1000)}s as your longest clean run.
            </p>
          )}
        </div>

        {/* The round is over, so nobody holds the mark any more. */}
        <ShadowTagScoreboard standings={standings} itId="" localPlayerId={localPlayerId} />

        <div className="flex flex-wrap items-center justify-center gap-2">
          {canRematch && (
            <Button onClick={onRematch}>
              <RotateCcw className="mr-1.5 h-4 w-4" aria-hidden="true" /> Rematch
            </Button>
          )}
          <Button variant="outline" onClick={onExit}>
            <LogOut className="mr-1.5 h-4 w-4" aria-hidden="true" /> Leave arena
          </Button>
        </div>

        {!canRematch && (
          <p className="text-center text-xs text-slate-500">
            Waiting for the host to start the next round…
          </p>
        )}
      </div>
    </Modal>
  );
}

function ordinal(rank: number): string {
  const suffix =
    rank % 100 >= 11 && rank % 100 <= 13 ? 'th' : (['th', 'st', 'nd', 'rd'][rank % 10] ?? 'th');
  return `${rank}${suffix}`;
}
