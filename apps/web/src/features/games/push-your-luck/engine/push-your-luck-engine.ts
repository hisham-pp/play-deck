import type { BaseGameEngine } from '@playdeck/game-types';
import type {
  PushYourLuckAction,
  PushYourLuckSeat,
  PushYourLuckState,
} from '../types/push-your-luck.types';
import { DEFAULT_TARGET_SCORE, PHASE_PLAYING } from './push-your-luck-constants';
import { pushYourLuckReducer } from './push-your-luck-reducer';
import { createInitialPushYourLuckState } from './push-your-luck-state';
import { activeSeatOf } from './push-your-luck-utils';

export class PushYourLuckEngine implements BaseGameEngine<PushYourLuckState, PushYourLuckAction> {
  private state: PushYourLuckState;
  private listeners: Set<(state: PushYourLuckState) => void> = new Set();

  constructor(seats?: PushYourLuckSeat[], targetScore?: number, seed?: number) {
    this.state = createInitialPushYourLuckState(seats, targetScore, seed);
  }

  getState(): PushYourLuckState {
    return this.state;
  }

  dispatch(action: PushYourLuckAction): void {
    const next = pushYourLuckReducer(this.state, action);
    if (next === this.state) return;
    this.state = next;
    this.notify();
  }

  subscribe(listener: (state: PushYourLuckState) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  reset(): void {
    this.resetMatch();
  }

  destroy(): void {
    this.listeners.clear();
  }

  configure(
    seats: PushYourLuckSeat[],
    targetScore: number = DEFAULT_TARGET_SCORE,
    seed?: number,
  ): void {
    this.dispatch({ type: 'CONFIGURE', seats, targetScore, seed });
  }

  /** Draws one card for the active seat. Returns false when it is not allowed. */
  push(): boolean {
    if (!this.canAct()) return false;
    this.dispatch({ type: 'PUSH' });
    return true;
  }

  /** Banks the active seat's pot. Returns false when there is nothing to bank. */
  bank(): boolean {
    if (!this.canAct()) return false;
    if (this.state.turn.pot <= 0) return false;
    this.dispatch({ type: 'BANK' });
    return true;
  }

  endTurn(): void {
    this.dispatch({ type: 'END_TURN' });
  }

  resetMatch(): void {
    this.dispatch({ type: 'RESET_MATCH' });
  }

  /** True while the active seat still owns a live, unresolved turn. */
  canAct(): boolean {
    return this.state.phase === PHASE_PLAYING && this.state.turn.resolved === null;
  }

  activeSeat(): PushYourLuckSeat {
    return activeSeatOf(this.state);
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }
}
