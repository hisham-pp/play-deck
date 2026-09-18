'use client';

import type { MoveAnimation } from '../../hooks/use-move-animation';
import type { SnakeLadderPlayer, SnakeLadderPlayerState } from '../../types/snake-and-ladder.types';
import { squareCenter, tokenOffset } from '../../utils/board-geometry';
import { seatColorTheme } from '../../utils/snake-ladder-colors';

const WALK_MS = 130;
const JUMP_MS = 520;

interface TokenLayerProps {
  players: SnakeLadderPlayerState[];
  seats: SnakeLadderPlayer[];
  animation: MoveAnimation;
  currentTurnSeatIndex: number;
}

/** Where each token should be drawn right now — the replay wins over the engine. */
function displaySquare(player: SnakeLadderPlayerState, animation: MoveAnimation): number {
  const isReplaying = animation.playerId === player.playerId && animation.square !== null;
  return isReplaying ? animation.square! : player.position;
}

export function TokenLayer({ players, seats, animation, currentTurnSeatIndex }: TokenLayerProps) {
  const onBoard = players.filter((player) => displaySquare(player, animation) >= 1);

  const crowding = new Map<number, string[]>();
  for (const player of onBoard) {
    const square = displaySquare(player, animation);
    crowding.set(square, [...(crowding.get(square) ?? []), player.playerId]);
  }

  return (
    <div className="pointer-events-none absolute inset-0">
      {onBoard.map((player) => {
        const square = displaySquare(player, animation);
        const sharing = crowding.get(square) ?? [player.playerId];
        const center = squareCenter(square);
        const offset = tokenOffset(sharing.indexOf(player.playerId), sharing.length);

        const theme = seatColorTheme(player.color);
        const seat = seats.find((s) => s.seatIndex === player.seatIndex);
        const isMoving = animation.playerId === player.playerId;
        const isOnTurn = player.seatIndex === currentTurnSeatIndex;

        return (
          <div
            key={player.playerId}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 text-[9px] font-black shadow-lg sm:text-xs"
            style={{
              left: `${center.x + offset.x}%`,
              top: `${center.y + offset.y}%`,
              width: '6%',
              height: '6%',
              background: theme.hex,
              borderColor: theme.rimHex,
              color: theme.rimHex,
              transitionProperty: 'left, top',
              transitionDuration: `${animation.phase === 'jumping' ? JUMP_MS : WALK_MS}ms`,
              transitionTimingFunction: animation.phase === 'jumping' ? 'ease-in-out' : 'linear',
              zIndex: isMoving ? 30 : 20,
              boxShadow: isOnTurn ? `0 0 0 2px rgba(251, 191, 36, 0.85)` : undefined,
            }}
            title={`${seat?.displayName ?? theme.label} — square ${square}`}
          >
            {theme.symbol}
          </div>
        );
      })}
    </div>
  );
}
