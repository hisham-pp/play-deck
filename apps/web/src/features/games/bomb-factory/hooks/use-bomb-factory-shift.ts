'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  SupabaseTransportService,
  TransportMessage,
} from '@/features/multiplayer/services/supabase-transport.service';
import { verdictsFrom } from '../engine/assembly-validator';
import { buildMachineSpec, machineCountFor } from '../engine/blueprint';
import { PHASE_MACHINE_CLEARED } from '../engine/bomb-factory-constants';
import type { BombFactoryEngine } from '../engine/bomb-factory-engine';
import { newSeed } from '../engine/bomb-factory-rng';
import { buildDistributionPlan } from '../engine/information-splitter';
import {
  ROOM_EVENTS,
  type DealPayload,
  type SelectPayload,
  type ShiftPayload,
  type StartPayload,
  type StateSyncPayload,
  type SubmitPayload,
  type TimeoutPayload,
  type VerdictPayload,
  type VoidPayload,
} from '../services/bomb-factory-protocol';
import type {
  AssemblySelection,
  AssemblySubmission,
  BombFactoryDifficulty,
  BombFactorySeat,
  BombFactoryState,
  Dossier,
} from '../types/bomb-factory.types';

interface UseBombFactoryShiftOptions {
  engine: BombFactoryEngine;
  state: BombFactoryState;
  dossiers: Dossier[];
  localSeatId: string | null;
  isHost: boolean;
  /** Null on a single device, where there is nobody to tell. */
  transport: SupabaseTransportService | null;
}

export interface UseBombFactoryShiftReturn {
  beginShift: (difficulty: BombFactoryDifficulty, seats: BombFactorySeat[]) => void;
  dealNextMachine: () => void;
  startLine: () => void;
  submit: (submission: AssemblySubmission) => void;
  broadcastSelection: (selection: AssemblySelection) => void;
  callTime: () => void;
  voidAttempt: (attemptId: string) => void;
  /** What the operator is lining up, mirrored to everyone watching. */
  remoteSelection: SelectPayload | null;
}

