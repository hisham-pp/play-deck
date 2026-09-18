import type {
  ColorThiefColor,
  ColorThiefGameState,
  ColorThiefSeat,
} from '../types/color-thief.types';
import { colorThiefReducer } from './color-thief-reducer';
import { createInitialColorThiefState } from './color-thief-state';

/** Shared fixtures for the engine suites — never imported by app code. */
export function seat(
  seatIndex: number,
  color: ColorThiefColor,
  id = `p${seatIndex}`,
): ColorThiefSeat {
  return {
    id,
    displayName: `Seat ${seatIndex + 1}`,
    type: 'human',
    color,
    seatIndex,
    status: 'connected',
    ready: true,
  };
}

export function startedState(
  seats: ColorThiefSeat[],
  columns = 4,
  rows = 4,
  totalRounds = 4,
): ColorThiefGameState {
  const initial = createInitialColorThiefState(seats, { columns, rows, totalRounds });
  return colorThiefReducer(initial, { type: 'START_GAME', playerId: seats[0].id });
}

/** Paints tiles directly, bypassing cost, so a suite can set up a position. */
export function withOwners(
  state: ColorThiefGameState,
  owners: Record<number, number | null>,
): ColorThiefGameState {
  return {
    ...state,
    board: state.board.map((tile) =>
      tile.index in owners ? { ...tile, owner: owners[tile.index] } : tile,
    ),
  };
}
