'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { useArchitectMultiplayerStore } from '@/stores/bad-architect-multiplayer.store';

import { generateBotArchitectVotes, simulateBotBuild } from '../engine/architect-bot';
import {
  advanceRound,
  applyRoundScores,
  calculateAwards,
  createInitialArchitectState,
  DEFAULT_BUILD_TIME,
  emptyGrid,
} from '../engine/architect-engine';
import { getRandomBlueprint } from '../engine/blueprints';
import {
  ARCHITECT_EVENTS,
  type ArchitectCastVotePayload,
  type ArchitectStartPayload,
  type ArchitectSubmitBuildPayload,
  isArchitectCastVotePayload,
  isArchitectPhaseChangePayload,
  isArchitectStartPayload,
  isArchitectSubmitBuildPayload,
} from '../multiplayer/architect-protocol';
import { architectSoundService } from '../services/architect-sound.service';
import type {
  ArchitectDifficulty,
  ArchitectVote,
  BadArchitectState,
  BlockColor,
  Grid8x8,
} from '../types/bad-architect.types';

export function useBadArchitect() {
  const { players, localPlayerId, isHost, transport, roomCode, setStatus, updatePlayerScore } =
    useArchitectMultiplayerStore();

  const [gameState, setGameState] = useState<BadArchitectState | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(DEFAULT_BUILD_TIME);
  const [localGrid, setLocalGrid] = useState<Grid8x8>(emptyGrid());
  const [selectedColor, setSelectedColor] = useState<BlockColor>('#3b82f6');

  // Ref to track latest localGrid for auto-submit
  const localGridRef = useRef<Grid8x8>(localGrid);
  useEffect(() => {
    localGridRef.current = localGrid;
  }, [localGrid]);

  // Sync player scores into multiplayer store when state changes
  useEffect(() => {
    if (!gameState) return;
    for (const p of gameState.players) {
      updatePlayerScore(p.id, p.score);
    }
  }, [gameState, updatePlayerScore]);

  // Round & phase countdown timer
  useEffect(() => {
    if (!gameState || (gameState.phase !== 'briefing' && gameState.phase !== 'building')) {
      return;
    }

    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - gameState.phaseStartTime) / 1000);
      const remaining = Math.max(0, gameState.phaseDurationSeconds - elapsed);
      setTimeLeft(remaining);

      // Warning ticks in last 5 seconds
      if (remaining > 0 && remaining <= 5) {
        architectSoundService.playCountdownTick();
      }

      // Timer expiry handling (Host triggers next phase or auto-progresses)
      if (remaining === 0) {
        if (gameState.phase === 'briefing') {
          // Move from briefing to building
          transitionToPhase('building', gameState.buildDurationSeconds);
        } else if (gameState.phase === 'building') {
          // Time expired for building: Auto-submit local build if builder
          if (
            localPlayerId &&
            gameState.architectId !== localPlayerId &&
            !gameState.submissions[localPlayerId]
          ) {
            submitBuild(localGridRef.current);
          }

          if (isHost()) {
            // Host generates bot builds and advances to reveal
            completeBuildingPhase();
          }
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, localPlayerId, isHost]);

  // Helper to transition phase and broadcast
  const transitionToPhase = useCallback(
    (nextPhase: BadArchitectState['phase'], durationSeconds: number) => {
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
        void transport.send(
          ARCHITECT_EVENTS.phaseChange,
          { phase: nextPhase, durationSeconds },
          localPlayerId,
        );
      }
    },
    [transport, roomCode, localPlayerId],
  );

  // Complete building phase: simulate bot builds, advance to reveal
  const completeBuildingPhase = useCallback(() => {
    setGameState((prev) => {
      if (!prev || prev.phase !== 'building') return prev;

      const submissions = { ...prev.submissions };
      // Simulate builds for any bot builders that haven't submitted
      for (const player of prev.players) {
        if (player.id !== prev.architectId && player.isBot && !submissions[player.id]) {
          submissions[player.id] = simulateBotBuild(prev.blueprint, player.botSkill ?? 'medium');
        }
      }

      architectSoundService.playCurtainReveal();

      return {
        ...prev,
        submissions,
        phase: 'reveal',
        phaseStartTime: Date.now(),
        phaseDurationSeconds: 0,
      };
    });

    if (transport && roomCode && localPlayerId) {
      void transport.send(
        ARCHITECT_EVENTS.phaseChange,
        { phase: 'reveal', durationSeconds: 0 },
        localPlayerId,
      );
    }
  }, [transport, roomCode, localPlayerId]);

  // Start game action
  const startGame = useCallback(
    (
      difficulty: ArchitectDifficulty = 'medium',
      maxRounds = 3,
      buildDuration = DEFAULT_BUILD_TIME,
    ) => {
      const blueprint = getRandomBlueprint(difficulty);
      const initial = createInitialArchitectState({
        players,
        blueprint,
        maxRounds,
        buildDuration,
        difficulty,
      });

      setGameState(initial);
      setLocalGrid(emptyGrid());
      setTimeLeft(10); // 10 seconds briefing
      setStatus('playing');
      architectSoundService.playBlueprintRoll();

      if (transport && roomCode && localPlayerId) {
        const payload: ArchitectStartPayload = {
          difficulty,
          maxRounds,
          buildDuration,
          players,
          blueprint,
        };
        void transport.send(ARCHITECT_EVENTS.start, payload, localPlayerId);
      }
    },
    [players, setStatus, transport, roomCode, localPlayerId],
  );

  // Submit local builder canvas
  const submitBuild = useCallback(
    (grid: Grid8x8) => {
      if (!gameState || gameState.phase !== 'building' || !localPlayerId) return;
      if (gameState.architectId === localPlayerId) return; // Architect does not build

      architectSoundService.playBlockSnap();

      setGameState((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          submissions: {
            ...prev.submissions,
            [localPlayerId]: grid,
          },
        };
      });

      if (transport && roomCode) {
        const payload: ArchitectSubmitBuildPayload = {
          playerId: localPlayerId,
          grid,
        };
        void transport.send(ARCHITECT_EVENTS.submitBuild, payload, localPlayerId);
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

    if (transport && roomCode && localPlayerId) {
      void transport.send(
        ARCHITECT_EVENTS.phaseChange,
        { phase: 'voting', durationSeconds: 0 },
        localPlayerId,
      );
    }
  }, [transport, roomCode, localPlayerId]);

  // Cast vote for closest or funniest
  const castVote = useCallback(
    (award: ArchitectVote['award'], targetBuilderId: string) => {
      if (!gameState || !localPlayerId) return;

      architectSoundService.playBlockSnap();
      const vote: ArchitectVote = {
        voterId: localPlayerId,
        award,
        targetBuilderId,
      };

      setGameState((prev) => {
        if (!prev) return prev;
        const filtered = prev.votes.filter(
          (v) => !(v.voterId === localPlayerId && v.award === award),
        );
        return { ...prev, votes: [...filtered, vote] };
      });

      if (transport && roomCode) {
        const payload: ArchitectCastVotePayload = { vote };
        void transport.send(ARCHITECT_EVENTS.castVote, payload, localPlayerId);
      }
    },
    [gameState, localPlayerId, transport, roomCode],
  );

  // Tally votes, compute scores and awards, transition to round summary
  const finalizeRound = useCallback(() => {
    setGameState((prev) => {
      if (!prev) return prev;

      // Gather bot votes
      const allVotes = [...prev.votes];
      for (const p of prev.players) {
        if (p.isBot) {
          const bVotes = generateBotArchitectVotes(p, prev.submissions, prev.blueprint);
          allVotes.push(...bVotes);
        }
      }

      const awards = calculateAwards(prev.submissions, allVotes, prev.blueprint);
      const updatedState = applyRoundScores(prev, awards, allVotes);

      architectSoundService.playVictoryFanfare();

      return {
        ...updatedState,
        votes: allVotes,
        awardResult: awards,
        phase: updatedState.currentRound >= updatedState.maxRounds ? 'game_over' : 'round_summary',
      };
    });
  }, []);

  // Advance to next round or end game
  const nextRound = useCallback(() => {
    setGameState((prev) => {
      if (!prev) return prev;
      const nextBlueprint = getRandomBlueprint(prev.difficulty);
      const nextState = advanceRound(prev, nextBlueprint);
      setLocalGrid(emptyGrid());
      setTimeLeft(10);
      architectSoundService.playBlueprintRoll();
      return nextState;
    });
  }, []);

  // Restart / return to lobby
  const restartGame = useCallback(() => {
    setGameState(null);
    setLocalGrid(emptyGrid());
    setStatus('lobby');
  }, [setStatus]);

  // Grid editing helpers for BuilderCanvas
  const setCellColor = useCallback(
    (row: number, col: number, color: BlockColor) => {
      if (!gameState || gameState.phase !== 'building') return;
      if (gameState.architectId === localPlayerId) return;

      architectSoundService.playBlockSnap();
      setLocalGrid((prev) => {
        const next: Grid8x8 = prev.map((r, rIdx) =>
          r.map((cell, cIdx) => (rIdx === row && cIdx === col ? color : cell)),
        ) as Grid8x8;
        return next;
      });
    },
    [gameState, localPlayerId],
  );

  const clearCanvas = useCallback(() => {
    architectSoundService.playEraserSwoosh();
    setLocalGrid(emptyGrid());
  }, []);

  // Network message subscriptions
  useEffect(() => {
    if (!transport) return;

    const unsub = transport.onAction((msg) => {
      if (msg.type === ARCHITECT_EVENTS.start && isArchitectStartPayload(msg.payload)) {
        const data = msg.payload;
        const initial = createInitialArchitectState({
          players: data.players,
          blueprint: data.blueprint,
          maxRounds: data.maxRounds,
          buildDuration: data.buildDuration,
          difficulty: data.difficulty,
        });
        setGameState(initial);
        setLocalGrid(emptyGrid());
        setTimeLeft(10);
        setStatus('playing');
        architectSoundService.playBlueprintRoll();
      } else if (
        msg.type === ARCHITECT_EVENTS.submitBuild &&
        isArchitectSubmitBuildPayload(msg.payload)
      ) {
        const data = msg.payload;
        setGameState((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            submissions: {
              ...prev.submissions,
              [data.playerId]: data.grid,
            },
          };
        });
      } else if (
        msg.type === ARCHITECT_EVENTS.castVote &&
        isArchitectCastVotePayload(msg.payload)
      ) {
        const data = msg.payload;
        setGameState((prev) => {
          if (!prev) return prev;
          const filtered = prev.votes.filter(
            (v) => !(v.voterId === data.vote.voterId && v.award === data.vote.award),
          );
          return { ...prev, votes: [...filtered, data.vote] };
        });
      } else if (
        msg.type === ARCHITECT_EVENTS.phaseChange &&
        isArchitectPhaseChangePayload(msg.payload)
      ) {
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
        if (data.phase === 'reveal') {
          architectSoundService.playCurtainReveal();
        }
      }
    });

    return () => {
      unsub();
    };
  }, [transport, setStatus]);

  return {
    gameState,
    timeLeft,
    localGrid,
    selectedColor,
    setSelectedColor,
    setCellColor,
    clearCanvas,
    startGame,
    submitBuild,
    advanceToVoting,
    castVote,
    finalizeRound,
    nextRound,
    restartGame,
  };
}
