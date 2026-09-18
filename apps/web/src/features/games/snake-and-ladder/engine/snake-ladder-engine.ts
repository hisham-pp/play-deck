import type { BaseGameEngine } from '@playdeck/game-types';
import type {
  SnakeLadderAction,
  SnakeLadderGameState,
  SnakeLadderPlayer,
  SnakeLadderRuleSettings,
} from '../types/snake-and-ladder.types';
import { getPlayerBySeat } from './movement';
import { STATUS_PLAYING } from './snake-ladder-constants';
import { snakeLadderReducer } from './snake-ladder-reducer';
import { createInitialSnakeLadderState } from './snake-ladder-state';

export class SnakeLadderEngine implements BaseGameEngine<SnakeLadderGameState, SnakeLadderAction> {
  private state: SnakeLadderGameState;
  private listeners: Set<(state: SnakeLadderGameState) => void> = new Set();
  private readonly initialPlayers: SnakeLadderPlayer[];
  private readonly initialSettings: Partial<SnakeLadderRuleSettings>;

  constructor(players: SnakeLadderPlayer[], settings: Partial<SnakeLadderRuleSettings> = {}) {
    this.initialPlayers = players;
    this.initialSettings = settings;
    this.state = createInitialSnakeLadderState(players, settings);
  }

  getState(): SnakeLadderGameState {
    return this.state;
  }

  dispatch(action: SnakeLadderAction): void {
    const next = snakeLadderReducer(this.state, action);
    if (next === this.state) return;
    this.state = next;
    this.notify();
  }

  subscribe(listener: (state: SnakeLadderGameState) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  reset(): void {
    this.state = createInitialSnakeLadderState(this.initialPlayers, this.initialSettings);
    this.notify();
  }

  /**
   * Adopts a state decided elsewhere — the room host's snapshot when a guest
   * joins or reconnects mid-match. Everything after that flows back through
   * `dispatch`, so this is the only door around the reducer.
   */
  loadState(state: SnakeLadderGameState): void {
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

  rollDice(playerId: string, value: number): void {
    this.dispatch({ type: 'ROLL_DICE', playerId, payload: { value } });
  }

  /**
   * Snake & Ladder offers exactly one action per turn — the roll — so the only
   * question worth asking the engine is whether a seat may take it. The UI and
   * bots both gate on this rather than re-deriving the rule.
   */
  canRoll(seatIndex: number): boolean {
    if (this.state.status !== STATUS_PLAYING) return false;
    if (this.state.currentTurnSeatIndex !== seatIndex) return false;

    const player = getPlayerBySeat(this.state, seatIndex);
    return Boolean(player && !player.finished);
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }
}
