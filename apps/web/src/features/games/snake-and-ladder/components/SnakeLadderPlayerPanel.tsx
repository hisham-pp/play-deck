'use client';

import { Bot, Crown, Loader2 } from 'lucide-react';
import { FINAL_SQUARE } from '../engine/snake-ladder-constants';
import type { SnakeLadderGameState, SnakeLadderPlayer } from '../types/snake-and-ladder.types';
import { seatColorTheme } from '../utils/snake-ladder-colors';

interface SnakeLadderPlayerPanelProps {
  state: SnakeLadderGameState;
  seats: SnakeLadderPlayer[];
  /** Seat the local player occupies, so "You" is marked in online and solo play. */
  localSeatIndex?: number | null;
  botThinkingSeatIndex?: number | null;
}

export function SnakeLadderPlayerPanel({
  state,
  seats,
  localSeatIndex = null,
  botThinkingSeatIndex = null,
}: SnakeLadderPlayerPanelProps) {
  return (
    <ul className="flex flex-col gap-2" aria-label="Players">
      {state.players.map((player) => {
        const seat = seats.find((s) => s.seatIndex === player.seatIndex);
        const theme = seatColorTheme(player.color);
        const isOnTurn = player.seatIndex === state.currentTurnSeatIndex;
        const isThinking = player.seatIndex === botThinkingSeatIndex;

        return (
          <li
            key={player.playerId}
            aria-current={isOnTurn ? 'true' : undefined}
            className={`flex items-center gap-3 rounded-lg border px-3 py-2 transition-colors ${
              isOnTurn ? 'border-amber-500/70 bg-amber-500/10' : 'border-slate-800 bg-slate-900/70'
            }`}
          >
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-black"
              style={{ background: theme.hex, borderColor: theme.rimHex, color: theme.rimHex }}
              aria-hidden="true"
            >
              {theme.symbol}
            </span>

            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1.5 truncate text-sm font-semibold text-slate-100">
                {seat?.displayName ?? theme.label}
                {seat?.type === 'bot' && <Bot className="h-3.5 w-3.5 text-slate-500" />}
                {player.seatIndex === localSeatIndex && (
                  <span className="rounded bg-slate-800 px-1 text-[10px] font-bold uppercase text-slate-400">
                    You
                  </span>
                )}
              </span>
              <span className="block text-xs text-slate-400">
                {player.finished
                  ? `Finished #${player.finishRank}`
                  : `Square ${player.position} · ${FINAL_SQUARE - player.position} to go`}
              </span>
            </span>

            {player.finished && <Crown className="h-4 w-4 shrink-0 text-amber-400" />}
            {isThinking && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-slate-500" />}
          </li>
        );
      })}
    </ul>
  );
}
