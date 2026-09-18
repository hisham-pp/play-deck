'use client';

import { Bot, Flame, WifiOff } from 'lucide-react';
import type { ShadowTagStanding } from '../types/shadow-tag.types';

interface ShadowTagScoreboardProps {
  standings: ShadowTagStanding[];
  itId: string;
  localPlayerId: string | null;
  compact?: boolean;
}

/**
 * The only list of opponents in the game. It never says where anybody is —
 * only how well they are doing at not being found.
 */
export function ShadowTagScoreboard({
  standings,
  itId,
  localPlayerId,
  compact = false,
}: ShadowTagScoreboardProps) {
  return (
    <ul className={compact ? 'flex flex-col gap-1' : 'flex flex-col gap-2'}>
      {standings.map(({ seat, runner, rank }) => {
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
              {!runner.connected && (
                <WifiOff
                  className="h-3.5 w-3.5 shrink-0 text-slate-600"
                  aria-label="Disconnected"
                />
              )}
              {seat.id === itId && (
                <Flame className="h-3.5 w-3.5 shrink-0 text-rose-400" aria-label="Currently it" />
              )}
            </span>

            <span className="flex shrink-0 items-center gap-3 font-mono text-xs text-slate-400">
              <span title="Tags made">{runner.tags}T</span>
              <span className="text-sm font-bold text-slate-100">{Math.round(runner.score)}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
