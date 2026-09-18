import type {
  BombFactoryAction,
  BombFactoryState,
  ChannelVerdict,
  FaultRecord,
  PendingAttempt,
} from '../types/bomb-factory.types';
import { requiredChannelsFor } from './assembly-validator';
import {
  PHASE_ASSEMBLY,
  PHASE_BRIEFING,
  PHASE_MACHINE_CLEARED,
  PHASE_MACHINE_FAILED,
  PHASE_SHIFT_COMPLETE,
} from './bomb-factory-constants';
import { machineScore, remainingSeconds } from './bomb-factory-scoring';
import { createInitialBombFactoryState } from './bomb-factory-state';

/** Every channel owner agreed, so the part is seated and the line moves on. */
function acceptStep(state: BombFactoryState, pending: PendingAttempt, at: number) {
  const { submission } = pending;
  const nextStep = state.currentStep + 1;
  const isLastStep = nextStep >= (state.spec?.partIds.length ?? 0);

  const base: BombFactoryState = {
    ...state,
    pendingAttempt: null,
    currentStep: nextStep,
    completedSteps: [
      ...state.completedSteps,
      {
        stepIndex: submission.stepIndex,
        partId: submission.partId,
        stationId: submission.stationId,
        dial: submission.dial,
        toolId: submission.toolId,
        operatorSeatId: submission.operatorSeatId,
      },
    ],
  };

  if (!isLastStep) return base;

  const secondsLeft = remainingSeconds(state, at);
  const cleared = state.machinesCleared + 1;
  return {
    ...base,
    phase: cleared >= state.machinesInShift ? PHASE_SHIFT_COMPLETE : PHASE_MACHINE_CLEARED,
    finishedAt: at,
    machinesCleared: cleared,
    score: state.score + machineScore(secondsLeft, state.faults),
  } as BombFactoryState;
}

/** At least one channel refused. The clock pays for it. */
function rejectStep(
  state: BombFactoryState,
  pending: PendingAttempt,
  failed: ChannelVerdict[],
): BombFactoryState {
  const penalty = state.spec?.faultPenaltySeconds ?? 0;
  const fault: FaultRecord = {
    attemptId: pending.submission.attemptId,
    stepIndex: pending.submission.stepIndex,
    partId: pending.submission.partId,
    failedChannels: failed.map((verdict) => verdict.channel),
    penaltySeconds: penalty,
  };

  return {
    ...state,
    pendingAttempt: null,
    penaltySeconds: state.penaltySeconds + penalty,
    faults: [...state.faults, fault],
    lastFault: fault,
  };
}

function withVerdict(state: BombFactoryState, verdict: ChannelVerdict, at: number) {
  const pending = state.pendingAttempt;
  if (!pending || pending.submission.attemptId !== verdict.attemptId) return state;
  if (pending.verdicts.some((existing) => existing.channel === verdict.channel)) return state;

  const verdicts = [...pending.verdicts, verdict];
  const required = requiredChannelsFor(state.plan, pending.submission);
  const settled = required.every((channel) => verdicts.some((entry) => entry.channel === channel));

  if (!settled) return { ...state, pendingAttempt: { ...pending, verdicts } };

  const failed = verdicts.filter((entry) => !entry.ok);
  return failed.length > 0
    ? rejectStep(state, pending, failed)
    : acceptStep(state, { ...pending, verdicts }, at);
}

/** Hands the room a fresh machine. The clock does not run until the line starts. */
function dealMachine(
  state: BombFactoryState,
  payload: Extract<BombFactoryAction, { type: 'DEAL_MACHINE' }>['payload'],
): BombFactoryState {
  return {
    ...state,
    phase: PHASE_BRIEFING,
    spec: payload.spec,
    plan: payload.plan,
    machineIndex: payload.spec.index,
    currentStep: 0,
    completedSteps: [],
    pendingAttempt: null,
    faults: [],
    penaltySeconds: 0,
    startedAt: null,
    finishedAt: null,
    lastFault: null,
  };
}

/**
 * Pure transition table for one production line. Verdicts drive it rather than
 * a single authority, because no client is allowed to know enough to referee
 * an attempt on its own.
 */
export function bombFactoryReducer(
  state: BombFactoryState,
  action: BombFactoryAction,
): BombFactoryState {
  switch (action.type) {
    case 'SETUP_SHIFT':
      return {
        ...createInitialBombFactoryState(),
        ...action.payload,
        phase: PHASE_BRIEFING,
      };

    case 'DEAL_MACHINE':
      return dealMachine(state, action.payload);

    case 'START_MACHINE':
      if (state.phase !== PHASE_BRIEFING) return state;
      return { ...state, phase: PHASE_ASSEMBLY, startedAt: action.payload.at };

    case 'SUBMIT_ATTEMPT': {
      const { submission } = action.payload;
      if (state.phase !== PHASE_ASSEMBLY || state.pendingAttempt) return state;
      if (submission.stepIndex !== state.currentStep) return state;
      return { ...state, pendingAttempt: { submission, verdicts: [] }, lastFault: null };
    }

    case 'RECORD_VERDICT':
      return withVerdict(state, action.payload.verdict, action.payload.at);

    case 'VOID_ATTEMPT':
      if (state.pendingAttempt?.submission.attemptId !== action.payload.attemptId) return state;
      return { ...state, pendingAttempt: null };

    case 'TIMEOUT':
      if (state.phase !== PHASE_ASSEMBLY || state.machineIndex !== action.payload.machineIndex) {
        return state;
      }
      return {
        ...state,
        phase: PHASE_MACHINE_FAILED,
        pendingAttempt: null,
        finishedAt: action.payload.at,
      };

    case 'SEATS_CHANGED':
      return { ...state, seats: action.payload.seats };

    case 'ABORT':
      return createInitialBombFactoryState();

    default:
      return state;
  }
}
