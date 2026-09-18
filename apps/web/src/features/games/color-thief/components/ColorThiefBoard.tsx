'use client';

import React, { useMemo, type KeyboardEvent } from 'react';
import { quoteClaim } from '../engine/territory';
import type { ColorThiefGameState, ColorThiefSeat } from '../types/color-thief.types';
import { paintTheme } from '../utils/color-thief-colors';
import { ColorThiefTile } from './ColorThiefTile';

export interface ColorThiefBoardProps {
  state: ColorThiefGameState;
  seats: ColorThiefSeat[];
  /** The seat whose prices and legality the board is drawn for. */
  actingSeatIndex: number | null;
  /** True while the player is aiming an ability rather than claiming. */
  isTargeting: boolean;
  selectedTargets: number[];
  focusedIndex: number;
  interactive: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  onSelectTile: (index: number) => void;
  onFocusTile: (index: number) => void;
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
  registerTile: (index: number) => (node: HTMLButtonElement | null) => void;
}

function describeTile(
  state: ColorThiefGameState,
  seats: ColorThiefSeat[],
  index: number,
  cost: number | null,
  frozen: boolean,
): string {
  const column = (index % state.columns) + 1;
  const row = Math.floor(index / state.columns) + 1;
  const owner = state.board[index].owner;
  const seat = seats.find((s) => s.seatIndex === owner);

  const held = seat ? `held by ${seat.displayName}, ${paintTheme(seat.color).label}` : 'neutral';
  const frost = frozen ? ', frozen' : '';
  const price = cost === null ? ', cannot be claimed now' : `, costs ${cost} paint`;

  return `Row ${row}, column ${column}, ${held}${frost}${price}`;
}

/**
 * The arena. Rendered as a real `role="grid"` of buttons rather than a canvas,
 * so the board is reachable by keyboard and readable by a screen reader — each
 * tile announces its owner, its frost and what it would cost to take.
 */
export function ColorThiefBoard({
  state,
  seats,
  actingSeatIndex,
  isTargeting,
  selectedTargets,
  focusedIndex,
  interactive,
  highContrast,
  reducedMotion,
  onSelectTile,
  onFocusTile,
  onKeyDown,
  registerTile,
}: ColorThiefBoardProps) {
  const colorBySeat = useMemo(
    () => new Map(seats.map((seat) => [seat.seatIndex, seat.color])),
    [seats],
  );

  const rows = useMemo(
    () =>
      Array.from({ length: state.rows }, (_, row) =>
        Array.from({ length: state.columns }, (_, column) => row * state.columns + column),
      ),
    [state.rows, state.columns],
  );

  return (
    <div
      role="grid"
      aria-label={`Color Thief arena, ${state.columns} by ${state.rows} tiles`}
      aria-rowcount={state.rows}
      aria-colcount={state.columns}
      onKeyDown={onKeyDown}
      className="w-full rounded-xl border border-slate-800 bg-slate-950/80 p-2 shadow-inner"
      style={{ maxWidth: 'min(92vw, 34rem)' }}
    >
      {rows.map((indexes, row) => (
        <div
          key={row}
          role="row"
          className="grid gap-[2px] pb-[2px]"
          style={{ gridTemplateColumns: `repeat(${state.columns}, minmax(0, 1fr))` }}
        >
          {indexes.map((index) => {
            const tile = state.board[index];
            const frozen = tile.frozenUntilRound > state.round;
            const quote =
              actingSeatIndex === null ? null : quoteClaim(state, index, actingSeatIndex);
            const claimable = interactive && !isTargeting && quote?.refusal === null;
            const cost = quote && Number.isFinite(quote.cost) ? quote.cost : null;

            return (
              <ColorThiefTile
                key={index}
                index={index}
                color={tile.owner === null ? null : (colorBySeat.get(tile.owner) ?? null)}
                frozen={frozen}
                cost={cost}
                selectable={interactive && (isTargeting || Boolean(claimable))}
                selected={selectedTargets.includes(index)}
                isFocusTarget={index === focusedIndex}
                highContrast={highContrast}
                reducedMotion={reducedMotion}
                justClaimed={tile.claimedAtAction === state.actionCount && state.actionCount > 0}
                label={describeTile(state, seats, index, cost, frozen)}
                onSelect={onSelectTile}
                onFocus={onFocusTile}
                registerRef={registerTile(index)}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
