'use client';

import { useCallback, type KeyboardEvent } from 'react';
import { ABILITIES } from '../engine/color-thief-constants';
import type {
  ColorThiefAbility,
  ColorThiefGameState,
  ColorThiefSeat,
} from '../types/color-thief.types';
import { useColorThiefKeyboard } from './use-color-thief-keyboard';
import { useColorThiefTargeting } from './use-color-thief-targeting';

export interface ColorThiefMoveSinks {
  claim: (playerId: string, index: number) => void;
  ability: (playerId: string, targets: number[]) => void;
  endTurn: (playerId: string) => void;
}

export interface UseColorThiefActionsOptions {
  state: ColorThiefGameState;
  currentSeat: ColorThiefSeat | null;
  canAct: boolean;
  /** Applies the move locally and, online, mirrors it to the room. */
  play: ColorThiefMoveSinks;
}

export interface UseColorThiefActionsReturn {
  ability: ColorThiefAbility | null;
  isTargeting: boolean;
  selectedTargets: number[];
  targetPrompt: string | null;
  focusedIndex: number;
  setFocusedIndex: (index: number) => void;
  toggleTargeting: () => void;
  selectTile: (index: number) => void;
  endTurn: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
  registerTile: (index: number) => (node: HTMLButtonElement | null) => void;
}

/**
 * What the seat on turn can actually do: claim a tile, aim an ability, or pass.
 * A tap and a keypress land in the same two entry points, so the pointer and
 * the keyboard can never drift apart.
 */
export function useColorThiefActions({
  state,
  currentSeat,
  canAct,
  play,
}: UseColorThiefActionsOptions): UseColorThiefActionsReturn {
  const currentPlayer = state.players.find((p) => p.seatIndex === state.currentTurnSeatIndex);
  const ability = currentPlayer ? ABILITIES[currentPlayer.ability] : null;

  const fireAbility = useCallback(
    (targets: number[]) => {
      if (currentSeat) play.ability(currentSeat.id, targets);
    },
    [currentSeat, play],
  );

  const targeting = useColorThiefTargeting({ ability, onFire: fireAbility, canAct });

  const selectTile = useCallback(
    (index: number) => {
      if (!canAct || !currentSeat) return;
      // While an ability is being aimed the same tap feeds the aim instead.
      if (targeting.pickTarget(index)) return;
      play.claim(currentSeat.id, index);
    },
    [canAct, currentSeat, play, targeting],
  );

  const endTurn = useCallback(() => {
    if (!canAct || !currentSeat) return;
    targeting.cancelTargeting();
    play.endTurn(currentSeat.id);
  }, [canAct, currentSeat, play, targeting]);

  const keyboard = useColorThiefKeyboard({
    columns: state.columns,
    rows: state.rows,
    onActivate: selectTile,
    onEndTurn: endTurn,
    onAbility: targeting.toggleTargeting,
    onCancel: targeting.cancelTargeting,
  });

  return {
    ability,
    isTargeting: targeting.isTargeting,
    selectedTargets: targeting.selectedTargets,
    targetPrompt: targeting.targetPrompt,
    focusedIndex: keyboard.focusedIndex,
    setFocusedIndex: keyboard.setFocusedIndex,
    toggleTargeting: targeting.toggleTargeting,
    selectTile,
    endTurn,
    onKeyDown: keyboard.onKeyDown,
    registerTile: keyboard.registerTile,
  };
}
