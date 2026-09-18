import type { BaseGameEngine } from '@playdeck/game-types';
import type {
  AssemblySubmission,
  BombFactoryAction,
  BombFactoryDifficulty,
  BombFactoryMode,
  BombFactorySeat,
  BombFactoryState,
  ChannelVerdict,
  DistributionPlan,
  MachineSpec,
} from '../types/bomb-factory.types';
import { operatorSeatFor } from './blueprint';
import { PHASE_ASSEMBLY } from './bomb-factory-constants';
import { bombFactoryReducer } from './bomb-factory-reducer';
import { createInitialBombFactoryState } from './bomb-factory-state';

/**
 * Holds the public state of one shift. Private dossiers deliberately live
 * outside the engine: the engine is mirrored on every client, and mirroring a
 * dossier would hand somebody else's share of the blueprint away.
 */
export class BombFactoryEngine implements BaseGameEngine<BombFactoryState, BombFactoryAction> {
  private state: BombFactoryState = createInitialBombFactoryState();
  private listeners = new Set<(state: BombFactoryState) => void>();

  getState(): BombFactoryState {
    return this.state;
  }

  dispatch(action: BombFactoryAction): void {
    const next = bombFactoryReducer(this.state, action);
    if (next === this.state) return;
    this.state = next;
    this.listeners.forEach((listener) => listener(next));
  }

  subscribe(listener: (state: BombFactoryState) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  reset(): void {
    this.dispatch({ type: 'ABORT' });
  }

  /**
   * Adopts a snapshot from the host — everything in the shared state is public
   * by design, so a late arrival can be brought up to date without leaking a
   * single dossier fact.
   */
  loadState(state: BombFactoryState): void {
    this.state = state;
    this.listeners.forEach((listener) => listener(state));
  }

  destroy(): void {
    this.listeners.clear();
  }

  setupShift(payload: {
    mode: BombFactoryMode;
    difficulty: BombFactoryDifficulty;
    seats: BombFactorySeat[];
    machinesInShift: number;
  }): void {
    this.dispatch({ type: 'SETUP_SHIFT', payload });
  }

  /** Publishes the next machine and its distribution plan, clock still stopped. */
  dealMachine(spec: MachineSpec, plan: DistributionPlan): void {
    this.dispatch({ type: 'DEAL_MACHINE', payload: { spec, plan } });
  }

  startMachine(at = Date.now()): void {
    this.dispatch({ type: 'START_MACHINE', payload: { at } });
  }

  submit(submission: AssemblySubmission): void {
    this.dispatch({ type: 'SUBMIT_ATTEMPT', payload: { submission } });
  }

  recordVerdict(verdict: ChannelVerdict, at = Date.now()): void {
    this.dispatch({ type: 'RECORD_VERDICT', payload: { verdict, at } });
  }

  voidAttempt(attemptId: string): void {
    this.dispatch({ type: 'VOID_ATTEMPT', payload: { attemptId } });
  }

  timeout(machineIndex: number, at = Date.now()): void {
    this.dispatch({ type: 'TIMEOUT', payload: { machineIndex, at } });
  }

  setSeats(seats: BombFactorySeat[]): void {
    this.dispatch({ type: 'SEATS_CHANGED', payload: { seats } });
  }

  /** The seat currently holding the wrench, or null before a machine starts. */
  currentOperator(): BombFactorySeat | null {
    const { seats, machineIndex, currentStep, spec } = this.state;
    if (!spec) return null;
    return operatorSeatFor(seats, machineIndex, currentStep);
  }

  /** Only the operator on this step may engage, and only one attempt at a time. */
  canSubmit(seatId: string): boolean {
    if (this.state.phase !== PHASE_ASSEMBLY || this.state.pendingAttempt) return false;
    return this.currentOperator()?.id === seatId;
  }
}
