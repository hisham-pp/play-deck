import type { PushYourLuckAction, PushYourLuckState } from '../types/push-your-luck.types';
import { createInitialPushYourLuckState, resetMatchState } from './push-your-luck-state';
import { bankPot, endTurn, pushDraw } from './push-your-luck-turn';

export function pushYourLuckReducer(
  state: PushYourLuckState,
  action: PushYourLuckAction,
): PushYourLuckState {
  switch (action.type) {
    case 'CONFIGURE':
      return createInitialPushYourLuckState(action.seats, action.targetScore, action.seed);

    case 'PUSH':
      return pushDraw(state);

    case 'BANK':
      return bankPot(state);

    case 'END_TURN':
      return endTurn(state);

    case 'RESET_MATCH':
      return resetMatchState(state);

    default:
      return state;
  }
}
