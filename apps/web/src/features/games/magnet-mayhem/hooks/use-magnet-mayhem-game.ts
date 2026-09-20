'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useMagnetMayhemMultiplayerStore } from '@/stores/magnet-mayhem-multiplayer.store';
import {
  createInitialArenaState,
  DEFAULT_ARENA_HEIGHT,
  DEFAULT_ARENA_WIDTH,
  stepMagnetSimulation,
} from '../engine/magnet-engine';
import { MM_MSG } from '../multiplayer/magnet-mayhem-protocol';
import type {
  MMPlayerSyncPayload,
  MMTargetCollectPayload,
} from '../multiplayer/magnet-mayhem-protocol';
import { renderMagnetArena } from '../render/magnet-renderer';
import { magnetSoundService } from '../services/magnet-sound.service';
import { magnetStatsRepository } from '../services/magnet-stats-repository';
import type { MagnetAction, MagnetArenaState, MagnetPlayer } from '../types/magnet-mayhem.types';

export interface UseMagnetMayhemGameProps {
  isMultiplayer: boolean;
  botCount?: number;
  roundDurationSec?: number;
  onVictory?: (winner: MagnetPlayer, score: number) => void;
}

export function useMagnetMayhemGame({
  isMultiplayer,
  botCount = 3,
  roundDurationSec = 60,
  onVictory,
}: UseMagnetMayhemGameProps) {
  const storePlayers = useMagnetMayhemMultiplayerStore((state) => state.players);
  const storeLocalPlayerId = useMagnetMayhemMultiplayerStore((state) => state.localPlayerId);
  const storeTransport = useMagnetMayhemMultiplayerStore((state) => state.transport);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const localPlayerId = isMultiplayer ? storeLocalPlayerId : 'player-local';

  const [arena, setArena] = useState<MagnetArenaState>(() => {
    let initialPlayers: Array<{
      id: string;
      name: string;
      avatar: string;
      isBot: boolean;
      isHost: boolean;
    }>;

    if (isMultiplayer && storePlayers.length > 0) {
      initialPlayers = storePlayers.map((p) => ({
        id: p.id,
        name: p.name,
        avatar: p.avatar,
        isBot: p.isBot,
        isHost: p.isHost,
      }));
    } else {
      const human = {
        id: 'player-local',
        name: 'You',
        avatar: '🧲',
        isBot: false,
        isHost: true,
      };

      const bots = [];
      const botNames = ['Magneto-Bot', 'Flux-AI', 'Polaris'];
      for (let i = 1; i <= Math.min(3, botCount); i++) {
        bots.push({
          id: `bot-${i}`,
          name: botNames[i - 1] || `Bot ${i}`,
          avatar: '🤖',
          isBot: true,
          isHost: false,
        });
      }
      initialPlayers = [human, ...bots];
    }

    return createInitialArenaState(initialPlayers, {
      width: DEFAULT_ARENA_WIDTH,
      height: DEFAULT_ARENA_HEIGHT,
      roundDurationSec,
    });
  });

  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState<MagnetPlayer | null>(null);

  const mousePosRef = useRef<{ x: number; y: number }>({
    x: DEFAULT_ARENA_WIDTH / 2,
    y: DEFAULT_ARENA_HEIGHT / 2,
  });
  const localActionRef = useRef<MagnetAction>('idle');
  const touchActionRef = useRef<MagnetAction>('idle');
  const lastTimeRef = useRef<number | null>(null);
  const nextSyncTimeRef = useRef<number>(0);
  const lastCountdownBeepRef = useRef<number>(4);

  // Keyboard and mouse input bindings
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.code === 'Space' || e.code === 'KeyZ') {
        e.preventDefault();
        localActionRef.current = 'attract';
      } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyX') {
        e.preventDefault();
        localActionRef.current = 'repel';
      }
    }

    function handleKeyUp(e: KeyboardEvent) {
      if (
        e.code === 'Space' ||
        e.code === 'KeyZ' ||
        e.code === 'ShiftLeft' ||
        e.code === 'ShiftRight' ||
        e.code === 'KeyX'
      ) {
        localActionRef.current = 'idle';
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Pointer / Mouse events on canvas
  const handlePointerMove = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    mousePosRef.current = {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }, []);

  const handlePointerDown = useCallback((button: number) => {
    if (button === 2) {
      // Right click -> Repel
      localActionRef.current = 'repel';
    } else {
      // Left click / touch -> Attract
      localActionRef.current = 'attract';
    }
  }, []);

  const handlePointerUp = useCallback(() => {
    localActionRef.current = 'idle';
  }, []);

  const setTouchAction = useCallback((action: MagnetAction) => {
    touchActionRef.current = action;
  }, []);

  // Multiplayer network events
  useEffect(() => {
    if (!isMultiplayer || !storeTransport) return;

    storeTransport.onAction((msg) => {
      if (msg.type === MM_MSG.PLAYER_SYNC) {
        const payload = msg.payload as MMPlayerSyncPayload;
        if (payload.playerId !== localPlayerId) {
          setArena((prev) => ({
            ...prev,
            players: prev.players.map((p) =>
              p.id === payload.playerId
                ? {
                    ...p,
                    position: payload.position,
                    velocity: payload.velocity,
                    aimAngle: payload.aimAngle,
                    action: payload.action,
                    energy: payload.energy,
                    score: payload.score,
                  }
                : p,
            ),
          }));
        }
      } else if (msg.type === MM_MSG.TARGET_COLLECT) {
        const payload = msg.payload as MMTargetCollectPayload;
        magnetSoundService.playTargetPickup(payload.tier);
      }
    });
  }, [isMultiplayer, storeTransport, localPlayerId]);

  const restartGame = useCallback(() => {
    setArena((prev) =>
      createInitialArenaState(
        prev.players.map((p) => ({
          id: p.id,
          name: p.name,
          avatar: p.avatar,
          isBot: p.isBot,
          isHost: p.isHost,
        })),
        {
          width: DEFAULT_ARENA_WIDTH,
          height: DEFAULT_ARENA_HEIGHT,
          roundDurationSec,
        },
      ),
    );
    setIsGameOver(false);
    setWinner(null);
    lastTimeRef.current = null;
    lastCountdownBeepRef.current = 4;
  }, [roundDurationSec]);

  // Main 60fps game loop
  useEffect(() => {
    let animId: number;

    const tick = (now: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = now;
      }
      const rawDt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;
      const dt = Math.min(rawDt, 0.05);

      setArena((currentArena) => {
        if (currentArena.isGameOver) return currentArena;

        // Countdown audio cue
        if (currentArena.roundPhase === 'countdown') {
          const secCeil = Math.ceil(currentArena.countdownSec);
          if (secCeil < lastCountdownBeepRef.current && secCeil >= 0) {
            lastCountdownBeepRef.current = secCeil;
            magnetSoundService.playCountdown(secCeil === 0);
          }
        }

        // Apply local player aim and action
        const me = currentArena.players.find((p) => p.id === localPlayerId);
        if (me) {
          const aimDeltaX = mousePosRef.current.x - me.position.x;
          const aimDeltaY = mousePosRef.current.y - me.position.y;
          if (Math.hypot(aimDeltaX, aimDeltaY) > 5) {
            me.aimAngle = Math.atan2(aimDeltaY, aimDeltaX);
          }

          // Merge desktop and touch actions
          const chosenAction =
            touchActionRef.current !== 'idle' ? touchActionRef.current : localActionRef.current;
          me.action = chosenAction;
        }

        // Step physics simulation
        const nextState = stepMagnetSimulation(currentArena, dt, {
          onTargetCollected: (_player, target) => {
            magnetSoundService.playTargetPickup(target.tier);
          },
          onHazardZapped: () => {
            magnetSoundService.playHazardZap();
          },
          onWallBounce: (_player, speed) => {
            magnetSoundService.playWallBounce(speed);
          },
          onRepelFired: () => {
            magnetSoundService.playRepelBlast();
          },
          onAttractTether: () => {
            magnetSoundService.playAttractPulse();
          },
        });

        // Game over check
        if (nextState.isGameOver && !isGameOver) {
          setIsGameOver(true);
          magnetSoundService.playVictory();

          const winningPlayer = nextState.players.find((p) => p.id === nextState.winnerId) ?? null;
          setWinner(winningPlayer);

          const won = nextState.winnerId === localPlayerId;
          const localStats = nextState.players.find((p) => p.id === localPlayerId);
          if (localStats) {
            magnetStatsRepository.recordMatchCompletion(
              won,
              localStats.score,
              localStats.targetHitCount,
              localStats.slingshotCount,
              localStats.repelHitCount,
            );
          }

          if (onVictory && winningPlayer) {
            onVictory(winningPlayer, winningPlayer.score);
          }
        }

        // Multiplayer snapshot broadcast
        if (isMultiplayer && storeTransport && now > nextSyncTimeRef.current) {
          nextSyncTimeRef.current = now + 45;
          const myPlayer = nextState.players.find((p) => p.id === localPlayerId);
          if (myPlayer) {
            const payload: MMPlayerSyncPayload = {
              playerId: myPlayer.id,
              position: myPlayer.position,
              velocity: myPlayer.velocity,
              aimAngle: myPlayer.aimAngle,
              action: myPlayer.action,
              energy: myPlayer.energy,
              score: myPlayer.score,
            };
            storeTransport.send(MM_MSG.PLAYER_SYNC, payload, myPlayer.id);
          }
        }

        return nextState;
      });

      // Render canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          renderMagnetArena(ctx, arena, localPlayerId || undefined);
        }
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [localPlayerId, isMultiplayer, storeTransport, isGameOver, onVictory, arena]);

  const localPlayer = arena.players.find((p) => p.id === localPlayerId) ?? null;

  return {
    canvasRef,
    arena,
    localPlayer,
    isGameOver,
    winner,
    restartGame,
    handlePointerMove,
    handlePointerDown,
    handlePointerUp,
    setTouchAction,
  };
}
