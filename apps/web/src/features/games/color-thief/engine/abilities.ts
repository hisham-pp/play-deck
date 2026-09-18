import type {
  ColorThiefAbility,
  ColorThiefGameState,
  ColorThiefPlayerState,
  ColorThiefTile,
} from '../types/color-thief.types';
import { ABILITIES, BLEED_LIMIT, FREEZE_ROUNDS } from './color-thief-constants';
import { isFrozen, isOnGrid, neighborsOf } from './grid';
import { gridSizeOf, neutralTilesTouching, paintTile } from './territory';

export interface AbilityOutcome {
  board: ColorThiefTile[];
  /** Seats whose paint supply the ability just interfered with. */
  blockadedSeats: number[];
  message: string;
}

export function abilityOf(player: ColorThiefPlayerState): ColorThiefAbility {
  return ABILITIES[player.ability];
}

export function isAbilityReady(state: ColorThiefGameState, player: ColorThiefPlayerState): boolean {
  const ability = abilityOf(player);
  if (ability.kind !== 'active') return false;
  if (state.round < player.abilityReadyOnRound) return false;
  return state.paintRemaining >= ability.paintCost;
}

function ownerOf(state: ColorThiefGameState, index: number): number | null {
  return isOnGrid(index, gridSizeOf(state)) ? state.board[index].owner : null;
}

function isTargetableEnemy(state: ColorThiefGameState, index: number, seatIndex: number): boolean {
  if (!isOnGrid(index, gridSizeOf(state))) return false;
  const tile = state.board[index];
  return tile.owner !== null && tile.owner !== seatIndex && !isFrozen(tile, state.round);
}

/** Whether the picked tiles satisfy the ability's target contract. */
export function areTargetsValid(
  state: ColorThiefGameState,
  seatIndex: number,
  targets: number[],
): boolean {
  const player = state.players.find((p) => p.seatIndex === seatIndex);
  if (!player) return false;

  switch (abilityOf(player).targetKind) {
    case 'none':
      return targets.length === 0;
    case 'enemy-tile':
      return targets.length === 1 && isTargetableEnemy(state, targets[0], seatIndex);
    case 'any-tile':
      return targets.length === 1 && isOnGrid(targets[0], gridSizeOf(state));
    case 'own-and-enemy':
      return (
        targets.length === 2 &&
        ownerOf(state, targets[0]) === seatIndex &&
        !isFrozen(state.board[targets[0]], state.round) &&
        isTargetableEnemy(state, targets[1], seatIndex)
      );
    default:
      return false;
  }
}

function resolveBleed(state: ColorThiefGameState, seatIndex: number): AbilityOutcome {
  const flooded = neutralTilesTouching(state, seatIndex).slice(0, BLEED_LIMIT);
  const board = flooded.reduce(
    (acc, index) => paintTile(acc, index, seatIndex, state.actionCount),
    state.board,
  );

  return {
    board,
    blockadedSeats: [],
    message: flooded.length
      ? `Bleed floods ${flooded.length} neutral ${flooded.length === 1 ? 'tile' : 'tiles'}`
      : 'Bleed finds no neutral tile to flood',
  };
}

function resolveFreeze(state: ColorThiefGameState, target: number): AbilityOutcome {
  const victim = state.board[target].owner;
  const thawRound = state.round + FREEZE_ROUNDS;
  const caught = new Set(
    [target, ...neighborsOf(target, gridSizeOf(state))].filter(
      (index) => state.board[index].owner === victim,
    ),
  );

  const board = state.board.map((tile) =>
    caught.has(tile.index) ? { ...tile, frozenUntilRound: thawRound } : tile,
  );

  return {
    board,
    blockadedSeats: [],
    message: `Freeze soaks ${caught.size} ${caught.size === 1 ? 'tile' : 'tiles'} for ${FREEZE_ROUNDS} rounds`,
  };
}

function resolveSwap(
  state: ColorThiefGameState,
  seatIndex: number,
  [own, enemy]: number[],
): AbilityOutcome {
  const enemySeat = state.board[enemy].owner;
  const withEnemyTaken = paintTile(state.board, enemy, seatIndex, state.actionCount);
  const board = paintTile(withEnemyTaken, own, enemySeat, state.actionCount);

  return { board, blockadedSeats: [], message: 'Swap trades two tiles across the grid' };
}

function resolveBlockade(state: ColorThiefGameState, target: number): AbilityOutcome {
  const victim = state.board[target].owner;
  return {
    board: state.board,
    blockadedSeats: victim === null ? [] : [victim],
    message: 'Blockade dries up an opponent for their next turn',
  };
}

function resolveSplash(
  state: ColorThiefGameState,
  seatIndex: number,
  target: number,
): AbilityOutcome {
  const splashed = [target, ...neighborsOf(target, gridSizeOf(state))].filter((index) => {
    const tile = state.board[index];
    return tile.owner !== seatIndex && !isFrozen(tile, state.round);
  });

  const board = splashed.reduce(
    (acc, index) => paintTile(acc, index, seatIndex, state.actionCount),
    state.board,
  );

  return {
    board,
    blockadedSeats: [],
    message: `Splash takes ${splashed.length} ${splashed.length === 1 ? 'tile' : 'tiles'} at once`,
  };
}

/**
 * Applies the seat's ability and hands back the new board plus anything the
 * reducer has to settle afterwards. Targets are assumed valid: callers gate on
 * `areTargetsValid` first, so an invalid pick never reaches here.
 */
export function resolveAbility(
  state: ColorThiefGameState,
  seatIndex: number,
  targets: number[],
): AbilityOutcome | null {
  const player = state.players.find((p) => p.seatIndex === seatIndex);
  if (!player) return null;

  switch (player.ability) {
    case 'bleed':
      return resolveBleed(state, seatIndex);
    case 'freeze':
      return resolveFreeze(state, targets[0]);
    case 'swap':
      return resolveSwap(state, seatIndex, targets);
    case 'blockade':
      return resolveBlockade(state, targets[0]);
    case 'splash':
      return resolveSplash(state, seatIndex, targets[0]);
    default:
      // Bloom is passive; it creeps at turn start rather than being aimed.
      return null;
  }
}
