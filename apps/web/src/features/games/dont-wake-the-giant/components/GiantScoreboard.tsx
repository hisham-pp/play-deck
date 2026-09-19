'use client';

import { Bot, DoorOpen, Volume2, WifiOff } from 'lucide-react';
import { haulOf } from '../engine/scoring';
import type { GiantStanding } from '../types/giant.types';

interface GiantScoreboardProps {
  standings: GiantStanding[];
  localPlayerId: string | null;
  /** Shows how much noise each thief has personally put into the meter. */
  showNoise?: boolean;
}

/**
 * The crew. Nobody beats anybody here — the ranking is bragging rights over a
 * shared outcome, so the row that matters most is the quiet one with the
 * biggest haul.
 */
export function GiantScoreboard({
  standings,
  localPlayerId,
  showNoise = false,
}: GiantScoreboardProps) {
  return (
    <ul className="flex flex-col gap-2">
      {standings.map(({ seat, thief, rank }) => {
        const isLocal = seat.id === localPlayerId;
        return (
          <li
            key={seat.id}
            className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 ${
              isLocal ? 'border-amber-500/40 bg-amber-500/5' : 'border-slate-800 bg-slate-950/50'
            }`}
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <span className="w-4 shrink-0 text-center font-mono text-xs text-slate-500">
                {rank}
              </span>
              <span
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ background: seat.color }}
                aria-hidden="true"
              />
              <span className="min-w-0 truncate text-sm font-semibold text-slate-200">
                {seat.displayName}
                {isLocal && <span className="ml-1.5 text-[10px] text-amber-400">YOU</span>}
              </span>
              {seat.type === 'bot' && (
                <Bot className="h-3.5 w-3.5 shrink-0 text-slate-500" aria-label="Bot" />
              )}
              {!thief.connected && (
                <WifiOff
                  className="h-3.5 w-3.5 shrink-0 text-slate-600"
                  aria-label="Disconnected"
                />
              )}
              {thief.escaped && (
                <DoorOpen className="h-3.5 w-3.5 shrink-0 text-emerald-400" aria-label="Out" />
              )}
            </span>

            <span className="flex shrink-0 items-center gap-3 font-mono text-xs text-slate-400">
              {showNoise && (
                <span className="flex items-center gap-1" title="Noise added to the meter">
                  <Volume2 className="h-3 w-3" aria-hidden="true" />
                  {Math.round(thief.noiseMade)}
                </span>
              )}
              <span className="text-sm font-bold text-slate-100" title="Loot banked and carried">
                {haulOf(thief)}
              </span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
