'use client';

import { useCallback, useEffect, useState } from 'react';

import { useStoryMultiplayerStore } from '@/stores/one-word-story-multiplayer.store';

import { generateBotVotes, generateBotWord } from '../engine/story-bot';
import {
  addWordToStory,
  calculateFinalPlayerScores,
  compileFullStoryText,
  createInitialStoryState,
  DEFAULT_MAX_WORDS,
  tallyStoryAwards,
  validateWord,
} from '../engine/story-engine';
import { STORY_PROMPTS } from '../engine/story-prompts';
import {
  isStoryAddWordPayload,
  isStoryCastVotePayload,
  isStoryStartPayload,
  STORY_EVENTS,
  type StoryAddWordPayload,
  type StoryCastVotePayload,
  type StoryStartPayload,
} from '../multiplayer/story-protocol';
import { storySoundService } from '../services/story-sound.service';
import type {
  OneWordStoryState,
  StoryAwardType,
  StoryMode,
  StoryPlayer,
  StoryPrompt,
} from '../types/one-word-story.types';

export function useOneWordStory() {
  const { players, localPlayerId, isHost, transport, roomCode, setStatus } =
    useStoryMultiplayerStore();

  const [gameState, setGameState] = useState<OneWordStoryState | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(15);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Sound and turn timer effect
  useEffect(() => {
    if (!gameState || gameState.phase !== 'storytelling') return;

    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - gameState.turnStartTime) / 1000);
      const remaining = Math.max(0, gameState.turnDurationSeconds - elapsed);
      setTimeLeft(remaining);

      // Turn timeout handling: if local player's turn timed out, auto-submit
      if (remaining === 0 && gameState.activePlayerId === localPlayerId) {
        const fallbackWord = 'suddenly,';
        const me = players.find((p) => p.id === localPlayerId);
        if (me) {
          handleWordAdded(fallbackWord, me);
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, localPlayerId, players]);

  // Handle word added locally & broadcast
  const handleWordAdded = useCallback(
    (word: string, author: StoryPlayer) => {
      setGameState((prev) => {
        if (!prev || prev.phase !== 'storytelling') return prev;
        const next = addWordToStory(prev, word, author);
        storySoundService.playTypewriterKey();
        if (next.phase === 'readback') {
          storySoundService.playCarriageBell();
        }
        return next;
      });

      if (transport && roomCode && localPlayerId) {
        const payload: StoryAddWordPayload = { playerId: author.id, word };
        void transport.send(STORY_EVENTS.addWord, payload, localPlayerId);
      }
    },
    [transport, roomCode, localPlayerId],
  );

  // Bot Turn Automation
  useEffect(() => {
    if (!gameState || gameState.phase !== 'storytelling') return;
    if (!isHost()) return; // Host coordinates bot actions

    const activePlayer = players.find((p) => p.id === gameState.activePlayerId);
    if (!activePlayer?.isBot) return;

    const botDelay = 1400 + Math.random() * 1200;
    const timeout = setTimeout(() => {
      const botWord = generateBotWord(activePlayer, gameState);
      handleWordAdded(botWord, activePlayer);
    }, botDelay);

    return () => clearTimeout(timeout);
  }, [gameState, players, isHost, handleWordAdded]);

  // Start game action
  const startGame = useCallback(
    (mode: StoryMode = 'classic', prompt?: StoryPrompt, maxWords = DEFAULT_MAX_WORDS) => {
      const chosenPrompt =
        prompt ?? STORY_PROMPTS[Math.floor(Math.random() * STORY_PROMPTS.length)]!;
      const playerIds = players.map((p) => p.id);
      const initial = createInitialStoryState({
        mode,
        prompt: chosenPrompt,
        playerIds,
        maxWords,
      });

      setGameState(initial);
      setStatus('playing');
      storySoundService.playCarriageBell();

      if (transport && roomCode && localPlayerId) {
        const payload: StoryStartPayload = {
          mode,
          prompt: chosenPrompt,
          players,
          maxWords,
        };
        void transport.send(STORY_EVENTS.start, payload, localPlayerId);
      }
    },
    [players, setStatus, transport, roomCode, localPlayerId],
  );

  // Player submit word
  const submitWord = useCallback(
    (rawWord: string) => {
      if (!gameState || gameState.phase !== 'storytelling') return;
      if (gameState.activePlayerId !== localPlayerId) return;

      const val = validateWord(rawWord);
      if (!val.isValid || !val.cleanedWord) return;

      const me = players.find((p) => p.id === localPlayerId);
      if (!me) return;

      handleWordAdded(val.cleanedWord, me);
    },
    [gameState, localPlayerId, players, handleWordAdded],
  );

  // Cast vote
  const castVote = useCallback(
    (wordId: string, awardType: StoryAwardType) => {
      if (!gameState || !localPlayerId) return;

      storySoundService.playVotePop();
      const newVote = { voterId: localPlayerId, wordId, awardType };

      setGameState((prev) => {
        if (!prev) return prev;
        const filtered = prev.votes.filter(
          (v) => !(v.voterId === localPlayerId && v.awardType === awardType),
        );
        return { ...prev, votes: [...filtered, newVote] };
      });

      if (transport && roomCode) {
        const payload: StoryCastVotePayload = { vote: newVote };
        void transport.send(STORY_EVENTS.castVote, payload, localPlayerId);
      }
    },
    [gameState, localPlayerId, transport, roomCode],
  );

  // Advance to voting phase
  const advanceToVoting = useCallback(() => {
    setGameState((prev) => {
      if (!prev) return prev;
      return { ...prev, phase: 'voting' };
    });
  }, []);

  // Finish voting & compute final score
  const finalizeStory = useCallback(() => {
    setGameState((prev) => {
      if (!prev) return prev;
      // Gather bot votes if not yet cast
      const allVotes = [...prev.votes];
      for (const p of players) {
        if (p.isBot) {
          const bVotes = generateBotVotes(p, prev.words);
          allVotes.push(...bVotes);
        }
      }

      const awards = tallyStoryAwards(prev.words, allVotes);
      const updatedPlayers = calculateFinalPlayerScores(players, prev.words, awards, allVotes);
      const topScorer = [...updatedPlayers].sort((a, b) => b.score - a.score)[0];

      storySoundService.playFanfare();

      return {
        ...prev,
        votes: allVotes,
        awards,
        winnerId: topScorer?.id,
        phase: 'game_over',
      };
    });
  }, [players]);

  // Restart game
  const restartGame = useCallback(() => {
    setGameState(null);
    setStatus('lobby');
  }, [setStatus]);

  // Web Speech API dramatic text-to-speech reader
  const readAloudStory = useCallback(() => {
    if (!gameState || typeof window === 'undefined' || !window.speechSynthesis) return;

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const fullText = compileFullStoryText(gameState.selectedPrompt, gameState.words);
    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.rate = 0.92; // Slightly measured, dramatic pace
    utterance.pitch = 1.05;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [gameState]);

  // Network message subscription
  useEffect(() => {
    if (!transport) return;

    const unsub = transport.onAction((msg) => {
      if (msg.type === STORY_EVENTS.start && isStoryStartPayload(msg.payload)) {
        const data = msg.payload;
        const pIds = data.players.map((p) => p.id);
        const init = createInitialStoryState({
          mode: data.mode,
          prompt: data.prompt,
          playerIds: pIds,
          maxWords: data.maxWords,
        });
        setGameState(init);
        setStatus('playing');
        storySoundService.playCarriageBell();
      } else if (msg.type === STORY_EVENTS.addWord && isStoryAddWordPayload(msg.payload)) {
        const data = msg.payload;
        const author = players.find((p) => p.id === data.playerId) ?? {
          id: data.playerId,
          displayName: 'Player',
          avatar: '✍️',
          score: 0,
          wordsContributed: 0,
          awardsReceived: [],
        };
        handleWordAdded(data.word, author);
      } else if (msg.type === STORY_EVENTS.castVote && isStoryCastVotePayload(msg.payload)) {
        const data = msg.payload;
        setGameState((prev) => {
          if (!prev) return prev;
          const filtered = prev.votes.filter(
            (v) => !(v.voterId === data.vote.voterId && v.awardType === data.vote.awardType),
          );
          return { ...prev, votes: [...filtered, data.vote] };
        });
      }
    });

    return () => {
      unsub();
    };
  }, [transport, players, handleWordAdded, setStatus]);

  return {
    gameState,
    timeLeft,
    isSpeaking,
    startGame,
    submitWord,
    castVote,
    advanceToVoting,
    finalizeStory,
    restartGame,
    readAloudStory,
  };
}
