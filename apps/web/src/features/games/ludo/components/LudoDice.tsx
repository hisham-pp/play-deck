'use client';

import { Dices } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@playdeck/ui';
import type { LudoGameState } from '../types/ludo.types';

interface LudoDiceProps {
  state: LudoGameState;
  isMyTurn: boolean;
  isSettling: boolean;
  onRollDice: () => void;
  /** How many pieces can legally move right now, i.e. how many hotkeys are live. */
  moveOptionCount?: number;
}

const TUMBLE_TICK_MS = 60;

export function LudoDice({
  state,
  isMyTurn,
  isSettling,
  onRollDice,
  moveOptionCount = 0,
}: LudoDiceProps) {
  const canRoll =
    isMyTurn && !isSettling && state.turnPhase === 'awaiting-roll' && state.status === 'playing';

  const settledValue = state.dice.value;
  const [tumblingFace, setTumblingFace] = useState<number | null>(null);

  // The readout shuffles for exactly as long as the physics die is in flight, so
  // the number here can never contradict the face the die comes to rest on.
  useEffect(() => {
    if (!isSettling) {
      setTumblingFace(null);
      return;
    }
    const ticker = setInterval(() => {
      setTumblingFace(Math.floor(Math.random() * 6) + 1);
    }, TUMBLE_TICK_MS);
    return () => clearInterval(ticker);
  }, [isSettling]);

  useEffect(() => {
    if (!canRoll) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key !== ' ' && e.key !== 'Spacebar' && e.key.toLowerCase() !== 'r') return;
      const el = document.activeElement;
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) return;
      e.preventDefault();
      onRollDice();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [canRoll, onRollDice]);

  const isTumbling = isSettling;
  const shownValue = isSettling ? (tumblingFace ?? settledValue) : settledValue;

  return (
    <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
      <div className="flex items-center gap-4">
        <div
          aria-live="polite"
          className={`w-16 h-16 rounded-xl bg-slate-950 border-2 flex items-center justify-center text-3xl font-black text-amber-400 shadow-inner ${
            isTumbling ? 'dice-tumble border-amber-400' : 'border-amber-500/40'
          }`}
        >
          {shownValue ?? '-'}
        </div>

        <Button
          size="lg"
          onClick={onRollDice}
          disabled={!canRoll}
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-6 py-6 text-lg shadow-lg disabled:opacity-50"
        >
          <Dices className={`w-6 h-6 mr-2 ${canRoll ? 'animate-bounce' : ''}`} />
          Roll Dice
        </Button>
      </div>

      <p className="text-xs text-slate-400 text-center">
        {state.turnPhase === 'awaiting-roll' && canRoll && (
          <>
            Press{' '}
            <kbd className="rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 font-sans text-[10px] font-bold text-slate-300">
              Space
            </kbd>{' '}
            or{' '}
            <kbd className="rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 font-sans text-[10px] font-bold text-slate-300">
              R
            </kbd>{' '}
            to roll
          </>
        )}
        {state.turnPhase === 'awaiting-move' &&
          (moveOptionCount > 0 ? (
            <>
              Press{' '}
              <kbd className="rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 font-sans text-[10px] font-bold text-slate-300">
                {moveOptionCount > 1 ? `1–${moveOptionCount}` : '1'}
              </kbd>{' '}
              or click the numbered piece
            </>
          ) : (
            'Select a glowing piece on the board to move.'
          ))}
        {state.turnPhase === 'turn-end' && 'Passing turn...'}
      </p>
    </div>
  );
}
