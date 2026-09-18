'use client';

import { useCallback, useEffect, useState } from 'react';
import { PHASE_ASSEMBLY } from '../engine/bomb-factory-constants';
import { newAttemptId } from '../engine/bomb-factory-rng';
import type {
  AssemblySelection,
  AssemblySubmission,
  BombFactorySeat,
  BombFactoryState,
} from '../types/bomb-factory.types';

const EMPTY_SELECTION: AssemblySelection = {
  partId: null,
  stationId: null,
  dial: 1,
  toolId: null,
};

interface UseBombFactoryOperatorOptions {
  state: BombFactoryState;
  operator: BombFactorySeat | null;
  isOperator: boolean;
  onSubmit: (submission: AssemblySubmission) => void;
  onSelectionBroadcast: (selection: AssemblySelection) => void;
}

export interface UseBombFactoryOperatorReturn {
  selection: AssemblySelection;
  setSelection: (next: AssemblySelection) => void;
  engage: () => void;
}

/**
 * Holds what the operator is lining up on the bench, mirrors it to the room so
 * everyone can shout a correction, and turns Enter into an attempt.
 */
export function useBombFactoryOperator({
  state,
  operator,
  isOperator,
  onSubmit,
  onSelectionBroadcast,
}: UseBombFactoryOperatorOptions): UseBombFactoryOperatorReturn {
  const [selection, setLocalSelection] = useState<AssemblySelection>(EMPTY_SELECTION);

  // A fresh step starts from an empty bench, whoever picks up the wrench.
  useEffect(() => {
    setLocalSelection(EMPTY_SELECTION);
  }, [state.currentStep, state.machineIndex]);

  const setSelection = useCallback(
    (next: AssemblySelection) => {
      setLocalSelection(next);
      onSelectionBroadcast(next);
    },
    [onSelectionBroadcast],
  );

  const engage = useCallback(() => {
    if (!operator || !isOperator) return;
    if (state.phase !== PHASE_ASSEMBLY || state.pendingAttempt) return;
    if (!selection.partId || !selection.stationId || !selection.toolId) return;

    onSubmit({
      attemptId: newAttemptId(operator.id),
      stepIndex: state.currentStep,
      operatorSeatId: operator.id,
      partId: selection.partId,
      stationId: selection.stationId,
      dial: selection.dial,
      toolId: selection.toolId,
    });
  }, [
    isOperator,
    onSubmit,
    operator,
    selection,
    state.currentStep,
    state.pendingAttempt,
    state.phase,
  ]);

  // Enter engages, unless the focus is already on a control that answers to it.
  useEffect(() => {
    if (!isOperator) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' || event.defaultPrevented) return;
      const active = document.activeElement;
      if (active instanceof HTMLButtonElement || active instanceof HTMLInputElement) return;
      event.preventDefault();
      engage();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [engage, isOperator]);

  return { selection, setSelection, engage };
}
