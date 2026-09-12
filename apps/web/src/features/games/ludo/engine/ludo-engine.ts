import type { BaseGameEngine } from '@playdeck/game-types';
import { computeLegalMoveActions } from './movement';
import { createInitialLudoState } from './ludo-state';
import { ludoReducer } from './ludo-reducer';
import type { LudoAction, LudoGameState, LudoPlayer, LudoRuleSettings } from '../types/ludo.types';

export class LudoEngine implements BaseGameEngine<LudoGameState, LudoAction> {
  private state: LudoGameState;
  private listeners: Set<(state: LudoGameState) => void> = new Set();
  private readonly initialPlayers: LudoPlayer[];
  private readonly initialSettings: Partial<LudoRuleSettings>;

  constructor(players: LudoPlayer[], settings: Partial<LudoRuleSettings> = {}) {
    this.initialPlayers = players;
    this.initialSettings = settings;
    this.state = createInitialLudoState(players, settings);
  }

  getState(): LudoGameState {
    return this.state;
  }

  dispatch(action: LudoAction): void {
    this.state = ludoReducer(this.state, action);
    this.notify();
  }

  subscribe(listener: (state: LudoGameState) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  reset(): void {
    this.state = createInitialLudoState(this.initialPlayers, this.initialSettings);
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

  movePiece(playerId: string, pieceId: string): void {
    this.dispatch({ type: 'MOVE_PIECE', playerId, payload: { pieceId } });
  }

  /**
   * Legal MOVE_PIECE actions for the seat currently awaiting a move, given
   * the already-rolled dice value. Empty outside the `awaiting-move` phase.
   * Used identically by the UI (to highlight selectable pieces) and by bots
   * (to choose among - never invent - moves).
   */
  getLegalActions(seatIndex: number): LudoAction[] {
    if (this.state.turnPhase !== 'awaiting-move') return [];
    if (this.state.currentTurnSeatIndex !== seatIndex) return [];
    if (this.state.dice.value === null) return [];
    return computeLegalMoveActions(this.state, seatIndex, this.state.dice.value);
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }
}
