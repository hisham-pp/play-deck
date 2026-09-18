'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { MoveAnimation } from '../hooks/use-move-animation';
import type { SnakeLadderGameState, SnakeLadderPlayer } from '../types/snake-and-ladder.types';
import { SnakeLadderBoard } from './SnakeLadderBoard';
import { SnakeLadderControls } from './SnakeLadderControls';
import { SnakeLadderDice } from './SnakeLadderDice';
import { SnakeLadderPlayerPanel } from './SnakeLadderPlayerPanel';

interface SnakeLadderArenaProps {
  state: SnakeLadderGameState;
  seats: SnakeLadderPlayer[];
  animation: MoveAnimation;
  canRoll: boolean;
  waitingFor: string | null;
  localSeatIndex: number | null;
  thinkingSeatIndex: number | null;
  canPause: boolean;
  onRollDice: () => void;
  onPause: () => void;
  onResume: () => void;
  onRestart: () => void;
  onLeave: () => void;
}

export function SnakeLadderArena({
  state,
  seats,
  animation,
  canRoll,
  waitingFor,
  localSeatIndex,
  thinkingSeatIndex,
  canPause,
  onRollDice,
  onPause,
  onResume,
  onRestart,
  onLeave,
}: SnakeLadderArenaProps) {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-4">
      <Link
        href="/games"
        className="inline-flex items-center gap-2 text-xs font-medium text-deck-500 transition-colors hover:text-deck-900 dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to games</span>
      </Link>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="mx-auto w-full max-w-[560px] lg:max-w-none">
          <SnakeLadderBoard state={state} seats={seats} animation={animation} />
        </div>

        <div className="flex flex-col gap-4">
          <SnakeLadderPlayerPanel
            state={state}
            seats={seats}
            localSeatIndex={localSeatIndex}
            botThinkingSeatIndex={thinkingSeatIndex}
          />

          <SnakeLadderDice
            state={state}
            canRoll={canRoll}
            isAnimating={animation.isAnimating}
            onRollDice={onRollDice}
            waitingFor={waitingFor}
          />

          <SnakeLadderControls
            state={state}
            canPause={canPause}
            onPause={onPause}
            onResume={onResume}
            onRestart={onRestart}
            onLeave={onLeave}
          />
        </div>
      </div>
    </div>
  );
}
