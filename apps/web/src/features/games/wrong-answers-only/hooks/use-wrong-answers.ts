'use client';

import { useCallback, useEffect, useState } from 'react';

import { useWrongAnswersMultiplayerStore } from '@/stores/wrong-answers-multiplayer.store';

import { generateBotAnswer, generateBotVote } from '../engine/wrong-answers-bot';
import {
  advanceToNextRound as advanceRoundEngine,
  createInitialState,
  submitAnswer as submitAnswerEngine,
  tallyVotesAndScore as tallyVotesEngine,
} from '../engine/wrong-answers-engine';
import {
  WA_EVENTS,
  type WaCastVotePayload,
  type WaPhaseChangePayload,
  type WaSubmitAnswerPayload,
  type WaUpdateStatePayload,
} from '../multiplayer/wrong-answers-protocol';
import { wrongAnswersSoundService } from '../services/wrong-answers-sound.service';
import type {
  SubmittedWrongAnswer,
  WrongAnswersPhase,
  WrongAnswersState,
} from '../types/wrong-answers.types';

export function useWrongAnswers() {
  const { roomCode, localPlayerId, players, transport, isHost, setStatus } =
    useWrongAnswersMultiplayerStore();

  const [gameState, setGameState] = useState<WrongAnswersState | null>(null);
  const [activeSpeechAnswerId, setActiveSpeechAnswerId] = useState<string | null>(null);

  // Initialize game on start
  const startGame = useCallback(() => {
    const initial = createInitialState(players);
    setGameState(initial);
    setStatus('playing');

    if (transport && roomCode && localPlayerId) {
      void transport.send(WA_EVENTS.updateState, { state: initial }, localPlayerId);
    }
  }, [localPlayerId, players, roomCode, setStatus, transport]);

  // Sync state broadcast helper
  const broadcastState = useCallback(
    (newState: WrongAnswersState) => {
      setGameState(newState);
      if (transport && roomCode && localPlayerId) {
        void transport.send(WA_EVENTS.updateState, { state: newState }, localPlayerId);
      }
    },
    [localPlayerId, roomCode, transport],
  );

  // Submit Answer
  const submitAnswer = useCallback(
    (text: string) => {
      if (!localPlayerId || !gameState) return;

      wrongAnswersSoundService.playSubmit();

      if (isHost()) {
        const nextState = submitAnswerEngine(gameState, localPlayerId, text);
        broadcastState(nextState);
      } else if (transport && roomCode && localPlayerId) {
        void transport.send(
          WA_EVENTS.submitAnswer,
          { authorId: localPlayerId, text },
          localPlayerId,
        );
      }
    },
    [broadcastState, gameState, isHost, localPlayerId, roomCode, transport],
  );

  // Cast Vote
  const castVote = useCallback(
    (answerId: string) => {
      if (!localPlayerId || !gameState) return;

      wrongAnswersSoundService.playVoteCast();

      if (isHost()) {
        const afterVote = gameState.answers.find((a) => a.id === answerId);
        if (afterVote && afterVote.authorId !== localPlayerId) {
          const voter = gameState.players.find((p) => p.id === localPlayerId);
          if (voter) {
            const updatedAnswers = gameState.answers.map((a) => {
              const withoutMyVote = a.voterIds.filter((id) => id !== localPlayerId);
              if (a.id === answerId) {
                return {
                  ...a,
                  voterIds: [...withoutMyVote, localPlayerId],
                  voteCount: withoutMyVote.length + 1,
                };
              }
              return { ...a, voterIds: withoutMyVote, voteCount: withoutMyVote.length };
            });
            const updatedPlayers = gameState.players.map((p) =>
              p.id === localPlayerId ? { ...p, votedAnswerId: answerId } : p,
            );
            broadcastState({ ...gameState, answers: updatedAnswers, players: updatedPlayers });
          }
        }
      } else if (transport && roomCode && localPlayerId) {
        void transport.send(
          WA_EVENTS.castVote,
          { voterId: localPlayerId, answerId },
          localPlayerId,
        );
      }
    },
    [broadcastState, gameState, isHost, localPlayerId, roomCode, transport],
  );

  // Host manual or automated phase transition
  const setPhase = useCallback(
    (nextPhase: WrongAnswersPhase, durationSeconds: number) => {
      if (!isHost() || !gameState) return;

      if (nextPhase === 'reveal') {
        const scored = tallyVotesEngine(gameState);
        wrongAnswersSoundService.playWinnerFanfare();
        broadcastState({ ...scored, timeRemaining: durationSeconds });
      } else {
        broadcastState({
          ...gameState,
          phase: nextPhase,
          timeRemaining: durationSeconds,
        });
      }
    },
    [broadcastState, gameState, isHost],
  );

  // Advance round
  const advanceRound = useCallback(() => {
    if (!isHost() || !gameState) return;

    const nextState = advanceRoundEngine(gameState);
    broadcastState(nextState);
  }, [broadcastState, gameState, isHost]);

  // Restart game
  const restartGame = useCallback(() => {
    if (!isHost() || !gameState) return;

    const freshState = createInitialState(gameState.players);
    broadcastState(freshState);
  }, [broadcastState, gameState, isHost]);

  // Bot automation in answering phase
  useEffect(() => {
    if (!isHost() || !gameState || gameState.phase !== 'answering') return;

    const botsWithoutAnswer = gameState.players.filter(
      (p) => p.isBot && !gameState.answers.some((a) => a.authorId === p.id),
    );

    if (botsWithoutAnswer.length === 0) return;

    const timer = setTimeout(() => {
      let updated = gameState;
      for (const bot of botsWithoutAnswer) {
        const botAns = generateBotAnswer(gameState.currentQuestion, bot.botStyle);
        updated = submitAnswerEngine(updated, bot.id, botAns);
      }
      broadcastState(updated);
    }, 2500);

    return () => clearTimeout(timer);
  }, [broadcastState, gameState, isHost]);

  // Auto transition from answering to discussion if all players submitted
  useEffect(() => {
    if (!isHost() || !gameState || gameState.phase !== 'answering') return;

    const allSubmitted =
      gameState.players.length > 0 &&
      gameState.players.every((p) => gameState.answers.some((a) => a.authorId === p.id));

    if (allSubmitted) {
      const timer = setTimeout(() => {
        setPhase('discussion', 40);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [gameState, isHost, setPhase]);

  // Bot automation in voting phase
  useEffect(() => {
    if (!isHost() || !gameState || gameState.phase !== 'voting') return;

    const botsWithoutVote = gameState.players.filter((p) => p.isBot && !p.votedAnswerId);
    if (botsWithoutVote.length === 0) return;

    const timer = setTimeout(() => {
      let updated = gameState;
      for (const bot of botsWithoutVote) {
        const voteId = generateBotVote(bot, gameState.answers);
        if (voteId) {
          const updatedAnswers = updated.answers.map((a) => {
            const withoutVote = a.voterIds.filter((id) => id !== bot.id);
            if (a.id === voteId) {
              return {
                ...a,
                voterIds: [...withoutVote, bot.id],
                voteCount: withoutVote.length + 1,
              };
            }
            return { ...a, voterIds: withoutVote, voteCount: withoutVote.length };
          });
          const updatedPlayers = updated.players.map((p) =>
            p.id === bot.id ? { ...p, votedAnswerId: voteId } : p,
          );
          updated = { ...updated, answers: updatedAnswers, players: updatedPlayers };
        }
      }
      broadcastState(updated);
    }, 3000);

    return () => clearTimeout(timer);
  }, [broadcastState, gameState, isHost]);

  // Auto transition to reveal when all players voted
  useEffect(() => {
    if (!isHost() || !gameState || gameState.phase !== 'voting') return;

    const allVoted =
      gameState.players.length > 0 && gameState.players.every((p) => p.votedAnswerId !== null);

    if (allVoted) {
      const timer = setTimeout(() => {
        setPhase('reveal', 20);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [gameState, isHost, setPhase]);

  // Main countdown timer
  useEffect(() => {
    if (!isHost() || !gameState || gameState.timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setGameState((prev) => {
        if (!prev) return null;
        if (prev.timeRemaining <= 1) {
          // Auto advance based on phase
          if (prev.phase === 'answering') {
            setTimeout(() => setPhase('discussion', 40), 0);
          } else if (prev.phase === 'voting') {
            setTimeout(() => setPhase('reveal', 20), 0);
          }
          return { ...prev, timeRemaining: 0 };
        }
        if (prev.timeRemaining <= 5 && prev.phase === 'answering') {
          wrongAnswersSoundService.playTick();
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState?.phase, gameState?.timeRemaining, isHost, setPhase]);

  // Speech recitation of an answer
  const readAnswerAloud = useCallback((answer: SubmittedWrongAnswer) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(answer.text);
    utterance.rate = 0.95;
    utterance.pitch = 1.05;

    utterance.onstart = () => setActiveSpeechAnswerId(answer.id);
    utterance.onend = () => setActiveSpeechAnswerId(null);
    utterance.onerror = () => setActiveSpeechAnswerId(null);

    window.speechSynthesis.speak(utterance);
  }, []);

  const stopReading = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    setActiveSpeechAnswerId(null);
  }, []);

  // Multiplayer action listeners
  useEffect(() => {
    if (!transport) return;

    const unsub = transport.onAction((msg) => {
      if (msg.type === WA_EVENTS.updateState) {
        const payload = msg.payload as WaUpdateStatePayload;
        setGameState(payload.state);
        return;
      }

      if (!isHost()) return;

      if (msg.type === WA_EVENTS.submitAnswer) {
        const payload = msg.payload as WaSubmitAnswerPayload;
        setGameState((prev) => {
          if (!prev) return null;
          const next = submitAnswerEngine(prev, payload.authorId, payload.text);
          broadcastState(next);
          return next;
        });
      } else if (msg.type === WA_EVENTS.castVote) {
        const payload = msg.payload as WaCastVotePayload;
        setGameState((prev) => {
          if (!prev) return null;
          const updatedAnswers = prev.answers.map((a) => {
            const withoutVote = a.voterIds.filter((id) => id !== payload.voterId);
            if (a.id === payload.answerId) {
              return {
                ...a,
                voterIds: [...withoutVote, payload.voterId],
                voteCount: withoutVote.length + 1,
              };
            }
            return { ...a, voterIds: withoutVote, voteCount: withoutVote.length };
          });
          const updatedPlayers = prev.players.map((p) =>
            p.id === payload.voterId ? { ...p, votedAnswerId: payload.answerId } : p,
          );
          const next = { ...prev, answers: updatedAnswers, players: updatedPlayers };
          broadcastState(next);
          return next;
        });
      } else if (msg.type === WA_EVENTS.phaseChange) {
        const payload = msg.payload as WaPhaseChangePayload;
        setPhase(payload.phase, payload.durationSeconds);
      } else if (msg.type === WA_EVENTS.restart) {
        restartGame();
      }
    });

    return () => {
      unsub();
    };
  }, [broadcastState, isHost, restartGame, setPhase, transport]);

  return {
    gameState,
    localPlayerId,
    isHost: isHost(),
    activeSpeechAnswerId,
    startGame,
    submitAnswer,
    castVote,
    setPhase,
    advanceRound,
    restartGame,
    readAnswerAloud,
    stopReading,
  };
}
