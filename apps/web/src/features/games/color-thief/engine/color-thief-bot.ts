import type { ColorThiefGameState, ColorThiefPlayerState } from '../types/color-thief.types';
import { abilityOf, areTargetsValid, isAbilityReady } from './abilities';
import { BLEED_LIMIT } from './color-thief-constants';
import { isFrozen, neighborsOf } from './grid';
import { gridSizeOf, neutralTilesTouching, quoteClaim, scoreboardOf } from './territory';

export type ColorThiefBotMove =
  { kind: 'claim'; index: number } | { kind: 'ability'; targets: number[] } | { kind: 'end' };

const END_TURN: ColorThiefBotMove = { kind: 'end' };

function countNeighbors(
  state: ColorThiefGameState,
  index: number,
  predicate: (owner: number | null) => boolean,
): number {
  return neighborsOf(index, gridSizeOf(state)).filter((neighbor) => {
    const tile = state.board[neighbor];
    return !isFrozen(tile, state.round) && predicate(tile.owner);
  }).length;
}

/**
 * Paint bought per point spent, nudged towards tiles that thicken the bot's own
 * wall and towards tiles torn off whoever is winning.
 */
function rateClaim(state: ColorThiefGameState, index: number, seatIndex: number): number {
  const quote = quoteClaim(state, index, seatIndex);
  if (quote.refusal !== null) return -Infinity;

  const tile = state.board[index];
  const mine = countNeighbors(state, index, (owner) => owner === seatIndex);
  const theirs = countNeighbors(state, index, (owner) => owner !== null && owner !== seatIndex);
  const steal = tile.owner !== null ? 3 : 0;

  return 10 / quote.cost + mine * 2 + theirs + steal;
}

function bestClaim(state: ColorThiefGameState, seatIndex: number): ColorThiefBotMove | null {
  let best = -Infinity;
  let chosen: number | null = null;

  for (const tile of state.board) {
    const rating = rateClaim(state, tile.index, seatIndex);
    if (rating > best) {
      best = rating;
      chosen = tile.index;
    }
  }

  return chosen === null ? null : { kind: 'claim', index: chosen };
}

/** Enemy tiles, richest cluster first — the best thing to freeze or splash. */
function enemyTargetsByCluster(state: ColorThiefGameState, seatIndex: number): number[] {
  return state.board
    .filter(
      (tile) => tile.owner !== null && tile.owner !== seatIndex && !isFrozen(tile, state.round),
    )
    .map((tile) => ({
      index: tile.index,
      weight: countNeighbors(state, tile.index, (owner) => owner === tile.owner),
    }))
    .sort((a, b) => b.weight - a.weight || a.index - b.index)
    .map((entry) => entry.index);
}

function pickAbilityTargets(
  state: ColorThiefGameState,
  player: ColorThiefPlayerState,
): number[] | null {
  const seatIndex = player.seatIndex;

  switch (player.ability) {
    case 'bleed':
      // Only worth the paint when it buys more tiles than plain claims would.
      return neutralTilesTouching(state, seatIndex).length >= BLEED_LIMIT - 1 ? [] : null;

    case 'freeze': {
      const [target] = enemyTargetsByCluster(state, seatIndex);
      return target === undefined ? null : [target];
    }

    case 'blockade': {
      const leader = scoreboardOf(state).find((entry) => entry.seatIndex !== seatIndex);
      if (!leader) return null;
      const target = state.board.find(
        (tile) => tile.owner === leader.seatIndex && !isFrozen(tile, state.round),
      );
      return target ? [target.index] : null;
    }

    case 'splash': {
      const candidates = state.board
        .map((tile) => ({
          index: tile.index,
          gain: [tile.index, ...neighborsOf(tile.index, gridSizeOf(state))].filter((i) => {
            const cell = state.board[i];
            return cell.owner !== seatIndex && !isFrozen(cell, state.round);
          }).length,
        }))
        .sort((a, b) => b.gain - a.gain || a.index - b.index);
      const best = candidates[0];
      return best && best.gain >= 4 ? [best.index] : null;
    }

    case 'swap': {
      // Swap moves paint without changing counts, so it is only worth it when
      // it trades a stranded tile for one that thickens the bot's wall.
      const stranded = state.board.find(
        (tile) =>
          tile.owner === seatIndex &&
          !isFrozen(tile, state.round) &&
          countNeighbors(state, tile.index, (owner) => owner === seatIndex) === 0,
      );
      if (!stranded) return null;

      const wanted = state.board
        .filter(
          (tile) => tile.owner !== null && tile.owner !== seatIndex && !isFrozen(tile, state.round),
        )
        .map((tile) => ({
          index: tile.index,
          mine: countNeighbors(state, tile.index, (owner) => owner === seatIndex),
        }))
        .sort((a, b) => b.mine - a.mine || a.index - b.index)[0];

      return wanted && wanted.mine >= 2 ? [stranded.index, wanted.index] : null;
    }

    default:
      return null;
  }
}

/**
 * One decision at a time. The caller replays this after every applied move so
 * the bot reacts to its own paint, exactly as a human watching the grid would.
 */
export function decideBotMove(state: ColorThiefGameState, seatIndex: number): ColorThiefBotMove {
  const player = state.players.find((p) => p.seatIndex === seatIndex);
  if (!player || state.currentTurnSeatIndex !== seatIndex) return END_TURN;

  if (isAbilityReady(state, player) && abilityOf(player).kind === 'active') {
    const targets = pickAbilityTargets(state, player);
    if (targets && areTargetsValid(state, seatIndex, targets)) {
      return { kind: 'ability', targets };
    }
  }

  return bestClaim(state, seatIndex) ?? END_TURN;
}
