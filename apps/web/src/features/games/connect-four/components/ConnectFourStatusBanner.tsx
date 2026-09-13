'use client';

import { Bot, Trophy } from 'lucide-react';
import React from 'react';
import {
  DISC_RED,
  STATUS_DRAW,
  STATUS_PLAYING,
  STATUS_WON,
} from '../engine/connect-four-constants';
import type { ConnectFourState } from '../types/connect-four.types';

export interface ConnectFourStatusBannerProps {
  state: ConnectFourState;
  p1Name: string;
  p2Name: string;
  isP1Turn: boolean;
}

export function ConnectFourStatusBanner({
  state,
  p1Name,
  p2Name,
  isP1Turn,
}: ConnectFourStatusBannerProps) {
  if (state.status === STATUS_WON && state.winner) {
    const winnerName = state.winner === DISC_RED ? p1Name : p2Name;
    return (
      <div className="w-full flex items-center justify-center">
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-amber-500/20 border border-amber-500/50 shadow-arcade text-amber-400 text-xs sm:text-sm font-bold animate-in fade-in zoom-in-95 duration-200">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>
            Connect Four! {winnerName} Wins Round {state.round}!
          </span>
        </div>
      </div>
    );
  }

  if (state.status === STATUS_DRAW) {
    return (
      <div className="w-full flex items-center justify-center">
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-500/20 border border-blue-500/50 shadow-arcade text-blue-400 text-xs sm:text-sm font-bold animate-in fade-in zoom-in-95 duration-200">
          <span>Board Full — Match Ended in a Draw!</span>
        </div>
      </div>
    );
  }

  if (state.status === STATUS_PLAYING) {
    return (
      <div className="w-full flex items-center justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-raised border border-surface-border shadow-sm text-xs sm:text-sm">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isP1Turn ? 'bg-rose-500 animate-ping' : 'bg-amber-400 animate-ping'
            }`}
          />
          <span className="font-semibold text-deck-800 dark:text-deck-200 font-display tracking-wide flex items-center gap-1.5">
            {state.isAiThinking ? (
              <>
                <Bot className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                <span>Deck AI is calculating move...</span>
              </>
            ) : isP1Turn ? (
              `${p1Name}'s Turn (Red)`
            ) : (
              `${p2Name}'s Turn (Yellow)`
            )}
          </span>
        </div>
      </div>
    );
  }

  return null;
}
