'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createInitialPongState,
  pausePongGame,
  restartPongGame,
  startOrResumePong,
  stepPongGame,
} from '../engine/pong-engine';
import type {
  Particle,
  PongConfig,
  PongDifficulty,
  PongInputs,
  PongMode,
  PongState,
  PongStats,
} from '../engine/pong-types';
import { pongSoundService } from '../services/pong-sound.service';
import { DEFAULT_PONG_STATS, pongStatsRepository } from '../services/pong-stats-repository';

import type { PongSnapshotPayload } from './use-pong-multiplayer';

export interface UsePongEngineProps {
  onGameOver?: (winner: 'left' | 'right', p1Score: number, p2Score: number) => void;
  inputs: PongInputs;
  isGuest?: boolean;
}

export function usePongEngine({ onGameOver, inputs, isGuest = false }: UsePongEngineProps) {
  const [state, setState] = useState<PongState>(() => createInitialPongState());
  const [stats, setStats] = useState<PongStats>(DEFAULT_PONG_STATS);
  const [particles, setParticles] = useState<Particle[]>([]);

  const stateRef = useRef<PongState>(state);
  stateRef.current = state;

  const isGuestRef = useRef(isGuest);
  isGuestRef.current = isGuest;

  const inputsRef = useRef<PongInputs>(inputs);
  inputsRef.current = inputs;

  const particlesRef = useRef<Particle[]>([]);
  particlesRef.current = particles;

  const onGameOverRef = useRef(onGameOver);
  onGameOverRef.current = onGameOver;

  const particleIdCounter = useRef(0);

  // Load stats on mount
  const refreshStats = useCallback(async () => {
    try {
      const loaded = await pongStatsRepository.getStats();
      setStats(loaded);
    } catch {
      // Ignore initial stats load error
    }
  }, []);

  useEffect(() => {
    void refreshStats();
  }, [refreshStats]);

  // Particle spawner on paddle hit
  const spawnHitParticles = useCallback((x: number, y: number, side: 'left' | 'right') => {
    const count = 12;
    const newParticles: Particle[] = [];
    const baseAngle = side === 'left' ? 0 : Math.PI;

    for (let i = 0; i < count; i++) {
      const spread = (Math.random() - 0.5) * Math.PI * 0.8;
      const angle = baseAngle + spread;
      const speed = 120 + Math.random() * 260;

      newParticles.push({
        id: ++particleIdCounter.current,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.35 + Math.random() * 0.25,
        maxLife: 0.6,
        color: side === 'left' ? '#06b6d4' : '#f59e0b',
        size: 2 + Math.random() * 3,
      });
    }

    particlesRef.current = [...particlesRef.current, ...newParticles];
  }, []);

  // Main loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const deltaMs = now - lastTime;
      lastTime = now;

      // Cap delta time to prevent spiraling after tab unfocus
      const dt = Math.min(deltaMs / 1000, 0.05);

      const currentState = stateRef.current;

      // Update particles
      if (particlesRef.current.length > 0) {
        const nextParticles = particlesRef.current
          .map((p) => ({
            ...p,
            x: p.x + p.vx * dt,
            y: p.y + p.vy * dt,
            life: p.life - dt,
          }))
          .filter((p) => p.life > 0);

        particlesRef.current = nextParticles;
        setParticles(nextParticles);
      }

      if (currentState.status === 'playing' && !isGuestRef.current) {
        const { state: nextState, events } = stepPongGame(currentState, inputsRef.current, dt);

        if (events.length > 0) {
          events.forEach((event) => {
            switch (event.type) {
              case 'paddle-hit':
                pongSoundService.playPaddleHit(event.ballSpeed);
                if (event.side) {
                  const hitX =
                    event.side === 'left'
                      ? nextState.player1.x + nextState.player1.width
                      : nextState.player2.x;
                  spawnHitParticles(hitX, nextState.ball.y, event.side);
                }
                break;
              case 'wall-hit':
                pongSoundService.playWallBounce();
                break;
              case 'point-scored':
                pongSoundService.playScore(event.scorer === 'left');
                break;
              case 'serve-launched':
                pongSoundService.playServe();
                break;
              case 'game-won': {
                const won = event.winner === 'left';
                if (won) {
                  pongSoundService.playVictory();
                } else {
                  pongSoundService.playGameOver();
                }

                const isAi = nextState.config.mode === 'single-player';
                void pongStatsRepository
                  .recordGameResult(
                    won,
                    isAi,
                    nextState.config.difficulty,
                    nextState.player1.score,
                    event.rally || nextState.highestRallyInGame,
                  )
                  .then(setStats);

                if (event.winner) {
                  onGameOverRef.current?.(
                    event.winner,
                    nextState.player1.score,
                    nextState.player2.score,
                  );
                }
                break;
              }
            }
          });
        }

        stateRef.current = nextState;
        setState(nextState);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [spawnHitParticles]);

  const startGame = useCallback(() => {
    setState((prev) => {
      const next = startOrResumePong(prev);
      stateRef.current = next;
      return next;
    });
  }, []);

  const pauseGame = useCallback(() => {
    setState((prev) => {
      const next = pausePongGame(prev);
      stateRef.current = next;
      return next;
    });
  }, []);

  const resumeGame = useCallback(() => {
    setState((prev) => {
      const next = startOrResumePong(prev);
      stateRef.current = next;
      return next;
    });
  }, []);

  const restartGame = useCallback((newConfig?: Partial<PongConfig>) => {
    setState((prev) => {
      const next = restartPongGame(prev, newConfig);
      stateRef.current = next;
      return next;
    });
    particlesRef.current = [];
    setParticles([]);
  }, []);

  const setMode = useCallback(
    (mode: PongMode) => {
      restartGame({ mode });
    },
    [restartGame],
  );

  const setDifficulty = useCallback(
    (difficulty: PongDifficulty) => {
      restartGame({ difficulty });
    },
    [restartGame],
  );

  const setWinningScore = useCallback(
    (winningScore: number) => {
      restartGame({ winningScore });
    },
    [restartGame],
  );

  const applySnapshot = useCallback(
    (snapshot: PongSnapshotPayload) => {
      setState((prev) => {
        const nextState: PongState = {
          ...prev,
          ball: snapshot.ball,
          player1: snapshot.player1,
          player2: snapshot.player2,
          status: snapshot.status,
          servePending: snapshot.servePending,
          serverSide: snapshot.serverSide,
          serveCountdown: snapshot.serveCountdown,
          rally: snapshot.rally,
          highestRallyInGame: snapshot.highestRallyInGame,
          winner: snapshot.winner,
        };

        // Sound & particle feedback on guest
        if (nextState.rally > prev.rally) {
          pongSoundService.playPaddleHit(nextState.ball.speed);
          const side = nextState.ball.vx > 0 ? 'left' : 'right';
          const hitX =
            side === 'left' ? nextState.player1.x + nextState.player1.width : nextState.player2.x;
          spawnHitParticles(hitX, nextState.ball.y, side);
        } else if (
          nextState.player1.score > prev.player1.score ||
          nextState.player2.score > prev.player2.score
        ) {
          pongSoundService.playScore(nextState.player1.score > prev.player1.score);
        }

        if (nextState.winner && !prev.winner) {
          if (nextState.winner === 'right') {
            pongSoundService.playVictory();
          } else {
            pongSoundService.playGameOver();
          }
          onGameOverRef.current?.(
            nextState.winner,
            nextState.player1.score,
            nextState.player2.score,
          );
        }

        stateRef.current = nextState;
        return nextState;
      });
    },
    [spawnHitParticles],
  );

  return {
    state,
    stats,
    particles,
    startGame,
    pauseGame,
    resumeGame,
    restartGame,
    setMode,
    setDifficulty,
    setWinningScore,
    refreshStats,
    applySnapshot,
  };
}
