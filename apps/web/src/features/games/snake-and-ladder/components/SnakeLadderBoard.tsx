'use client';

import type { MoveAnimation } from '../hooks/use-move-animation';
import type { SnakeLadderGameState, SnakeLadderPlayer } from '../types/snake-and-ladder.types';
import { seatColorTheme } from '../utils/snake-ladder-colors';
import { BoardGrid } from './board/BoardGrid';
import { JumpsLayer } from './board/JumpsLayer';
import { TokenLayer } from './board/TokenLayer';

interface SnakeLadderBoardProps {
  state: SnakeLadderGameState;
  seats: SnakeLadderPlayer[];
  animation: MoveAnimation;
}

/** Tokens still waiting to enter the board, parked below it rather than on square 1. */
function StartPocket({
  state,
  seats,
}: {
  state: SnakeLadderGameState;
  seats: SnakeLadderPlayer[];
}) {
  const waiting = state.players.filter((player) => player.position === 0);
  if (waiting.length === 0) return null;

  return (
    <div className="mt-2 flex items-center justify-center gap-2 text-[10px] text-slate-500">
      <span className="uppercase tracking-wider">Start</span>
      {waiting.map((player) => {
        const theme = seatColorTheme(player.color);
        const seat = seats.find((s) => s.seatIndex === player.seatIndex);
        return (
          <span
            key={player.playerId}
            className="flex h-5 w-5 items-center justify-center rounded-full border-2 text-[9px] font-black"
            style={{ background: theme.hex, borderColor: theme.rimHex, color: theme.rimHex }}
            title={`${seat?.displayName ?? theme.label} has not entered the board`}
          >
            {theme.symbol}
          </span>
        );
      })}
    </div>
  );
}

export function SnakeLadderBoard({ state, seats, animation }: SnakeLadderBoardProps) {
  return (
    <div className="w-full">
      <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-950 shadow-2xl">
        <BoardGrid />
        <JumpsLayer />
        <TokenLayer
          players={state.players}
          seats={seats}
          animation={animation}
          currentTurnSeatIndex={state.currentTurnSeatIndex}
        />
      </div>

      <StartPocket state={state} seats={seats} />

      {/* The board is a picture; this is what a screen reader actually reads. */}
      <p className="sr-only" aria-live="polite">
        {state.players
          .map((player) => {
            const seat = seats.find((s) => s.seatIndex === player.seatIndex);
            const name = seat?.displayName ?? seatColorTheme(player.color).label;
            const where = player.position === 0 ? 'at the start' : `on square ${player.position}`;
            return `${name} ${where}.`;
          })
          .join(' ')}
        {state.lastMoveNote ? ` ${state.lastMoveNote}` : ''}
      </p>
    </div>
  );
}
