import { useCallback, useEffect, useRef, useState } from 'react';
import {
  computeBotMove,
  createInitialGameState,
  executeAction,
  type PlayerSetupConfig,
} from '../engine/tiny-island-engine';
import type { GameAction, IslandGameState } from '../engine/tiny-island-types';
import { islandSound } from '../services/island-sound.service';

interface UseTinyIslandEngineProps {
  onActionBroadcast?: (action: GameAction) => void;
  onStateBroadcast?: (state: IslandGameState) => void;
  isHost?: boolean;
}

export function useTinyIslandEngine({
  onActionBroadcast,
  onStateBroadcast,
  isHost = true,
}: UseTinyIslandEngineProps = {}) {
  const [gameState, setGameState] = useState<IslandGameState>(() =>
    createInitialGameState([
      { id: 'player-1', displayName: 'Player 1', avatar: '🌴', isBot: false },
      { id: 'bot-1', displayName: 'Chuck', avatar: '🦜', isBot: true },
    ]),
  );

  const botTimerRef = useRef<NodeJS.Timeout | null>(null);

  const startMatch = useCallback(
    (configs: PlayerSetupConfig[]) => {
      if (botTimerRef.current) clearTimeout(botTimerRef.current);
      const initial = createInitialGameState(configs);
      setGameState(initial);
      islandSound.playTurnChime();
      if (onStateBroadcast && isHost) {
        onStateBroadcast(initial);
      }
    },
    [onStateBroadcast, isHost],
  );

  const playActionSound = useCallback((action: GameAction) => {
    switch (action.type) {
      case 'MOVE':
        islandSound.playMove();
        break;
      case 'GATHER':
        islandSound.playGather();
        break;
      case 'BUILD_BRIDGE':
      case 'BUILD_BARRIER':
      case 'CRAFT_RAFT':
      case 'CRAFT_SPEAR':
        islandSound.playBuild();
        break;
      case 'PUSH':
        islandSound.playPush();
        break;
      case 'PASS':
        break;
      default:
        break;
    }
  }, []);

  const performAction = useCallback(
    (action: GameAction) => {
      setGameState((prev) => {
        const next = executeAction(prev, action);
        playActionSound(action);

        if (next.phase === 'game_over' && prev.phase !== 'game_over') {
          islandSound.playVictory();
        } else if (next.round > prev.round) {
          islandSound.playSinkWarning();
        }

        if (onActionBroadcast) {
          onActionBroadcast(action);
        }
        if (onStateBroadcast && isHost) {
          onStateBroadcast(next);
        }
        return next;
      });
    },
    [playActionSound, onActionBroadcast, onStateBroadcast, isHost],
  );

  const applyRemoteAction = useCallback(
    (action: GameAction) => {
      setGameState((prev) => {
        const next = executeAction(prev, action);
        playActionSound(action);
        if (next.phase === 'game_over' && prev.phase !== 'game_over') {
          islandSound.playVictory();
        } else if (next.round > prev.round) {
          islandSound.playSinkWarning();
        }
        return next;
      });
    },
    [playActionSound],
  );

  const applyRemoteState = useCallback((state: IslandGameState) => {
    setGameState(state);
  }, []);

  // Bot Turn Automation (runs only on host or in solo/local play)
  useEffect(() => {
    if (gameState.phase !== 'playing') return;
    if (!isHost) return; // In multiplayer, only the host calculates bot moves to avoid race conditions

    const activePlayer = gameState.players.find(
      (p) => p.seatIndex === gameState.currentTurnSeatIndex,
    );
    if (!activePlayer || !activePlayer.isAlive || !activePlayer.isBot) {
      return;
    }

    botTimerRef.current = setTimeout(() => {
      const botAction = computeBotMove(gameState, activePlayer.seatIndex);
      performAction(botAction);
    }, 700);

    return () => {
      if (botTimerRef.current) clearTimeout(botTimerRef.current);
    };
  }, [gameState, isHost, performAction]);

  return {
    gameState,
    startMatch,
    performAction,
    applyRemoteAction,
    applyRemoteState,
  };
}
