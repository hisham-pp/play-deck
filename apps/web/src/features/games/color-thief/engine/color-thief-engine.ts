import type { BaseGameEngine } from '@playdeck/game-types';
import type {
  ColorThiefAction,
  ColorThiefGameState,
  ColorThiefRuleSettings,
  ColorThiefSeat,
} from '../types/color-thief.types';
import { colorThiefReducer } from './color-thief-reducer';
import { createInitialColorThiefState } from './color-thief-state';
import { isSeatOnTurn } from './color-thief-turn';
import { canClaim } from './territory';

export class ColorThiefEngine implements BaseGameEngine<ColorThiefGameState, ColorThiefAction> {
  private state: ColorThiefGameState;
  private listeners: Set<(state: ColorThiefGameState) => void> = new Set();
  private readonly initialSeats: ColorThiefSeat[];
  private readonly initialSettings: Partial<ColorThiefRuleSettings>;

  constructor(seats: ColorThiefSeat[], settings: Partial<ColorThiefRuleSettings> = {}) {
    this.initialSeats = seats;
    this.initialSettings = settings;
    this.state = createInitialColorThiefState(seats, settings);
  }

  getState(): ColorThiefGameState {
    return this.state;
  }

  dispatch(action: ColorThiefAction): void {
    const next = colorThiefReducer(this.state, action);
    if (next === this.state) return;
    this.state = next;
    this.notify();
  }

  subscribe(listener: (state: ColorThiefGameState) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  reset(): void {
    this.state = createInitialColorThiefState(this.initialSeats, this.initialSettings);
    this.notify();
  }

  /**
   * Adopts a state decided elsewhere — the room host's snapshot when a guest
   * joins or reconnects mid-match. Everything after that flows back through
   * `dispatch`, so this is the only door around the reducer.
   */
  loadState(state: ColorThiefGameState): void {
    this.state = state;
    this.notify();
  }

  destroy(): void {
    this.listeners.clear();
  }

  startGame(playerId: string): void {
    this.dispatch({ type: 'START_GAME', playerId });
  }

  pauseGame(playerId: string): void {
    this.dispatch({ type: 'PAUSE_GAME', playerId });
  }

  resumeGame(playerId: string): void {
    this.dispatch({ type: 'RESUME_GAME', playerId });
  }

  endGame(playerId: string): void {
    this.dispatch({ type: 'END_GAME', playerId });
  }

  claimTile(playerId: string, index: number): void {
    this.dispatch({ type: 'CLAIM_TILE', playerId, payload: { index } });
  }

  useAbility(playerId: string, targets: number[]): void {
    this.dispatch({ type: 'USE_ABILITY', playerId, payload: { targets } });
  }

  endTurn(playerId: string): void {
    this.dispatch({ type: 'END_TURN', playerId });
  }

  /** The one question the UI and the bots both ask before offering a tile. */
  canClaimTile(seatIndex: number, index: number): boolean {
    if (!isSeatOnTurn(this.state, seatIndex)) return false;
    return canClaim(this.state, index, seatIndex);
  }

  isSeatOnTurn(seatIndex: number): boolean {
    return isSeatOnTurn(this.state, seatIndex);
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }
}
