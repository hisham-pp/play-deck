'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { useFloorIsLavaMultiplayerStore } from '@/stores/floor-is-lava-multiplayer.store';

import { computeLavaBotDecision } from '../engine/lava-bot';
import {
  createInitialArena,
  DEFAULT_ARENA_CONFIG,
  executePush,
  spawnPowerUps,
  updateLavaPhysics,
} from '../engine/lava-tile-engine';
import type { PlayerMoveInput } from '../engine/lava-tile-engine';
import { FIL_MSG } from '../multiplayer/floor-is-lava-protocol';
import type {
  FILEliminationPayload,
  FILPlayerSyncPayload,
  FILPushActionPayload,
} from '../multiplayer/floor-is-lava-protocol';
import { renderFloorIsLavaFrame } from '../render/floor-is-lava-renderer';
import { floorIsLavaSoundService } from '../services/floor-is-lava-sound.service';
import { floorIsLavaStatsRepository } from '../services/floor-is-lava-stats-repository';
import type { ArenaState, LavaPlayer } from '../types/floor-is-lava.types';

export interface UseFloorIsLavaGameProps {
  isMultiplayer: boolean;
  botCount?: number;
  onVictory?: (winner: LavaPlayer, survivalSec: number) => void;
}

export function useFloorIsLavaGame({
  isMultiplayer,
  botCount = 3,
  onVictory,
}: UseFloorIsLavaGameProps) {
  const storePlayers = useFloorIsLavaMultiplayerStore((state) => state.players);
  const storeLocalPlayerId = useFloorIsLavaMultiplayerStore((state) => state.localPlayerId);
  const storeTransport = useFloorIsLavaMultiplayerStore((state) => state.transport);
  const lavaSpeed = useFloorIsLavaMultiplayerStore((state) => state.lavaSpeedMultiplier);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const localPlayerId = isMultiplayer ? storeLocalPlayerId : 'player-local';

  const [arena, setArena] = useState<ArenaState>(() => {
    let initialPlayers: LavaPlayer[];

    if (isMultiplayer && storePlayers.length > 0) {
      initialPlayers = storePlayers;
    } else {
      // Local play: 1 human + bots
      const human: LavaPlayer = {
        id: 'player-local',
        name: 'You',
        avatar: '🔥',
        color: '#38bdf8',
        isBot: false,
        isHost: true,
        ready: true,
        isAlive: true,
        position: { x: 0, y: 0 },
        velocity: { x: 0, y: 0 },
        radius: 16,
        pushCooldown: 0,
        isPushing: false,
        activePowerUp: null,
        hasDoubleJumpReady: false,
      };

      const bots: LavaPlayer[] = [];
      const botColors = ['#f59e0b', '#ef4444', '#10b981', '#a855f7', '#ec4899'];
      for (let i = 1; i <= botCount; i++) {
        bots.push({
          id: `bot-${i}`,
          name: `Lava-Bot ${i}`,
          avatar: '🤖',
          color: botColors[(i - 1) % botColors.length],
          isBot: true,
          isHost: false,
          ready: true,
          isAlive: true,
          position: { x: 0, y: 0 },
          velocity: { x: 0, y: 0 },
          radius: 16,
          pushCooldown: 0,
          isPushing: false,
          activePowerUp: null,
          hasDoubleJumpReady: false,
        });
      }

      initialPlayers = [human, ...bots];
    }

    const config = { ...DEFAULT_ARENA_CONFIG, lavaSpeedMultiplier: lavaSpeed };
    return createInitialArena(initialPlayers, config);
  });

  const [elapsedSec, setElapsedSec] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState<LavaPlayer | null>(null);

  const keysPressed = useRef<Record<string, boolean>>({});
  const lastTimeRef = useRef<number | null>(null);
  const nextPowerUpSpawnRef = useRef<number>(5.0);
  const nextSyncTimeRef = useRef<number>(0);
  const localPushesRef = useRef<number>(0);
  const localPowerUpsRef = useRef<number>(0);

  // Keyboard input listeners
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      keysPressed.current[e.code] = true;

      if (e.code === 'Space') {
        e.preventDefault();
      }
    }

    function handleKeyUp(e: KeyboardEvent) {
      keysPressed.current[e.code] = false;
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Handle multiplayer wire events
  useEffect(() => {
    if (!isMultiplayer || !storeTransport) return;

    storeTransport.onAction((msg) => {
      if (msg.type === FIL_MSG.PLAYER_SYNC) {
        const payload = msg.payload as FILPlayerSyncPayload;
        if (payload.playerId !== localPlayerId) {
          setArena((prev) => ({
            ...prev,
            players: prev.players.map((p) =>
              p.id === payload.playerId
                ? {
                    ...p,
                    position: payload.position,
                    velocity: payload.velocity,
                    isAlive: payload.isAlive,
                  }
                : p,
            ),
          }));
        }
      } else if (msg.type === FIL_MSG.PUSH_ACTION) {
        const payload = msg.payload as FILPushActionPayload;
        floorIsLavaSoundService.playPush();
        if (payload.targetId === localPlayerId) {
          // React to push
          setArena((prev) => {
            const me = prev.players.find((p) => p.id === localPlayerId);
            if (me) {
              me.velocity.x += payload.force;
            }
            return { ...prev };
          });
        }
      } else if (msg.type === FIL_MSG.ELIMINATION) {
        floorIsLavaSoundService.playSizzle();
      }
    });
  }, [isMultiplayer, storeTransport, localPlayerId]);

  const triggerPush = useCallback(() => {
    setArena((prev) => {
      const me = prev.players.find((p) => p.id === localPlayerId);
      if (!me || me.pushCooldown > 0 || !me.isAlive) return prev;

      const res = executePush(me, prev);
      if (me.activePowerUp?.type === 'super-push') {
        floorIsLavaSoundService.playSuperPush();
      } else {
        floorIsLavaSoundService.playPush();
      }

      localPushesRef.current += res.targets.length;

      if (isMultiplayer && storeTransport) {
        res.targets.forEach((t) => {
          const payload: FILPushActionPayload = {
            pusherId: me.id,
            targetId: t.id,
            force: res.force,
          };
          storeTransport.send(FIL_MSG.PUSH_ACTION, payload, me.id);
        });
      }

      return { ...prev };
    });
  }, [localPlayerId, isMultiplayer, storeTransport]);

  const restartGame = useCallback(() => {
    const config = { ...DEFAULT_ARENA_CONFIG, lavaSpeedMultiplier: lavaSpeed };
    setArena((prev) => createInitialArena(prev.players, config));
    setElapsedSec(0);
    setIsGameOver(false);
    setWinner(null);
    lastTimeRef.current = null;
    localPushesRef.current = 0;
    localPowerUpsRef.current = 0;
  }, [lavaSpeed]);

  // Main animation and physics tick loop
  useEffect(() => {
    let animId: number;

    const tick = (now: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = now;
      }
      const rawDt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;
      const dt = Math.min(rawDt, 0.05);

      setElapsedSec((prev) => prev + dt);

      // Compile local inputs
      let moveX = 0;
      let moveY = 0;
      if (keysPressed.current['KeyA'] || keysPressed.current['ArrowLeft']) moveX -= 1;
      if (keysPressed.current['KeyD'] || keysPressed.current['ArrowRight']) moveX += 1;
      if (keysPressed.current['KeyW'] || keysPressed.current['ArrowUp']) moveY -= 1;
      if (keysPressed.current['KeyS'] || keysPressed.current['ArrowDown']) moveY += 1;

      const pushPressed = Boolean(keysPressed.current['Space']);
      const jumpPressed = Boolean(
        keysPressed.current['ShiftLeft'] || keysPressed.current['ShiftRight'],
      );

      const localInput: PlayerMoveInput = {
        moveX,
        moveY,
        push: pushPressed,
        jump: jumpPressed,
      };

      setArena((currentArena) => {
        if (currentArena.isGameOver) return currentArena;

        // Periodic power-up spawning
        if (currentArena.elapsedSec > nextPowerUpSpawnRef.current) {
          nextPowerUpSpawnRef.current = currentArena.elapsedSec + 7.0;
          spawnPowerUps(currentArena, DEFAULT_ARENA_CONFIG);
        }

        // Gather all inputs (local + bots)
        const inputs: Record<string, PlayerMoveInput> = {};
        currentArena.players.forEach((p) => {
          if (p.id === localPlayerId) {
            inputs[p.id] = localInput;
          } else if (p.isBot) {
            inputs[p.id] = computeLavaBotDecision(p, currentArena, DEFAULT_ARENA_CONFIG);
          }
        });

        // Step physics
        const result = updateLavaPhysics(currentArena, inputs, DEFAULT_ARENA_CONFIG, dt);

        // Sound effects
        if (result.eliminatedIds.length > 0) {
          floorIsLavaSoundService.playSizzle();
          if (isMultiplayer && storeTransport) {
            result.eliminatedIds.forEach((id) => {
              const payload: FILEliminationPayload = {
                playerId: id,
                rank: currentArena.players.filter((p) => p.isAlive).length + 1,
              };
              storeTransport.send(FIL_MSG.ELIMINATION, payload, id);
            });
          }
        }

        if (result.powerUpCollected) {
          if (result.powerUpCollected.type === 'freeze') {
            floorIsLavaSoundService.playFreeze();
          } else {
            floorIsLavaSoundService.playPowerUp();
          }
          if (result.powerUpCollected.playerId === localPlayerId) {
            localPowerUpsRef.current += 1;
          }
        }

        // Game over check
        if (currentArena.isGameOver && !isGameOver) {
          setIsGameOver(true);
          floorIsLavaSoundService.playVictory();

          const winningPlayer =
            currentArena.players.find((p) => p.id === currentArena.winnerId) ?? null;
          setWinner(winningPlayer);

          const won = currentArena.winnerId === localPlayerId;
          floorIsLavaStatsRepository.recordMatchCompletion(
            won,
            currentArena.elapsedSec,
            localPushesRef.current,
            localPowerUpsRef.current,
          );

          if (onVictory && winningPlayer) {
            onVictory(winningPlayer, currentArena.elapsedSec);
          }
        }

        // Multiplayer local position sync broadcast
        if (isMultiplayer && storeTransport && now > nextSyncTimeRef.current) {
          nextSyncTimeRef.current = now + 50;
          const me = currentArena.players.find((p) => p.id === localPlayerId);
          if (me) {
            const payload: FILPlayerSyncPayload = {
              playerId: me.id,
              position: me.position,
              velocity: me.velocity,
              isAlive: me.isAlive,
            };
            storeTransport.send(FIL_MSG.PLAYER_SYNC, payload, me.id);
          }
        }

        return { ...currentArena };
      });

      // Render canvas frame
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          renderFloorIsLavaFrame(ctx, canvas.width, canvas.height, {
            arena,
            config: DEFAULT_ARENA_CONFIG,
            localPlayerId,
            timeMs: now,
          });
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
    elapsedSec,
    isGameOver,
    winner,
    triggerPush,
    restartGame,
  };
}
