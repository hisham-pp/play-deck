'use client';

import { Bot } from 'lucide-react';
import type { Card, UnoPlayer } from '../types/uno-cards.types';
import { UnoCardView } from './UnoCardView';

interface UnoOpponentsProps {
  players: UnoPlayer[];
  currentTurnIndex: number;
  topDiscard: Card;
}

export function UnoOpponents({ players, currentTurnIndex, topDiscard }: UnoOpponentsProps) {
  return (
    <div className="flex w-full items-start justify-around gap-2 pb-4">
      {players.slice(1).map((bot, idx) => {
        const isTurn = currentTurnIndex === idx + 1;
        return (
          <div
            key={bot.id}
            className={`flex flex-col items-center rounded-2xl border p-2.5 transition-all duration-200 ${
              isTurn
                ? 'border-amber-400 bg-amber-950/20 shadow-lg shadow-amber-500/20 scale-105 ring-2 ring-amber-400'
                : 'border-slate-800 bg-slate-900/40 opacity-80'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
              <Bot className="h-3.5 w-3.5 text-slate-400" />
              <span>{bot.name}</span>
            </div>

            <div className="mt-2 flex -space-x-4">
              {bot.hand.map((_, cIdx) => (
                <div key={cIdx} className="scale-75 origin-top">
                  <UnoCardView card={topDiscard} isFaceDown size="sm" />
                </div>
              ))}
            </div>

            <div className="mt-1 flex items-center gap-1.5">
              <span className="font-mono text-xs font-bold text-amber-400">
                {bot.hand.length} {bot.hand.length === 1 ? 'card' : 'cards'}
              </span>
              {bot.hand.length === 1 && (
                <span className="rounded bg-rose-500/30 px-1 py-0.2 text-[9px] font-black uppercase text-rose-300 animate-bounce">
                  1 Left!
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
