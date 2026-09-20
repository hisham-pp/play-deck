'use client';

import { useCallback, useEffect, useState } from 'react';

import { useTelephoneMultiplayerStore } from '@/stores/telephone-drawing-multiplayer.store';

import {
  generateBotDescription,
  generateBotDrawing,
  generateBotMutationVote,
} from '../engine/telephone-bot';
import {
  advanceReveal as advanceRevealEngine,
  castMutationVote as castMutationVoteEngine,
  createInitialState,
  getStepTypeForIndex,
  submitDescriptionStep as submitDescEngine,
  submitDrawingStep as submitDrawEngine,
  tallyFinalScores as tallyScoresEngine,
} from '../engine/telephone-engine';
import {
  TELEPHONE_EVENTS,
  type TelCastVotePayload,
  type TelSubmitDescriptionPayload,
  type TelSubmitDrawingPayload,
  type TelUpdateStatePayload,
} from '../multiplayer/telephone-protocol';
import { telephoneSoundService } from '../services/telephone-sound.service';
import type { TelephoneState } from '../types/telephone-drawing.types';

export function useTelephoneDrawing() {
  const { roomCode, localPlayerId, players, transport, isHost, setStatus } =
    useTelephoneMultiplayerStore();

  const [gameState, setGameState] = useState<TelephoneState | null>(null);

  // Broadcast state helper
  const broadcastState = useCallback(
    (newState: TelephoneState) => {
      setGameState(newState);
      if (transport && roomCode && localPlayerId) {
        void transport.send(TELEPHONE_EVENTS.updateState, { state: newState }, localPlayerId);
      }
    },
    [localPlayerId, roomCode, transport],
  );

  // Initialize game
  const startGame = useCallback(() => {
    const initial = createInitialState(players);
    setGameState(initial);
    setStatus('playing');

    if (transport && roomCode && localPlayerId) {
      void transport.send(TELEPHONE_EVENTS.updateState, { state: initial }, localPlayerId);
    }
  }, [localPlayerId, players, roomCode, setStatus, transport]);

  // Submit Drawing
  const submitDrawing = useCallback(
    (drawingData: string) => {
      if (!localPlayerId || !gameState) return;

      telephoneSoundService.playTurnSubmit();

      if (isHost()) {
        const nextState = submitDrawEngine(gameState, localPlayerId, drawingData);
        broadcastState(nextState);
      } else if (transport && roomCode && localPlayerId) {
        void transport.send(
          TELEPHONE_EVENTS.submitDrawing,
          { playerId: localPlayerId, drawingData },
          localPlayerId,
        );
      }
    },
    [broadcastState, gameState, isHost, localPlayerId, roomCode, transport],
  );

  // Submit Description
  const submitDescription = useCallback(
    (text: string) => {
      if (!localPlayerId || !gameState) return;

      telephoneSoundService.playTurnSubmit();

      if (isHost()) {
        const nextState = submitDescEngine(gameState, localPlayerId, text);
        broadcastState(nextState);
      } else if (transport && roomCode && localPlayerId) {
        void transport.send(
          TELEPHONE_EVENTS.submitDescription,
          { playerId: localPlayerId, text },
          localPlayerId,
        );
      }
    },
    [broadcastState, gameState, isHost, localPlayerId, roomCode, transport],
  );

  // Advance Reveal slide
  const advanceReveal = useCallback(() => {
    if (!isHost() || !gameState) return;

    telephoneSoundService.playPageTurn();
    const nextState = advanceRevealEngine(gameState);
    broadcastState(nextState);
  }, [broadcastState, gameState, isHost]);

  // Cast Mutation Vote
  const castVote = useCallback(
    (stepIndex: number) => {
      if (!localPlayerId || !gameState) return;

      telephoneSoundService.playStroke();

      if (isHost()) {
        const nextState = castMutationVoteEngine(gameState, localPlayerId, stepIndex);
        broadcastState(nextState);
      } else if (transport && roomCode && localPlayerId) {
        void transport.send(
          TELEPHONE_EVENTS.castVote,
          { voterId: localPlayerId, stepIndex },
          localPlayerId,
        );
      }
    },
    [broadcastState, gameState, isHost, localPlayerId, roomCode, transport],
  );

  // Finalize scores
  const finalizeScores = useCallback(() => {
    if (!isHost() || !gameState) return;

    telephoneSoundService.playFanfare();
    const scored = tallyScoresEngine(gameState);
    broadcastState(scored);
  }, [broadcastState, gameState, isHost]);

  // Restart game
  const restartGame = useCallback(() => {
    if (!isHost() || !gameState) return;

    const fresh = createInitialState(gameState.players);
    broadcastState(fresh);
  }, [broadcastState, gameState, isHost]);

  // Bot automation during turn phase
  useEffect(() => {
    if (!isHost() || !gameState || gameState.phase !== 'turn') return;

    const activePlayer = gameState.players.find((p) => p.id === gameState.activePlayerId);
    if (!activePlayer || !activePlayer.isBot) return;

    const stepType = getStepTypeForIndex(gameState.currentStepIndex);
    const previousStep = gameState.steps[gameState.steps.length - 1];

    const timer = setTimeout(() => {
      let updated: TelephoneState;
      if (stepType === 'draw') {
        const prevPrompt = previousStep?.description ?? gameState.initialPhrase;
        const botSketch = generateBotDrawing(activePlayer.botStyle, prevPrompt);
        updated = submitDrawEngine(gameState, activePlayer.id, botSketch);
      } else {
        const botDesc = generateBotDescription(previousStep, gameState.initialPhrase);
        updated = submitDescEngine(gameState, activePlayer.id, botDesc);
      }
      broadcastState(updated);
    }, 2800);

    return () => clearTimeout(timer);
  }, [broadcastState, gameState, isHost]);

  // Bot automation in voting phase
  useEffect(() => {
    if (!isHost() || !gameState || gameState.phase !== 'voting') return;

    const botsWithoutVote = gameState.players.filter((p) => p.isBot && p.votedStepIndex === null);
    if (botsWithoutVote.length === 0) return;

    const timer = setTimeout(() => {
      let updated = gameState;
      for (const bot of botsWithoutVote) {
        const voteIndex = generateBotMutationVote(bot, gameState.steps);
        if (voteIndex !== null) {
          updated = castMutationVoteEngine(updated, bot.id, voteIndex);
        }
      }
      broadcastState(updated);
    }, 2500);

    return () => clearTimeout(timer);
  }, [broadcastState, gameState, isHost]);

  // Auto finalize voting when all players have voted
  useEffect(() => {
    if (!isHost() || !gameState || gameState.phase !== 'voting') return;

    const allVoted =
      gameState.players.length > 0 && gameState.players.every((p) => p.votedStepIndex !== null);

    if (allVoted) {
      const timer = setTimeout(() => {
        finalizeScores();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [finalizeScores, gameState, isHost]);

  // Countdown timer in turn phase
  useEffect(() => {
    if (!isHost() || !gameState || gameState.phase !== 'turn' || gameState.timeRemaining <= 0)
      return;

    const interval = setInterval(() => {
      setGameState((prev) => {
        if (!prev) return null;
        if (prev.timeRemaining <= 1) {
          // Time expired, auto submit default content for active player
          const stepType = getStepTypeForIndex(prev.currentStepIndex);
          const active = prev.players.find((p) => p.id === prev.activePlayerId);
          if (active) {
            let next: TelephoneState;
            if (stepType === 'draw') {
              next = submitDrawEngine(prev, active.id, generateBotDrawing('doodler'));
            } else {
              next = submitDescEngine(prev, active.id, 'Ran out of time!');
            }
            setTimeout(() => broadcastState(next), 0);
          }
          return { ...prev, timeRemaining: 0 };
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [broadcastState, gameState?.phase, gameState?.timeRemaining, isHost]);

  // Network action listeners
  useEffect(() => {
    if (!transport) return;

    const unsub = transport.onAction((msg) => {
      if (msg.type === TELEPHONE_EVENTS.updateState) {
        const payload = msg.payload as TelUpdateStatePayload;
        setGameState(payload.state);
        return;
      }

      if (!isHost()) return;

      if (msg.type === TELEPHONE_EVENTS.submitDrawing) {
        const payload = msg.payload as TelSubmitDrawingPayload;
        setGameState((prev) => {
          if (!prev) return null;
          const next = submitDrawEngine(prev, payload.playerId, payload.drawingData);
          broadcastState(next);
          return next;
        });
      } else if (msg.type === TELEPHONE_EVENTS.submitDescription) {
        const payload = msg.payload as TelSubmitDescriptionPayload;
        setGameState((prev) => {
          if (!prev) return null;
          const next = submitDescEngine(prev, payload.playerId, payload.text);
          broadcastState(next);
          return next;
        });
      } else if (msg.type === TELEPHONE_EVENTS.castVote) {
        const payload = msg.payload as TelCastVotePayload;
        setGameState((prev) => {
          if (!prev) return null;
          const next = castMutationVoteEngine(prev, payload.voterId, payload.stepIndex);
          broadcastState(next);
          return next;
        });
      }
    });

    return () => {
      unsub();
    };
  }, [broadcastState, isHost, transport]);

  return {
    gameState,
    localPlayerId,
    isHost: isHost(),
    startGame,
    submitDrawing,
    submitDescription,
    advanceReveal,
    castVote,
    finalizeScores,
    restartGame,
  };
}
