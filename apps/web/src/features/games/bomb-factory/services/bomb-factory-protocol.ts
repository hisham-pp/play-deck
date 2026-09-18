import type {
  AssemblySelection,
  AssemblySubmission,
  BombFactoryDifficulty,
  BombFactorySeat,
  BombFactoryState,
  ChannelVerdict,
  DistributionPlan,
  MachineSpec,
} from '../types/bomb-factory.types';

/**
 * The room protocol. Every payload here is public by construction — the run
 * sheet, the bay manifest, the dial log and the safety notice never appear in
 * any message, because each seat draws its own and only rules on that.
 */
export const ROOM_EVENTS = {
  shift: 'BF_SHIFT',
  deal: 'BF_DEAL',
  start: 'BF_START',
  select: 'BF_SELECT',
  submit: 'BF_SUBMIT',
  verdict: 'BF_VERDICT',
  void: 'BF_VOID',
  timeout: 'BF_TIMEOUT',
  syncRequest: 'BF_SYNC_REQUEST',
  stateSync: 'BF_STATE',
} as const;

export interface ShiftPayload {
  difficulty: BombFactoryDifficulty;
  seats: BombFactorySeat[];
  machinesInShift: number;
}

export interface DealPayload {
  spec: MachineSpec;
  plan: DistributionPlan;
}

export interface StartPayload {
  at: number;
}

export interface SelectPayload {
  seatId: string;
  selection: AssemblySelection;
}

export interface SubmitPayload {
  submission: AssemblySubmission;
}

export interface VerdictPayload {
  verdict: ChannelVerdict;
}

export interface VoidPayload {
  attemptId: string;
}

export interface TimeoutPayload {
  machineIndex: number;
  at: number;
}

export interface StateSyncPayload {
  state: BombFactoryState;
}
