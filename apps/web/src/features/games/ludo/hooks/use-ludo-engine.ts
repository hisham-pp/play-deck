import { useCallback, useEffect, useRef, useState } from 'react';
import { DiceService } from '../engine/dice';
import { LudoEngine } from '../engine/ludo-engine';
import type { LudoGameState, LudoPlayer, LudoRuleSettings } from '../types/ludo.types';

export interface UseLudoEngineReturn {
  engine: LudoEngine;
  state: LudoGameState;
  rollForPlayer: (playerId: string) => void;
  applyRoll: (playerId: string, value: number) => void;
  movePiece: (playerId: string, pieceId: string) => void;
  pause: (playerId: string) => void;
  resume: (playerId: string) => void;
  restart: (players: LudoPlayer[]) => void;
}

export function useLudoEngine(
  players: LudoPlayer[],
  settings: Partial<LudoRuleSettings> = {},
): UseLudoEngineReturn {
  const engineRef = useRef<LudoEngine | null>(null);

  if (!engineRef.current) {
    engineRef.current = new LudoEngine(players, settings);
    if (players.length >= 2) {
      engineRef.current.startGame(players[0].id);
    }
  }

  const [state, setState] = useState<LudoGameState>(() => engineRef.current!.getState());

  const restart = useCallback(
    (newPlayers: LudoPlayer[]) => {
      if (engineRef.current) {
        engineRef.current.destroy?.();
      }
      const newEngine = new LudoEngine(newPlayers, settings);
      engineRef.current = newEngine;
      if (newPlayers.length >= 2) {
        newEngine.startGame(newPlayers[0].id);
      }
      setState(newEngine.getState());
      newEngine.subscribe(setState);
    },
    [settings],
  );

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    return engine.subscribe(setState);
  }, []);

  useEffect(() => {
    return () => engineRef.current?.destroy?.();
  }, []);

  const rollForPlayer = useCallback((playerId: string) => {
    if (engineRef.current) {
      engineRef.current.rollDice(playerId, DiceService.roll());
    }
  }, []);

  const applyRoll = useCallback((playerId: string, value: number) => {
    if (engineRef.current) {
      engineRef.current.rollDice(playerId, value);
    }
  }, []);

  const movePiece = useCallback((playerId: string, pieceId: string) => {
    if (engineRef.current) {
      engineRef.current.movePiece(playerId, pieceId);
    }
  }, []);

  const pause = useCallback((playerId: string) => {
    engineRef.current?.pauseGame(playerId);
  }, []);

  const resume = useCallback((playerId: string) => {
    engineRef.current?.resumeGame(playerId);
  }, []);

  return {
    get engine() {
      return engineRef.current!;
    },
    state,
    rollForPlayer,
    applyRoll,
    movePiece,
    pause,
    resume,
    restart,
  };
}
