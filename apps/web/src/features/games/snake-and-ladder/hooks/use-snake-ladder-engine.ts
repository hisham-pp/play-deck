'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { SnakeLadderDice } from '../engine/dice';
import { SnakeLadderEngine } from '../engine/snake-ladder-engine';
import type {
  SnakeLadderGameState,
  SnakeLadderPlayer,
  SnakeLadderRuleSettings,
} from '../types/snake-and-ladder.types';

export interface UseSnakeLadderEngineReturn {
  engine: SnakeLadderEngine;
  state: SnakeLadderGameState;
  /** Rolls locally. Online seats pass a server-supplied value to `applyRoll`. */
  rollForPlayer: (playerId: string) => number | null;
  /** Applies a dice value decided elsewhere — a remote peer, or a future server. */
  applyRoll: (playerId: string, value: number) => void;
  pause: (playerId: string) => void;
  resume: (playerId: string) => void;
  restart: (players: SnakeLadderPlayer[]) => void;
}

export function useSnakeLadderEngine(
  players: SnakeLadderPlayer[],
  settings: Partial<SnakeLadderRuleSettings> = {},
): UseSnakeLadderEngineReturn {
  const engineRef = useRef<SnakeLadderEngine | null>(null);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  if (!engineRef.current) {
    engineRef.current = new SnakeLadderEngine(players, settings);
    if (players.length >= 2) {
      engineRef.current.startGame(players[0].id);
    }
  }

  const [state, setState] = useState<SnakeLadderGameState>(() => engineRef.current!.getState());

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    return engine.subscribe(setState);
  }, []);

  useEffect(() => {
    return () => engineRef.current?.destroy();
  }, []);

  const restart = useCallback((newPlayers: SnakeLadderPlayer[]) => {
    engineRef.current?.destroy();

    const engine = new SnakeLadderEngine(newPlayers, settingsRef.current);
    engineRef.current = engine;
    if (newPlayers.length >= 2) {
      engine.startGame(newPlayers[0].id);
    }
    setState(engine.getState());
    engine.subscribe(setState);
  }, []);

  const applyRoll = useCallback((playerId: string, value: number) => {
    engineRef.current?.rollDice(playerId, value);
  }, []);

  const rollForPlayer = useCallback((playerId: string) => {
    const engine = engineRef.current;
    if (!engine) return null;

    const value = SnakeLadderDice.roll();
    engine.rollDice(playerId, value);
    return value;
  }, []);

  const pause = useCallback((playerId: string) => engineRef.current?.pauseGame(playerId), []);
  const resume = useCallback((playerId: string) => engineRef.current?.resumeGame(playerId), []);

  return {
    get engine() {
      return engineRef.current!;
    },
    state,
    rollForPlayer,
    applyRoll,
    pause,
    resume,
    restart,
  };
}
