'use client';

import { useCallback, useRef, useState } from 'react';
import {
  callLastCard,
  chooseWildColor,
  createInitialUnoState,
  drawCardFromDeck,
  passTurn,
  playCard,
  type CardColor,
  type UnoGameState,
} from '../engine/uno-cards-engine';
import {
  playUnoAudio,
  UNO_SOUND_DRAW,
  UNO_SOUND_LAST_CARD,
  UNO_SOUND_PLAY,
  UNO_SOUND_WILD,
  type UnoSoundType,
} from '../utils/uno-audio';
import { useUnoBotTurn } from './use-uno-bot-turn';

export function useUnoGame() {
  const [playerCount, setPlayerCount] = useState<number>(4);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showRules, setShowRules] = useState(false);

  const [gameState, setGameState] = useState<UnoGameState>(() =>
    createInitialUnoState({ playerCount: 4 }),
  );

  const audioCtxRef = useRef<AudioContext | null>(null);

  const playSound = useCallback(
    (type: UnoSoundType) => {
      audioCtxRef.current = playUnoAudio(audioCtxRef.current, type, soundEnabled);
    },
    [soundEnabled],
  );

  const { clearBotTimer } = useUnoBotTurn(gameState, setGameState, playSound);

  const handleRestart = useCallback(
    (count = playerCount) => {
      clearBotTimer();
      setGameState(createInitialUnoState({ playerCount: count }));
      playSound(UNO_SOUND_PLAY);
    },
    [clearBotTimer, playerCount, playSound],
  );

  const handlePlayerPlay = (cardId: string) => {
    const activePlayer = gameState.players[gameState.currentTurnIndex];
    if (activePlayer.isBot) return;

    const res = playCard(gameState, activePlayer.id, cardId);
    if (res.success) {
      playSound(UNO_SOUND_PLAY);
      setGameState({ ...gameState });
    }
  };

  const handlePlayerDraw = () => {
    const activePlayer = gameState.players[gameState.currentTurnIndex];
    if (activePlayer.isBot) return;

    const drawn = drawCardFromDeck(gameState, activePlayer.id);
    if (drawn) {
      playSound(UNO_SOUND_DRAW);
      setGameState({ ...gameState });
    }
  };

  const handlePlayerPass = () => {
    const activePlayer = gameState.players[gameState.currentTurnIndex];
    if (activePlayer.isBot) return;

    if (passTurn(gameState, activePlayer.id)) {
      setGameState({ ...gameState });
    }
  };

  const handleCallLastCard = (playerId: string) => {
    if (callLastCard(gameState, playerId)) {
      playSound(UNO_SOUND_LAST_CARD);
      setGameState({ ...gameState });
    }
  };

  const handleColorChoice = (color: CardColor) => {
    if (!gameState.pendingWildPlayerId) return;
    if (chooseWildColor(gameState, gameState.pendingWildPlayerId, color)) {
      playSound(UNO_SOUND_WILD);
      setGameState({ ...gameState });
    }
  };

  return {
    playerCount,
    setPlayerCount,
    soundEnabled,
    setSoundEnabled,
    showRules,
    setShowRules,
    gameState,
    handleRestart,
    handlePlayerPlay,
    handlePlayerDraw,
    handlePlayerPass,
    handleCallLastCard,
    handleColorChoice,
  };
}
