import type { BaseGameEngine } from '@playdeck/game-types';
import type {
  AIDifficulty,
  PenColor,
  PenFightAction,
  PenFightMode,
  PenFightOutcome,
  PenFightPlayerId,
  PenFightState,
} from '../types/pen-fight.types';
import { DIFFICULTY_PRO, MODE_AI } from './pen-fight-constants';
import { penFightReducer } from './pen-fight-reducer';
import { createInitialPenFightState } from './pen-fight-state';

export class PenFightEngine implements BaseGameEngine<PenFightState, PenFightAction> {
  private state: PenFightState;
  private listeners: Set<(state: PenFightState) => void> = new Set();

  constructor(mode: PenFightMode = MODE_AI, difficulty: AIDifficulty = DIFFICULTY_PRO) {
    this.state = createInitialPenFightState(mode, difficulty);
  }

  getState(): PenFightState {
    return this.state;
  }

  dispatch(action: PenFightAction): void {
    this.state = penFightReducer(this.state, action);
    this.notify();
  }

  subscribe(listener: (state: PenFightState) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  reset(): void {
    this.dispatch({ type: 'START_MATCH' });
  }

  destroy(): void {
    this.listeners.clear();
  }

  setMode(mode: PenFightMode): void {
    this.dispatch({ type: 'SET_MODE', mode });
  }

  setDifficulty(difficulty: AIDifficulty): void {
    this.dispatch({ type: 'SET_DIFFICULTY', difficulty });
  }

  setPlayerName(playerId: PenFightPlayerId, name: string): void {
    this.dispatch({ type: 'SET_PLAYER_NAME', playerId, name });
  }

  setPlayerColor(playerId: PenFightPlayerId, color: PenColor): void {
    this.dispatch({ type: 'SET_PLAYER_COLOR', playerId, color });
  }

  startMatch(): void {
    this.dispatch({ type: 'START_MATCH' });
  }

  /** Marks that the active player has committed a flick (locks aiming input). */
  flickTaken(): void {
    if (this.state.phase !== 'aiming') return;
    this.dispatch({ type: 'FLICK_TAKEN' });
  }

  beginSettling(): void {
    this.dispatch({ type: 'BEGIN_SETTLING' });
  }

  /** Reports the physics outcome once pens have come to rest (or one has fallen). */
  resolveRound(winner: PenFightOutcome): void {
    if (this.state.phase !== 'flicking' && this.state.phase !== 'settling') return;
    this.dispatch({ type: 'ROUND_RESOLVED', winner });
  }

  nextRound(): void {
    if (this.state.phase !== 'round-over') return;
    this.dispatch({ type: 'NEXT_ROUND' });
  }

  requestRematch(): void {
    this.dispatch({ type: 'REQUEST_REMATCH' });
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }
}
