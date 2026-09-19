'use client';

import { LogOut, RotateCcw, Skull, Trophy } from 'lucide-react';
import { Button, Modal } from '@playdeck/ui';
import { PHASE_WOKEN } from '../engine/giant-constants';
import type { GiantPhase, GiantSeat, GiantStanding } from '../types/giant.types';
import { GiantScoreboard } from './GiantScoreboard';

interface GiantRoundOverProps {
  phase: GiantPhase;
  standings: GiantStanding[];
  bankedTotal: number;
  peakNoise: number;
  loudest: GiantSeat | null;
  localPlayerId: string | null;
  canRematch: boolean;
  onRematch: () => void;
  onExit: () => void;
}

export function GiantRoundOver({
  phase,
  standings,
  bankedTotal,
  peakNoise,
  loudest,
  localPlayerId,
  canRematch,
  onRematch,
  onExit,
}: GiantRoundOverProps) {
  const woken = phase === PHASE_WOKEN;
  const localRow = standings.find((row) => row.seat.id === localPlayerId);

  return (
    <Modal isOpen onClose={onExit} title={woken ? 'He woke up' : 'Out through the door'} size="md">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col items-center gap-1 text-center">
          {woken ? (
            <Skull className="h-8 w-8 text-rose-400" aria-hidden="true" />
          ) : (
            <Trophy className="h-8 w-8 text-amber-400" aria-hidden="true" />
          )}
          <p className="font-display text-xl font-black text-white">
            {woken
              ? 'The giant opened his eyes. Nobody gets out.'
              : `The crew carried out ${bankedTotal} in loot.`}
          </p>
          <p className="text-xs text-slate-400">
            {woken
              ? 'Everything anyone was carrying stays in the chamber.'
              : `Loudest moment of the heist: ${Math.round(peakNoise)} per cent.`}
          </p>
          {loudest && (
            <p className="text-[11px] text-slate-500">
              {loudest.displayName} made the most noise getting it done.
            </p>
          )}
          {localRow && !woken && (
            <p className="mt-1 text-xs text-slate-400">
              You brought out {localRow.thief.banked} of it.
            </p>
          )}
        </div>

        <GiantScoreboard standings={standings} localPlayerId={localPlayerId} showNoise />

        <div className="flex flex-wrap items-center justify-center gap-2">
          {canRematch && (
            <Button onClick={onRematch}>
              <RotateCcw className="mr-1.5 h-4 w-4" aria-hidden="true" /> Try again
            </Button>
          )}
          <Button variant="outline" onClick={onExit}>
            <LogOut className="mr-1.5 h-4 w-4" aria-hidden="true" /> Leave the chamber
          </Button>
        </div>

        {!canRematch && (
          <p className="text-center text-xs text-slate-500">
            Waiting for the host to set up the next heist…
          </p>
        )}
      </div>
    </Modal>
  );
}
