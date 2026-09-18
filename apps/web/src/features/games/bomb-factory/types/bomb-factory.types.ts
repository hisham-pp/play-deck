/**
 * Bomb Factory is a co-op assembly game built on information asymmetry: the
 * blueprint for each machine is cut into four channels and no client ever holds
 * more than its own share. The types below keep that split explicit — anything
 * marked "public" is safe to broadcast, everything else stays on one client.
 */

export type BombFactoryMode = 'local' | 'online';

export type BombFactoryDifficulty = 'trainee' | 'standard' | 'overclocked';

export type BombFactoryPhase =
  'idle' | 'briefing' | 'assembly' | 'machine-cleared' | 'machine-failed' | 'shift-complete';

export type PartMaterial = 'copper' | 'ceramic' | 'polymer' | 'alloy';

/** The four slices a blueprint is cut into. One slice is never enough to build. */
export type BlueprintChannel = 'order' | 'routing' | 'calibration' | 'safety';

export interface PartDefinition {
  id: string;
  name: string;
  glyph: string;
  material: PartMaterial;
}

export interface StationDefinition {
  id: string;
  label: string;
  row: string;
  column: number;
}

export interface ToolDefinition {
  id: string;
  name: string;
  glyph: string;
}

/** Public description of one machine. Carries no answers, only the shop floor. */
export interface MachineSpec {
  index: number;
  name: string;
  seed: number;
  /** Parts on the bench for this machine, in catalog order. */
  partIds: string[];
  /** Bays available for this machine. */
  stationIds: string[];
  toolIds: string[];
  maxDial: number;
  timeLimitSeconds: number;
  faultPenaltySeconds: number;
}

/**
 * Public record of who holds which slice. `scope` names the facts a seat owns
 * and `pool` the public set those facts are drawn from — enough for any client
 * to route a verdict request, never enough to answer it.
 */
export interface ChannelAssignment {
  channel: BlueprintChannel;
  seatId: string;
  /** Step indices (order), part ids (routing, calibration) or materials (safety). */
  scope: string[];
  /** Part ids (order) or station ids (routing). Empty for the other channels. */
  pool: string[];
}

export type DistributionPlan = ChannelAssignment[];

export type DossierFact =
  | { kind: 'order'; stepIndex: number; partId: string }
  | { kind: 'routing'; partId: string; stationId: string }
  | { kind: 'calibration'; partId: string; dial: number }
  | { kind: 'safety'; material: PartMaterial; forbiddenToolIds: string[] };

/** One seat's private share of the blueprint. Never leaves the client that made it. */
export interface Dossier {
  seatId: string;
  machineIndex: number;
  facts: DossierFact[];
}

export interface AssemblySelection {
  partId: string | null;
  stationId: string | null;
  dial: number;
  toolId: string | null;
}

export interface AssemblySubmission {
  attemptId: string;
  stepIndex: number;
  operatorSeatId: string;
  partId: string;
  stationId: string;
  dial: number;
  toolId: string;
}

/** A channel owner's ruling on the one dimension it can see. */
export interface ChannelVerdict {
  attemptId: string;
  channel: BlueprintChannel;
  seatId: string;
  ok: boolean;
}

export interface FaultRecord {
  attemptId: string;
  stepIndex: number;
  partId: string;
  failedChannels: BlueprintChannel[];
  penaltySeconds: number;
}

export interface CompletedStep {
  stepIndex: number;
  partId: string;
  stationId: string;
  dial: number;
  toolId: string;
  operatorSeatId: string;
}

export interface BombFactorySeat {
  id: string;
  displayName: string;
  avatar: string;
  seatIndex: number;
  status: 'connected' | 'disconnected';
}

export interface PendingAttempt {
  submission: AssemblySubmission;
  verdicts: ChannelVerdict[];
}

export interface BombFactoryState {
  mode: BombFactoryMode;
  difficulty: BombFactoryDifficulty;
  phase: BombFactoryPhase;
  seats: BombFactorySeat[];
  machineIndex: number;
  machinesInShift: number;
  spec: MachineSpec | null;
  plan: DistributionPlan;
  currentStep: number;
  completedSteps: CompletedStep[];
  pendingAttempt: PendingAttempt | null;
  faults: FaultRecord[];
  penaltySeconds: number;
  startedAt: number | null;
  /** Set when a machine ends, so the result screen can show the clock it stopped at. */
  finishedAt: number | null;
  machinesCleared: number;
  score: number;
  /** Cleared by the UI once shown; drives the fault flash and sound. */
  lastFault: FaultRecord | null;
}

export type BombFactoryAction =
  | {
      type: 'SETUP_SHIFT';
      payload: {
        mode: BombFactoryMode;
        difficulty: BombFactoryDifficulty;
        seats: BombFactorySeat[];
        machinesInShift: number;
      };
    }
  | { type: 'DEAL_MACHINE'; payload: { spec: MachineSpec; plan: DistributionPlan } }
  | { type: 'START_MACHINE'; payload: { at: number } }
  | { type: 'SUBMIT_ATTEMPT'; payload: { submission: AssemblySubmission } }
  | { type: 'RECORD_VERDICT'; payload: { verdict: ChannelVerdict; at: number } }
  | { type: 'VOID_ATTEMPT'; payload: { attemptId: string } }
  | { type: 'TIMEOUT'; payload: { machineIndex: number; at: number } }
  | { type: 'SEATS_CHANGED'; payload: { seats: BombFactorySeat[] } }
  | { type: 'ABORT' };

export interface BombFactoryStats {
  shiftsPlayed: number;
  shiftsCompleted: number;
  machinesCleared: number;
  bestScore: number;
  fewestFaults: number | null;
  lastPlayedAt: string;
}
