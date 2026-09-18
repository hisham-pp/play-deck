'use client';

import { Dices } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { Button } from '@playdeck/ui';
import type { SnakeLadderGameState } from '../types/snake-and-ladder.types';
import { isPlainKeypress, isTypingTarget } from '../utils/keyboard';

interface SnakeLadderDiceProps {
  state: SnakeLadderGameState;
  canRoll: boolean;
  isAnimating: boolean;
  onRollDice: () => void;
  /** Reason the roll button is disabled, shown under the die. */
  waitingFor?: string | null;
}

const TUMBLE_TICK_MS = 60;
const ROLL_KEYS = new Set([' ', 'Spacebar', 'r', 'R']);
const DIE_FACES = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

function isRollKey(event: KeyboardEvent): boolean {
  return isPlainKeypress(event) && ROLL_KEYS.has(event.key) && !isTypingTarget();
}

function Key({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 font-sans text-[10px] font-bold text-slate-300">
      {children}
    </kbd>
  );
}

export function SnakeLadderDice({
  state,
  canRoll,
  isAnimating,
  onRollDice,
  waitingFor,
}: SnakeLadderDiceProps) {
  const [tumblingFace, setTumblingFace] = useState<number | null>(null);

  // The face shuffles only while a move is replaying, so the readout can never
  // contradict the value the engine has already settled on.
  useEffect(() => {
    if (!isAnimating) {
      setTumblingFace(null);
      return;
    }
    const ticker = setInterval(() => {
      setTumblingFace(Math.floor(Math.random() * 6) + 1);
    }, TUMBLE_TICK_MS);
    return () => clearInterval(ticker);
  }, [isAnimating]);

  useEffect(() => {
    if (!canRoll) return;
    const onKey = (event: KeyboardEvent) => {
      if (!isRollKey(event)) return;
      event.preventDefault();
      onRollDice();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [canRoll, onRollDice]);

  const shownValue = isAnimating ? (tumblingFace ?? state.dice.value) : state.dice.value;

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/80 p-4">
      <div className="flex items-center gap-4">
        <div
          aria-live="polite"
          aria-label={shownValue ? `Dice shows ${shownValue}` : 'Dice not rolled yet'}
          className={`flex h-16 w-16 items-center justify-center rounded-xl border-2 bg-slate-950 text-4xl leading-none text-amber-400 shadow-inner ${
            isAnimating ? 'dice-tumble border-amber-400' : 'border-amber-500/40'
          }`}
        >
          <span aria-hidden="true">{shownValue ? DIE_FACES[shownValue] : '—'}</span>
        </div>

        <Button
          size="lg"
          onClick={onRollDice}
          disabled={!canRoll}
          aria-label="Roll the dice"
          className="min-h-[56px] bg-amber-500 px-6 py-6 text-lg font-black text-slate-950 shadow-lg hover:bg-amber-600 disabled:opacity-50"
        >
          <Dices className={`mr-2 h-6 w-6 ${canRoll ? 'animate-bounce' : ''}`} />
          Roll Dice
        </Button>
      </div>

      <p className="min-h-[16px] text-center text-xs text-slate-400">
        {canRoll ? (
          <>
            Press <Key>Space</Key> or <Key>R</Key> to roll
          </>
        ) : (
          (waitingFor ?? state.lastMoveNote ?? '')
        )}
      </p>
    </div>
  );
}
