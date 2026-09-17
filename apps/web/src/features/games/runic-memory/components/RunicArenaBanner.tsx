'use client';

import React from 'react';
import { PLAYER_1, STATUS_COMPLETED, STATUS_PLAYING } from '../engine/runic-memory-constants';
import type { RunicGameState } from '../types/runic-memory.types';

interface RunicArenaBannerProps {
  state: RunicGameState;
  isMultiplayer: boolean;
  isMyTurnOnline: boolean;
  player1Name: string;
  player2Name: string;
  roomCode?: string | null;
}

function resolveBannerText(
  state: RunicGameState,
  isMultiplayer: boolean,
  isMyTurnOnline: boolean,
  p1Name: string,
  p2Name: string,
): string {
  if (state.status === STATUS_COMPLETED) return 'Board Cleared!';
  if (state.status !== STATUS_PLAYING) return 'Flip a Rune to Begin';

  if (isMultiplayer) {
    return isMyTurnOnline ? 'Your Turn to Flip Runes' : "Challenger's Turn";
  }
  return state.turn === PLAYER_1 ? `${p1Name}'s Turn` : `${p2Name}'s Turn`;
}

export function RunicArenaBanner({
  state,
  isMultiplayer,
  isMyTurnOnline,
  player1Name,
  player2Name,
  roomCode,
}: RunicArenaBannerProps) {
  const bannerText = resolveBannerText(
    state,
    isMultiplayer,
    isMyTurnOnline,
    player1Name,
    player2Name,
  );

  const dotClass =
    state.status === STATUS_COMPLETED
      ? 'bg-emerald-400'
      : state.status === STATUS_PLAYING
        ? 'bg-amber-400 animate-pulse'
        : 'bg-deck-600';

  return (
    <div className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-surface-raised border border-surface-border text-xs">
      <div className="flex items-center gap-2">
        <span className={`w-2.5 h-2.5 rounded-full ${dotClass}`} />
        <span className="font-semibold text-deck-200">{bannerText}</span>
      </div>

      <div className="flex items-center gap-2 font-mono text-deck-400">
        {roomCode && (
          <span className="text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
            ROOM: {roomCode}
          </span>
        )}
        <span>
          Pairs: {state.matches} / {state.board.length / 2}
        </span>
      </div>
    </div>
  );
}
