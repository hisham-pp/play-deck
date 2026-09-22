'use client';

import { useCallback, useEffect, useState } from 'react';

import { useLieMultiplayerStore } from '@/stores/guess-the-lie-multiplayer.store';

import { generateBotAnswer, generateBotVote } from '../engine/lie-bot';
import {
  advanceRound as advanceRoundEngine,
  calculateRoundScores,
  createInitialLieState,
  DEFAULT_ANSWER_TIME,
  DEFAULT_DISCUSSION_TIME,
  recordVote,
  registerAnswer,
  shuffleArray,
} from '../engine/lie-engine';
import { getRandomPrompt } from '../engine/lie-prompts';
import {
  isLieCastVotePayload,
  isLiePhaseChangePayload,
  isLieStartPayload,
  isLieSubmitAnswerPayload,
  LIE_EVENTS,
  type LieCastVotePayload,
  type LiePhaseChangePayload,
  type LieStartPayload,
  type LieSubmitAnswerPayload,
} from '../multiplayer/lie-protocol';
import { lieSoundService } from '../services/lie-sound.service';
import type {
  GuessTheLiePhase,
  GuessTheLieState,
  PromptCategory,
} from '../types/guess-the-lie.types';

export function useGuessTheLie() {
  const { players, localPlayerId, isHost, transport, roomCode, setStatus, updatePlayerScore } =
    useLieMultiplayerStore();

  const [gameState, setGameState] = useState<GuessTheLieState | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(DEFAULT_ANSWER_TIME);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Sync player scores into multiplayer store
  useEffect(() => {
    if (!gameState) return;
    for (const p of gameState.players) {
      updatePlayerScore(p.id, p.score);
    }
  }, [gameState, updatePlayerScore]);

  // Phase transition and network broadcast helper
  const transitionToPhase = useCallback(
    (nextPhase: GuessTheLiePhase, durationSeconds: number) => {
      setGameState((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          phase: nextPhase,
          phaseStartTime: Date.now(),
          phaseDurationSeconds: durationSeconds,
        };
      });

      if (transport && roomCode && localPlayerId) {
        const payload: LiePhaseChangePayload = {
          phase: nextPhase,
          durationSeconds,
        };
        void transport.send(LIE_EVENTS.phaseChange, payload, localPlayerId);
      }
    },
    [transport, roomCode, localPlayerId],
  );

  // Auto-complete answering phase: populate bot answers and transition to discussion
  const completeAnsweringPhase = useCallback(() => {
    setGameState((prev) => {
      if (!prev || prev.phase !== 'answering') return prev;

      let nextState = { ...prev };
      // Generate bot answers if any bot hasn't submitted yet
      for (const p of nextState.players) {
        if (p.isBot && !nextState.answers.some((a) => a.authorId === p.id)) {
          const botAns = generateBotAnswer(p, nextState.currentPrompt);
          nextState = registerAnswer(nextState, p, botAns);
        }
      }

      // Shuffle answers so position doesn't reveal author or liar
      const shuffledAnswers = shuffleArray(nextState.answers);

      lieSoundService.playCardFlip();

      return {
        ...nextState,
        answers: shuffledAnswers,
        phase: 'discussion',
        phaseStartTime: Date.now(),
        phaseDurationSeconds: nextState.discussionDurationSeconds,
      };
    });

    if (transport && roomCode && localPlayerId) {
      void transport.send(
        LIE_EVENTS.phaseChange,
        { phase: 'discussion', durationSeconds: gameState?.discussionDurationSeconds ?? 60 },
        localPlayerId,
      );
    }
  }, [transport, roomCode, localPlayerId, gameState?.discussionDurationSeconds]);

  // Phase countdown timer
  useEffect(() => {
    if (
      !gameState ||
      (gameState.phase !== 'briefing' &&
        gameState.phase !== 'answering' &&
        gameState.phase !== 'discussion')
    ) {
      return;
    }

    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - gameState.phaseStartTime) / 1000);
      const remaining = Math.max(0, gameState.phaseDurationSeconds - elapsed);
      setTimeLeft(remaining);

      if (gameState.phase === 'discussion' && remaining <= 5 && remaining > 0) {
        lieSoundService.playDiscussionTick();
      }

      if (remaining === 0) {
        if (gameState.phase === 'briefing') {
          // Briefing finished -> Start answering
          transitionToPhase('answering', gameState.answerDurationSeconds);
        } else if (gameState.phase === 'answering') {
          // Answering time expired: If host, gather bot answers and advance to discussion
          if (isHost()) {
            completeAnsweringPhase();
          }
        } else if (gameState.phase === 'discussion') {
          // Discussion time expired -> Advance to voting
          transitionToPhase('voting', 0);
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, isHost, transitionToPhase, completeAnsweringPhase]);

  // Start game action
  const startGame = useCallback(
    (
      category: PromptCategory | 'all' = 'all',
      maxRounds = 3,
      answerDuration = DEFAULT_ANSWER_TIME,
      discussionDuration = DEFAULT_DISCUSSION_TIME,
    ) => {
      const prompt = getRandomPrompt(category);
      const initial = createInitialLieState({
        players,
        category,
        prompt,
        maxRounds,
        answerDuration,
        discussionDuration,
      });

      setGameState(initial);
      setTimeLeft(6); // 6 seconds briefing
      setStatus('playing');
      lieSoundService.playCardFlip();

      if (transport && roomCode && localPlayerId) {
        const payload: LieStartPayload = {
          category,
          maxRounds,
          answerDuration,
          discussionDuration,
          players,
          prompt,
        };
        void transport.send(LIE_EVENTS.start, payload, localPlayerId);
      }
    },
    [players, setStatus, transport, roomCode, localPlayerId],
  );

  // Submit player's answer
  const submitAnswer = useCallback(
    (text: string) => {
      if (!gameState || gameState.phase !== 'answering' || !localPlayerId) return;

      const me = gameState.players.find((p) => p.id === localPlayerId);
      if (!me) return;

      lieSoundService.playSubmitAnswer();

      setGameState((prev) => {
        if (!prev) return prev;
        return registerAnswer(prev, me, text);
      });

      if (transport && roomCode) {
        const payload: LieSubmitAnswerPayload = {
          playerId: localPlayerId,
          text,
        };
        void transport.send(LIE_EVENTS.submitAnswer, payload, localPlayerId);
      }
    },
    [gameState, localPlayerId, transport, roomCode],
  );

  // Advance from discussion to voting
  const advanceToVoting = useCallback(() => {
    transitionToPhase('voting', 0);
    lieSoundService.playCardFlip();
  }, [transitionToPhase]);

  // Cast vote on which answer is the lie
  const castVote = useCallback(
    (answerId: string) => {
      if (!gameState || gameState.phase !== 'voting' || !localPlayerId) return;

      lieSoundService.playVoteCast();

      setGameState((prev) => {
        if (!prev) return prev;
        return recordVote(prev, localPlayerId, answerId);
      });

      if (transport && roomCode) {
        const payload: LieCastVotePayload = {
          voterId: localPlayerId,
          answerId,
        };
        void transport.send(LIE_EVENTS.castVote, payload, localPlayerId);
      }
    },
    [gameState, localPlayerId, transport, roomCode],
  );

  // Finalize round: collect bot votes, calculate points, transition to reveal
  const finalizeRound = useCallback(() => {
    setGameState((prev) => {
      if (!prev) return prev;

      let withBotVotes = { ...prev };
      // Cast votes for all bots that haven't voted yet
      for (const p of withBotVotes.players) {
        if (p.isBot && !p.votedAnswerId) {
          const voteId = generateBotVote(p, withBotVotes.answers);
          if (voteId) {
            withBotVotes = recordVote(withBotVotes, p.id, voteId);
          }
        }
      }

      const { updatedPlayers, roundResult } = calculateRoundScores(withBotVotes);

      lieSoundService.playLiarReveal();

      return {
        ...withBotVotes,
        players: updatedPlayers,
        roundResult,
        phase: 'reveal',
      };
    });
  }, []);

  // Next round
  const nextRound = useCallback(() => {
    setGameState((prev) => {
      if (!prev) return prev;
      const nextPrompt = getRandomPrompt(prev.category);
      const nextState = advanceRoundEngine(prev, nextPrompt);
      setTimeLeft(6);
      lieSoundService.playCardFlip();
      return nextState;
    });
  }, []);

  // Restart / return to lobby
  const restartGame = useCallback(() => {
    setGameState(null);
    setStatus('lobby');
  }, [setStatus]);

  // Text-to-speech dramatic reader for submitted answers
  const readAloudAnswers = useCallback(() => {
    if (!gameState || typeof window === 'undefined' || !window.speechSynthesis) return;

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const lines = gameState.answers.map((a, i) => `Answer ${i + 1}: ${a.text}`).join('. ... ');
    const fullText = `Here are the submitted answers. One of them is a deliberate lie! ... ${lines}`;

    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.rate = 0.95;
    utterance.pitch = 1.05;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [gameState]);

  // Network message subscriptions
  useEffect(() => {
    if (!transport) return;

    const unsub = transport.onAction((msg) => {
      if (msg.type === LIE_EVENTS.start && isLieStartPayload(msg.payload)) {
        const data = msg.payload;
        const initial = createInitialLieState({
          players: data.players,
          category: data.category,
          prompt: data.prompt,
          maxRounds: data.maxRounds,
          answerDuration: data.answerDuration,
          discussionDuration: data.discussionDuration,
        });
        setGameState(initial);
        setTimeLeft(6);
        setStatus('playing');
        lieSoundService.playCardFlip();
      } else if (msg.type === LIE_EVENTS.submitAnswer && isLieSubmitAnswerPayload(msg.payload)) {
        const data = msg.payload;
        setGameState((prev) => {
          if (!prev) return prev;
          const author = prev.players.find((p) => p.id === data.playerId);
          if (!author) return prev;
          return registerAnswer(prev, author, data.text);
        });
      } else if (msg.type === LIE_EVENTS.castVote && isLieCastVotePayload(msg.payload)) {
        const data = msg.payload;
        setGameState((prev) => {
          if (!prev) return prev;
          return recordVote(prev, data.voterId, data.answerId);
        });
      } else if (msg.type === LIE_EVENTS.phaseChange && isLiePhaseChangePayload(msg.payload)) {
        const data = msg.payload;
        setGameState((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            phase: data.phase,
            phaseDurationSeconds: data.durationSeconds,
            phaseStartTime: Date.now(),
          };
        });
      }
    });

    return () => {
      unsub();
    };
  }, [transport, setStatus]);

  return {
    gameState,
    timeLeft,
    isSpeaking,
    startGame,
    submitAnswer,
    advanceToVoting,
    castVote,
    finalizeRound,
    nextRound,
    restartGame,
    readAloudAnswers,
  };
}
