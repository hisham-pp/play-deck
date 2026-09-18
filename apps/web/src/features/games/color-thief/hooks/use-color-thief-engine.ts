'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { MIN_SEATS } from '../engine/color-thief-constants';
import { ColorThiefEngine } from '../engine/color-thief-engine';
import type {
  ColorThiefGameState,
  ColorThiefRuleSettings,
  ColorThiefSeat,
} from '../types/color-thief.types';

export interface UseColorThiefEngineReturn {
  engine: ColorThiefEngine;
  state: ColorThiefGameState;
  claimTile: (playerId: string, index: number) => void;
  useAbility: (playerId: string, targets: number[]) => void;
  endTurn: (playerId: string) => void;
  pause: (playerId: string) => void;
  resume: (playerId: string) => void;
  restart: (seats: ColorThiefSeat[], settings: Partial<ColorThiefRuleSettings>) => void;
}

/**
 * Owns the engine instance and mirrors its state into React. The engine is
 * deliberately not recreated on render: a match survives every re-render until
 * `restart` deals a new grid.
 */
export function useColorThiefEngine(
  seats: ColorThiefSeat[],
  settings: Partial<ColorThiefRuleSettings> = {},
): UseColorThiefEngineReturn {
  const engineRef = useRef<ColorThiefEngine | null>(null);
  if (!engineRef.current) {
    engineRef.current = new ColorThiefEngine(seats, settings);
  }

  const [state, setState] = useState<ColorThiefGameState>(() => engineRef.current!.getState());

  useEffect(() => engineRef.current?.subscribe(setState), []);
  useEffect(() => () => engineRef.current?.destroy(), []);

  const restart = useCallback(
    (nextSeats: ColorThiefSeat[], nextSettings: Partial<ColorThiefRuleSettings>) => {
      engineRef.current?.destroy();

      const engine = new ColorThiefEngine(nextSeats, nextSettings);
      engineRef.current = engine;
      if (nextSeats.length >= MIN_SEATS) engine.startGame(nextSeats[0].id);

      setState(engine.getState());
      engine.subscribe(setState);
    },
    [],
  );

  const claimTile = useCallback(
    (playerId: string, index: number) => engineRef.current?.claimTile(playerId, index),
    [],
  );
  const useAbility = useCallback(
    (playerId: string, targets: number[]) => engineRef.current?.useAbility(playerId, targets),
    [],
  );
  const endTurn = useCallback((playerId: string) => engineRef.current?.endTurn(playerId), []);
  const pause = useCallback((playerId: string) => engineRef.current?.pauseGame(playerId), []);
  const resume = useCallback((playerId: string) => engineRef.current?.resumeGame(playerId), []);

  return {
    get engine() {
      return engineRef.current!;
    },
    state,
    claimTile,
    useAbility,
    endTurn,
    pause,
    resume,
    restart,
  };
}
