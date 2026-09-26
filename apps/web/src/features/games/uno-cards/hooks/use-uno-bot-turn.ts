'use client';

import { useEffect, useRef } from 'react';
import {
  chooseWildColor,
  drawCardFromDeck,
  getBotAction,
  passTurn,
  playCard,
  GAME_STATUS_PLAYING,
  type UnoGameState,
  type UnoPlayer,
} from '../engine/uno-cards-engine';
import {
  UNO_SOUND_DRAW,
  UNO_SOUND_PLAY,
  UNO_SOUND_WILD,
  type UnoSoundType,
} from '../utils/uno-audio';

function executeBotDecision(
  gameState: UnoGameState,
  activePlayer: UnoPlayer,
  playSound: (type: UnoSoundType) => void,
) {
  const decision = getBotAction(gameState, activePlayer.id);

  if (decision.action === 'play') {
    if (gameState.pendingWildPlayerId === activePlayer.id && decision.chosenColor) {
      chooseWildColor(gameState, activePlayer.id, decision.chosenColor);
      playSound(UNO_SOUND_WILD);
    } else if (decision.cardId) {
      playCard(gameState, activePlayer.id, decision.cardId, decision.chosenColor);
      playSound(UNO_SOUND_PLAY);
    }
  } else if (decision.action === 'draw') {
    drawCardFromDeck(gameState, activePlayer.id);
    playSound(UNO_SOUND_DRAW);
  } else if (decision.action === 'pass') {
    passTurn(gameState, activePlayer.id);
  }
}

export function useUnoBotTurn(
  gameState: UnoGameState,
  setGameState: React.Dispatch<React.SetStateAction<UnoGameState>>,
  playSound: (type: UnoSoundType) => void,
) {
  const botTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (gameState.status !== GAME_STATUS_PLAYING) return;

    const activePlayer = gameState.players[gameState.currentTurnIndex];
    if (!activePlayer.isBot) return;

    botTimerRef.current = setTimeout(() => {
      executeBotDecision(gameState, activePlayer, playSound);
      setGameState({ ...gameState });
    }, 900);

    return () => {
      if (botTimerRef.current) clearTimeout(botTimerRef.current);
    };
  }, [gameState, playSound, setGameState]);

  return {
    clearBotTimer: () => {
      if (botTimerRef.current) clearTimeout(botTimerRef.current);
    },
  };
}
