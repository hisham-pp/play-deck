import type { BombFactoryState } from '../types/bomb-factory.types';
import { DEFAULT_DIFFICULTY } from './bomb-factory-constants';

export function createInitialBombFactoryState(): BombFactoryState {
  return {
    mode: 'local',
    difficulty: DEFAULT_DIFFICULTY,
    phase: 'idle',
    seats: [],
    machineIndex: 0,
    machinesInShift: 0,
    spec: null,
    plan: [],
    currentStep: 0,
    completedSteps: [],
    pendingAttempt: null,
    faults: [],
    penaltySeconds: 0,
    startedAt: null,
    finishedAt: null,
    machinesCleared: 0,
    score: 0,
    lastFault: null,
  };
}
