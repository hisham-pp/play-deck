'use client';

import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_SLIPS } from '../engine/elevator-constants';
import { ElevatorEngine } from '../engine/elevator-engine';
import type { ElevatorGameState, ElevatorSeat } from '../types/unstable-elevator.types';

export interface UseElevatorEngineOptions {
  seats: ElevatorSeat[];
  seed: string;
  slips?: number;
}

export interface UseElevatorEngineReturn {
  engine: ElevatorEngine;
  state: ElevatorGameState;
  /** Throws the old run away and starts a fresh one on a new seed. */
  restart: (seats: ElevatorSeat[], seed: string, slips?: number) => void;
}

/**
 * Holds one `ElevatorEngine` and mirrors its published state into React. The
 * engine ticks at 120 Hz but only publishes when the HUD would actually look
 * different, so this does not re-render on every physics step.
 */
export function useElevatorEngine({
  seats,
  seed,
  slips = DEFAULT_SLIPS,
}: UseElevatorEngineOptions): UseElevatorEngineReturn {
  const [engine, setEngine] = useState(() => new ElevatorEngine({ seats, seed, slips }));
  const [state, setState] = useState<ElevatorGameState>(() => engine.getState());

  useEffect(() => {
    setState(engine.getState());
    return engine.subscribe(setState);
  }, [engine]);

  const restart = useCallback(
    (nextSeats: ElevatorSeat[], nextSeed: string, nextSlips = slips) => {
      const next = new ElevatorEngine({ seats: nextSeats, seed: nextSeed, slips: nextSlips });
      setEngine(next);
      setState(next.getState());
      next.start();
    },
    [slips],
  );

  return { engine, state, restart };
}
