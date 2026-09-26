import { useEffect, useRef, useState } from 'react';
import { createCustomBotDefinition, getBotDefinition } from '../bots/bot-registry';
import { DiceService } from '../engine/dice';
import type { LudoEngine } from '../engine/ludo-engine';
import type { LudoGameState, LudoPlayer } from '../types/ludo.types';

const MIN_THINKING_MS = 400;
const MAX_THINKING_MS = 900;

function randomThinkingDelay(): number {
  return MIN_THINKING_MS + Math.random() * (MAX_THINKING_MS - MIN_THINKING_MS);
}

export interface UseLudoBotTurnReturn {
  botThinking: boolean;
  thinkingBotName: string | null;
}

/**
 * Drives bot turns entirely outside the engine: it only ever reads state,
 * waits a natural human-like delay, and dispatches through the same
 * rollDice/movePiece paths a human player would use. The engine itself has
 * no concept of "bot" - that identity lives on the seat roster (`players`),
 * not on the engine's own per-seat game state.
 */
export function useLudoBotTurn(
  engine: LudoEngine,
  state: LudoGameState,
  players: LudoPlayer[],
  options?: {
    enabled?: boolean;
    onBotRoll?: (playerId: string, value: number) => void;
    onBotMove?: (playerId: string, pieceId: string) => void;
  },
): UseLudoBotTurnReturn {
  const enabled = options?.enabled ?? true;
  const onBotRoll = options?.onBotRoll;
  const onBotMove = options?.onBotMove;

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlightRef = useRef(false);
  const [botThinking, setBotThinking] = useState(false);
  const [thinkingBotName, setThinkingBotName] = useState<string | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (!enabled || state.status !== 'playing' || inFlightRef.current) {
      return;
    }

    const seatPlayer = players.find((p) => p.seatIndex === state.currentTurnSeatIndex);
    if (!seatPlayer || seatPlayer.type !== 'bot' || !seatPlayer.botConfig) {
      setBotThinking(false);
      setThinkingBotName(null);
      return;
    }

    const { botConfig } = seatPlayer;
    const botDef =
      (botConfig.botDefinitionId && getBotDefinition(botConfig.botDefinitionId)) ||
      createCustomBotDefinition(
        botConfig.difficulty,
        botConfig.personality,
        seatPlayer.displayName,
      );

    setBotThinking(true);
    setThinkingBotName(botDef.name);
    inFlightRef.current = true;

    timeoutRef.current = setTimeout(() => {
      inFlightRef.current = false;
      const current = engine.getState();
      if (
        current.status !== 'playing' ||
        current.currentTurnSeatIndex !== state.currentTurnSeatIndex
      ) {
        setBotThinking(false);
        return;
      }

      if (current.turnPhase === 'awaiting-roll') {
        const val = DiceService.roll();
        if (onBotRoll) {
          onBotRoll(seatPlayer.id, val);
        } else {
          engine.rollDice(seatPlayer.id, val);
        }
      } else if (current.turnPhase === 'awaiting-move') {
        const legalActions = engine.getLegalActions(current.currentTurnSeatIndex);
        if (legalActions.length > 0) {
          const chosen = botDef.strategy.chooseAction(current, seatPlayer.id, legalActions);
          if (chosen.type === 'MOVE_PIECE') {
            if (onBotMove) {
              onBotMove(seatPlayer.id, chosen.payload.pieceId);
            } else {
              engine.movePiece(seatPlayer.id, chosen.payload.pieceId);
            }
          }
        }
      }
      setBotThinking(false);
    }, randomThinkingDelay());

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [engine, state, players, enabled, onBotRoll, onBotMove]);

  return { botThinking, thinkingBotName };
}
