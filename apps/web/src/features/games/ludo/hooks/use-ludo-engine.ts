import { useCallback, useEffect, useRef, useState } from 'react';
import { DiceService } from '../engine/dice';
import { LudoEngine } from '../engine/ludo-engine';
import type { LudoGameState, LudoPlayer, LudoRuleSettings } from '../types/ludo.types';

export interface UseLudoEngineReturn {
  engine: LudoEngine;
  state: LudoGameState;
  rollForPlayer: (playerId: string) => void;
  movePiece: (playerId: string, pieceId: string) => void;
  pause: (playerId: string) => void;
  resume: (playerId: string) => void;
}

export function useLudoEngine(
  players: LudoPlayer[],
  settings: Partial<LudoRuleSettings> = {},
): UseLudoEngineReturn {
  const engineRef = useRef<LudoEngine | null>(null);
  if (!engineRef.current) {
    engineRef.current = new LudoEngine(players, settings);
  }
  const engine = engineRef.current;

  const [state, setState] = useState<LudoGameState>(() => engine.getState());

  useEffect(() => {
    return engine.subscribe(setState);
  }, [engine]);

  useEffect(() => {
    if (state.status === 'waiting' && players[0]) {
      engine.startGame(players[0].id);
    }
    // Only ever auto-starts once, right after construction.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => engine.destroy?.();
  }, [engine]);

  const rollForPlayer = useCallback(
    (playerId: string) => {
      engine.rollDice(playerId, DiceService.roll());
    },
    [engine],
  );

  const movePiece = useCallback(
    (playerId: string, pieceId: string) => {
      engine.movePiece(playerId, pieceId);
    },
    [engine],
  );

  const pause = useCallback((playerId: string) => engine.pauseGame(playerId), [engine]);
  const resume = useCallback((playerId: string) => engine.resumeGame(playerId), [engine]);

  return { engine, state, rollForPlayer, movePiece, pause, resume };
}
