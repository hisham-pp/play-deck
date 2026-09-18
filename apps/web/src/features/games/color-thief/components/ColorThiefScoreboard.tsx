'use client';

import { Bot, WifiOff } from 'lucide-react';
import React from 'react';
import { cn } from '@/lib/utils';
import { ABILITIES } from '../engine/color-thief-constants';
import type {
  ColorThiefGameState,
  ColorThiefScore,
  ColorThiefSeat,
} from '../types/color-thief.types';
import { paintTheme } from '../utils/color-thief-colors';

export interface ColorThiefScoreboardProps {
  state: ColorThiefGameState;
  seats: ColorThiefSeat[];
  scores: ColorThiefScore[];
  thinkingSeatIndex: number | null;
  localPlayerId: string | null;
}

/**
 * The standings, and the only place the table learns what a colour does. An
 * ability shows as "Unknown" until its owner has fired it once — that reveal is
 * the whole reason to talk before you paint.
 */
export function ColorThiefScoreboard({
  state,
  seats,
  scores,
  thinkingSeatIndex,
  localPlayerId,
}: ColorThiefScoreboardProps) {
  return (
    <ul className="flex w-full flex-col gap-1.5" aria-label="Territory standings">
      {scores.map((score) => {
        const seat = seats.find((s) => s.seatIndex === score.seatIndex);
        const player = state.players.find((p) => p.seatIndex === score.seatIndex);
        if (!seat || !player) return null;

        const theme = paintTheme(seat.color);
        const ability = ABILITIES[player.ability];
        const isYou = seat.id === localPlayerId;
        const onTurn = state.currentTurnSeatIndex === seat.seatIndex;
        // Your own colour is never a secret from you.
        const abilityKnown = player.abilityRevealed || isYou;

        return (
          <li
            key={seat.id}
            className={cn(
              'flex items-center gap-3 rounded-lg border px-3 py-2',
              onTurn ? 'border-amber-500/60 bg-amber-500/10' : 'border-slate-800 bg-slate-950/60',
            )}
          >
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border-2 text-xs font-black"
              style={{ background: theme.hex, borderColor: theme.rimHex, color: theme.rimHex }}
              aria-hidden="true"
            >
              {theme.glyph}
            </span>

            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1.5">
                <span className="truncate text-sm font-semibold text-slate-200">
                  {seat.displayName}
                </span>
                {isYou && <span className="text-[10px] font-bold text-amber-400">YOU</span>}
                {seat.type === 'bot' && <Bot className="h-3 w-3 text-slate-500" />}
                {seat.status === 'disconnected' && (
                  <WifiOff className="h-3 w-3 text-rose-400" aria-label="Disconnected" />
                )}
              </span>
              <span className="block truncate text-[11px] text-slate-500">
                {theme.label} · {abilityKnown ? ability.name : 'Ability unknown'}
                {player.blockadedTurns > 0 && ' · blockaded'}
              </span>
            </span>

            <span className="shrink-0 text-right">
              <span className="block font-mono text-base font-black text-slate-100">
                {score.tiles}
              </span>
              <span className="block text-[10px] uppercase tracking-wide text-slate-500">
                {score.frozenTiles > 0 ? `+${score.frozenTiles} frozen` : 'tiles'}
              </span>
            </span>

            {thinkingSeatIndex === seat.seatIndex && (
              <span className="text-[10px] font-semibold text-amber-400">…</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