export function useBombFactoryShift({
  engine,
  state,
  dossiers,
  localSeatId,
  isHost,
  transport,
}: UseBombFactoryShiftOptions): UseBombFactoryShiftReturn {
  const [remoteSelection, setRemoteSelection] = useState<SelectPayload | null>(null);

  const latest = useRef({ engine, state, dossiers, localSeatId, isHost });
  latest.current = { engine, state, dossiers, localSeatId, isHost };

  const send = useCallback(
    (type: string, payload: unknown) => {
      if (!transport || !localSeatId) return;
      transport.send(type, payload, localSeatId);
    },
    [transport, localSeatId],
  );

  /** Rules on the attempt with whatever slices this client holds, then says so. */
  const ruleOnAttempt = useCallback(
    (submission: AssemblySubmission) => {
      const { engine: live, dossiers: mine } = latest.current;
      const { plan } = live.getState();

      for (const dossier of mine) {
        for (const verdict of verdictsFrom(dossier, plan, submission)) {
          live.recordVerdict(verdict);
          send(ROOM_EVENTS.verdict, { verdict } satisfies VerdictPayload);
        }
      }
    },
    [send],
  );

  const submit = useCallback(
    (submission: AssemblySubmission) => {
      latest.current.engine.submit(submission);
      send(ROOM_EVENTS.submit, { submission } satisfies SubmitPayload);
      ruleOnAttempt(submission);
    },
    [ruleOnAttempt, send],
  );

  const dealNextMachine = useCallback(() => {
    const { engine: live } = latest.current;
    const current = live.getState();
    const nextIndex =
      current.phase === PHASE_MACHINE_CLEARED ? current.machineIndex + 1 : current.machineIndex;

    const seed = newSeed();
    const spec = buildMachineSpec(current.difficulty, nextIndex, seed);
    const plan = buildDistributionPlan(
      spec,
      current.seats.map((seat) => seat.id),
      seed,
    );

    live.dealMachine(spec, plan);
    send(ROOM_EVENTS.deal, { spec, plan } satisfies DealPayload);
  }, [send]);

  const beginShift = useCallback(
    (difficulty: BombFactoryDifficulty, seats: BombFactorySeat[]) => {
      const machinesInShift = machineCountFor(difficulty);
      const payload = { difficulty, seats, machinesInShift } satisfies ShiftPayload;
      latest.current.engine.setupShift({ mode: transport ? 'online' : 'local', ...payload });
      send(ROOM_EVENTS.shift, payload);
      dealNextMachine();
    },
    [dealNextMachine, send, transport],
  );

  const startLine = useCallback(() => {
    const at = Date.now();
    latest.current.engine.startMachine(at);
    send(ROOM_EVENTS.start, { at } satisfies StartPayload);
  }, [send]);

  const callTime = useCallback(() => {
    const { engine: live } = latest.current;
    const at = Date.now();
    const { machineIndex } = live.getState();
    live.timeout(machineIndex, at);
    send(ROOM_EVENTS.timeout, { machineIndex, at } satisfies TimeoutPayload);
  }, [send]);

  const voidAttempt = useCallback(
    (attemptId: string) => {
      latest.current.engine.voidAttempt(attemptId);
      send(ROOM_EVENTS.void, { attemptId } satisfies VoidPayload);
    },
    [send],
  );

  const broadcastSelection = useCallback(
    (selection: AssemblySelection) => {
      if (!localSeatId) return;
      send(ROOM_EVENTS.select, { seatId: localSeatId, selection } satisfies SelectPayload);
    },
    [localSeatId, send],
  );

  const handleMessage = useCallback(
    (msg: TransportMessage) => {
      const { engine: live, localSeatId: me, isHost: host } = latest.current;
      if (msg.senderId === me) return;

      switch (msg.type) {
        case ROOM_EVENTS.shift:
          live.setupShift({ mode: 'online', ...(msg.payload as ShiftPayload) });
          return;
        case ROOM_EVENTS.deal: {
          const { spec, plan } = msg.payload as DealPayload;
          live.dealMachine(spec, plan);
          return;
        }
        case ROOM_EVENTS.start:
          live.startMachine((msg.payload as StartPayload).at);
          return;
        case ROOM_EVENTS.select:
          setRemoteSelection(msg.payload as SelectPayload);
          return;
        case ROOM_EVENTS.submit: {
          const { submission } = msg.payload as SubmitPayload;
          live.submit(submission);
          ruleOnAttempt(submission);
          return;
        }
        case ROOM_EVENTS.verdict:
          live.recordVerdict((msg.payload as VerdictPayload).verdict);
          return;
        case ROOM_EVENTS.void:
          live.voidAttempt((msg.payload as VoidPayload).attemptId);
          return;
        case ROOM_EVENTS.timeout: {
          const { machineIndex, at } = msg.payload as TimeoutPayload;
          live.timeout(machineIndex, at);
          return;
        }
        case ROOM_EVENTS.syncRequest:
          if (host) send(ROOM_EVENTS.stateSync, { state: live.getState() });
          return;
        case ROOM_EVENTS.stateSync:
          if (!host) live.loadState((msg.payload as StateSyncPayload).state);
          return;
        default:
          return;
      }
    },
    [ruleOnAttempt, send],
  );

  useEffect(() => {
    if (!transport) return;
    return transport.onAction(handleMessage);
  }, [transport, handleMessage]);

  // A crew member arriving late asks the host what is already on the bench.
  const askedRef = useRef(false);
  useEffect(() => {
    if (!transport || isHost || askedRef.current) return;
    askedRef.current = true;
    send(ROOM_EVENTS.syncRequest, {});
  }, [transport, isHost, send]);

  // A fresh machine wipes whatever the last operator was lining up.
  useEffect(() => setRemoteSelection(null), [state.machineIndex, state.currentStep]);

  return {
    beginShift,
    dealNextMachine,
    startLine,
    submit,
    broadcastSelection,
    callTime,
    voidAttempt,
    remoteSelection,
  };
}
