import type {
  ColorThiefGameState,
  ColorThiefScore,
  ColorThiefTile,
} from '../types/color-thief.types';
import {
  COST_ISOLATED,
  COST_NEUTRAL,
  COST_OPPONENT,
  COST_PER_DEFENDER,
  MAX_DEFENCE_SURCHARGE,
} from './color-thief-constants';
import {
  activeTilesOf,
  isFrozen,
  isOnGrid,
  largestRegionOf,
  neighborsOf,
  type GridSize,
} from './grid';

export function gridSizeOf(state: ColorThiefGameState): GridSize {
  return { columns: state.columns, rows: state.rows };
}

export function touchesTerritory(
  state: ColorThiefGameState,
  index: number,
  seatIndex: number,
): boolean {
  return neighborsOf(index, gridSizeOf(state)).some((neighbor) => {
    const tile = state.board[neighbor];
    return tile.owner === seatIndex && !isFrozen(tile, state.round);
  });
}

/** How many of the target's own neighbours the defender still holds and can use. */
export function defendersOf(state: ColorThiefGameState, tile: ColorThiefTile): number {
  if (tile.owner === null) return 0;
  return neighborsOf(tile.index, gridSizeOf(state)).filter((neighbor) => {
    const next = state.board[neighbor];
    return next.owner === tile.owner && !isFrozen(next, state.round);
  }).length;
}

export type ClaimRefusal = 'off-grid' | 'own-tile' | 'frozen' | 'too-expensive';

export interface ClaimQuote {
  index: number;
  cost: number;
  adjacent: boolean;
  defenders: number;
  /** Set when the claim is illegal or unaffordable; `cost` is still the price. */
  refusal: ClaimRefusal | null;
}

/**
 * Prices one claim. Paint that touches paint is cheap; paint flung across the
 * arena is not, and a tile ringed by its owner's own colour costs more again.
 * A seat with no territory yet pays the bare neutral price so it can open.
 */
export function quoteClaim(
  state: ColorThiefGameState,
  index: number,
  seatIndex: number,
): ClaimQuote {
  const size = gridSizeOf(state);
  if (!isOnGrid(index, size)) {
    return { index, cost: Infinity, adjacent: false, defenders: 0, refusal: 'off-grid' };
  }

  const tile = state.board[index];
  const defenders = defendersOf(state, tile);
  const adjacent = touchesTerritory(state, index, seatIndex);

  if (tile.owner === seatIndex) {
    return { index, cost: Infinity, adjacent, defenders, refusal: 'own-tile' };
  }
  if (isFrozen(tile, state.round)) {
    return { index, cost: Infinity, adjacent, defenders, refusal: 'frozen' };
  }

  const hasTerritory = activeTilesOf(state.board, seatIndex, state.round).length > 0;
  let cost = tile.owner === null ? COST_NEUTRAL : COST_OPPONENT;

  // The opening claim of a seat with nothing on the board is never "isolated";
  // charging for it would make the first turn strictly worse than the second.
  if (hasTerritory && !adjacent) cost += COST_ISOLATED;

  if (tile.owner !== null) {
    cost += Math.min(Math.max(defenders - 1, 0) * COST_PER_DEFENDER, MAX_DEFENCE_SURCHARGE);
  }

  const refusal = cost > state.paintRemaining ? 'too-expensive' : null;
  return { index, cost, adjacent, defenders, refusal };
}

export function canClaim(state: ColorThiefGameState, index: number, seatIndex: number): boolean {
  return quoteClaim(state, index, seatIndex).refusal === null;
}

/** Paints a tile without checking price — callers settle paint themselves. */
export function paintTile(
  board: ColorThiefTile[],
  index: number,
  owner: number | null,
  actionCount: number,
): ColorThiefTile[] {
  return board.map((tile) =>
    tile.index === index ? { ...tile, owner, claimedAtAction: actionCount } : tile,
  );
}

export function neutralTilesTouching(state: ColorThiefGameState, seatIndex: number): number[] {
  const size = gridSizeOf(state);
  const touching = new Set<number>();

  for (const tile of activeTilesOf(state.board, seatIndex, state.round)) {
    for (const neighbor of neighborsOf(tile.index, size)) {
      const candidate = state.board[neighbor];
      if (candidate.owner === null && !isFrozen(candidate, state.round)) {
        touching.add(neighbor);
      }
    }
  }

  return [...touching].sort((a, b) => a - b);
}

export function scoreboardOf(state: ColorThiefGameState): ColorThiefScore[] {
  const size = gridSizeOf(state);

  return state.players
    .map((player) => ({
      seatIndex: player.seatIndex,
      playerId: player.playerId,
      tiles: activeTilesOf(state.board, player.seatIndex, state.round).length,
      frozenTiles: state.board.filter(
        (tile) => tile.owner === player.seatIndex && isFrozen(tile, state.round),
      ).length,
      largestRegion: largestRegionOf(state.board, player.seatIndex, size, state.round),
    }))
    .sort(
      (a, b) => b.tiles - a.tiles || b.largestRegion - a.largestRegion || a.seatIndex - b.seatIndex,
    );
}

/**
 * Everyone tied at the top. Territory decides it; a solid wall breaks a tie on
 * tile count, and a genuine dead heat is reported as a shared win.
 */
export function winnersOf(state: ColorThiefGameState): string[] {
  const ranked = scoreboardOf(state);
  const leader = ranked[0];
  if (!leader) return [];

  return ranked
    .filter((entry) => entry.tiles === leader.tiles && entry.largestRegion === leader.largestRegion)
    .map((entry) => entry.playerId);
}
