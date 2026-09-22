'use client';

import { useCallback, useEffect, useState } from 'react';

import { useWhoAmIMultiplayerStore } from '@/stores/who-am-i-multiplayer.store';

import { generateBotAnswer, generateBotGuess, generateBotQuestion } from '../engine/who-am-i-bot';
import {
  answerQuestion as answerEngine,
  askQuestion as askEngine,
  createInitialState,
  passTurn as passEngine,
  proceedToGuessing as proceedGuessEngine,
  submitGuess as guessEngine,
} from '../engine/who-am-i-engine';
import {
  WHO_AM_I_EVENTS,
  type WaiAnswerQuestionPayload,
  type WaiAskQuestionPayload,
  type WaiPassTurnPayload,
  type WaiSubmitGuessPayload,
  type WaiUpdateStatePayload,
} from '../multiplayer/who-am-i-protocol';
import { whoAmISoundService } from '../services/who-am-i-sound.service';
import type { IdentityCategory, VoteAnswer, WhoAmIState } from '../types/who-am-i.types';

export function useWhoAmI() {
  const { roomCode, localPlayerId, players, transport, isHost, setStatus } =
    useWhoAmIMultiplayerStore();

  const [gameState, setGameState] = useState<WhoAmIState | null>(null);

  const broadcastState = useCallback(
    (nextState: WhoAmIState) => {
      setGameState(nextState);
      if (transport && roomCode && localPlayerId) {
        void transport.send(WHO_AM_I_EVENTS.updateState, { state: nextState }, localPlayerId);
      }
    },
    [localPlayerId, roomCode, transport],
  );

  const startGame = useCallback(
    (category: IdentityCategory = 'all') => {
      const initial = createInitialState(players, category);
      setGameState(initial);
      setStatus('playing');

      if (transport && roomCode && localPlayerId) {
        void transport.send(WHO_AM_I_EVENTS.updateState, { state: initial }, localPlayerId);
      }
    },
    [localPlayerId, players, roomCode, setStatus, transport],
  );

  const ask = useCallback(
    (questionText: string) => {
      if (!localPlayerId || !gameState) return;

      whoAmISoundService.playQuestionChime();

      if (isHost()) {
        const nextState = askEngine(gameState, questionText);
        broadcastState(nextState);
      } else if (transport && roomCode && localPlayerId) {
        void transport.send(
          WHO_AM_I_EVENTS.askQuestion,
          { questionerId: localPlayerId, questionText },
          localPlayerId,
        );
      }
    },
    [broadcastState, gameState, isHost, localPlayerId, roomCode, transport],
  );

  const answer = useCallback(
    (vote: VoteAnswer) => {
      if (!localPlayerId || !gameState) return;

      whoAmISoundService.playAnswerVote();

      if (isHost()) {
        const nextState = answerEngine(gameState, localPlayerId, vote);
        broadcastState(nextState);
      } else if (transport && roomCode && localPlayerId) {
        void transport.send(
          WHO_AM_I_EVENTS.answerQuestion,
          { respondentId: localPlayerId, answer: vote },
          localPlayerId,
        );
      }
    },
    [broadcastState, gameState, isHost, localPlayerId, roomCode, transport],
  );

  const guess = useCallback(
    (guessText: string) => {
      if (!localPlayerId || !gameState) return;

      if (isHost()) {
        const nextState = guessEngine(gameState, localPlayerId, guessText);
        if (nextState.isLastGuessCorrect) {
          whoAmISoundService.playCorrectGuess();
        } else {
          whoAmISoundService.playWrongBuzzer();
        }
        broadcastState(nextState);
      } else if (transport && roomCode && localPlayerId) {
        void transport.send(
          WHO_AM_I_EVENTS.submitGuess,
          { playerId: localPlayerId, guessText },
          localPlayerId,
        );
      }
    },
    [broadcastState, gameState, isHost, localPlayerId, roomCode, transport],
  );

  const pass = useCallback(() => {
    if (!localPlayerId || !gameState) return;

    if (isHost()) {
      const nextState = passEngine(gameState, localPlayerId);
      broadcastState(nextState);
    } else if (transport && roomCode && localPlayerId) {
      void transport.send(WHO_AM_I_EVENTS.passTurn, { playerId: localPlayerId }, localPlayerId);
    }
  }, [broadcastState, gameState, isHost, localPlayerId, roomCode, transport]);

  const restartGame = useCallback(() => {
    if (!isHost() || !gameState) return;
    const fresh = createInitialState(gameState.players, gameState.category);
    broadcastState(fresh);
  }, [broadcastState, gameState, isHost]);

  // Bot automation: asking questions
  useEffect(() => {
    if (!isHost() || !gameState || gameState.phase !== 'questioning') return;

    const active = gameState.players.find((p) => p.id === gameState.currentTurnPlayerId);
    if (!active || !active.isBot) return;

    const timer = setTimeout(() => {
      const botQ = generateBotQuestion(active);
      const nextState = askEngine(gameState, botQ);
      broadcastState(nextState);
    }, 2400);

    return () => clearTimeout(timer);
  }, [broadcastState, gameState, isHost]);

  // Bot automation: answering questions
  useEffect(() => {
    if (!isHost() || !gameState || gameState.phase !== 'answering') return;

    const latestLog = gameState.qaLog[0];
    if (!latestLog) return;

    const activeQuestioner = gameState.players.find((p) => p.id === gameState.currentTurnPlayerId);
    if (!activeQuestioner) return;

    const unansweredBots = gameState.players.filter(
      (p) =>
        p.isBot &&
        p.id !== gameState.currentTurnPlayerId &&
        !latestLog.yesVotes.includes(p.id) &&
        !latestLog.noVotes.includes(p.id) &&
        !latestLog.maybeVotes.includes(p.id),
    );

    if (unansweredBots.length === 0) return;

    const timer = setTimeout(() => {
      let updated = gameState;
      for (const bot of unansweredBots) {
        const botAns = generateBotAnswer(latestLog.questionText, activeQuestioner.identity);
        updated = answerEngine(updated, bot.id, botAns);
      }
      broadcastState(updated);
    }, 1800);

    return () => clearTimeout(timer);
  }, [broadcastState, gameState, isHost]);

  // Bot automation: guessing or passing
  useEffect(() => {
    if (!isHost() || !gameState || gameState.phase !== 'guessing') return;

    const active = gameState.players.find((p) => p.id === gameState.currentTurnPlayerId);
    if (!active || !active.isBot) return;

    const timer = setTimeout(() => {
      const botGuess = generateBotGuess(active);
      let nextState: WhoAmIState;
      if (botGuess) {
        nextState = guessEngine(gameState, active.id, botGuess);
        if (nextState.isLastGuessCorrect) {
          whoAmISoundService.playCorrectGuess();
        } else {
          whoAmISoundService.playWrongBuzzer();
        }
      } else {
        nextState = passEngine(gameState, active.id);
      }
      broadcastState(nextState);
    }, 2500);

    return () => clearTimeout(timer);
  }, [broadcastState, gameState, isHost]);

  // Network listener
  useEffect(() => {
    if (!transport) return;

    const unsub = transport.onAction((msg) => {
      if (msg.type === WHO_AM_I_EVENTS.updateState) {
        const payload = msg.payload as WaiUpdateStatePayload;
        setGameState(payload.state);
        return;
      }

      if (!isHost()) return;

      if (msg.type === WHO_AM_I_EVENTS.askQuestion) {
        const payload = msg.payload as WaiAskQuestionPayload;
        setGameState((prev) => {
          if (!prev) return null;
          const next = askEngine(prev, payload.questionText);
          broadcastState(next);
          return next;
        });
      } else if (msg.type === WHO_AM_I_EVENTS.answerQuestion) {
        const payload = msg.payload as WaiAnswerQuestionPayload;
        setGameState((prev) => {
          if (!prev) return null;
          const next = answerEngine(prev, payload.respondentId, payload.answer);
          broadcastState(next);
          return next;
        });
      } else if (msg.type === WHO_AM_I_EVENTS.submitGuess) {
        const payload = msg.payload as WaiSubmitGuessPayload;
        setGameState((prev) => {
          if (!prev) return null;
          const next = guessEngine(prev, payload.playerId, payload.guessText);
          broadcastState(next);
          return next;
        });
      } else if (msg.type === WHO_AM_I_EVENTS.passTurn) {
        const payload = msg.payload as WaiPassTurnPayload;
        setGameState((prev) => {
          if (!prev) return null;
          const next = passEngine(prev, payload.playerId);
          broadcastState(next);
          return next;
        });
      }
    });

    return () => unsub();
  }, [broadcastState, isHost, transport]);

  return {
    gameState,
    localPlayerId,
    isHost: isHost(),
    startGame,
    ask,
    answer,
    guess,
    pass,
    proceedToGuessing: () => {
      if (gameState && isHost()) {
        const next = proceedGuessEngine(gameState);
        broadcastState(next);
      }
    },
    restartGame,
  };
}
