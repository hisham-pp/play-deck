'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useGravityShiftMultiplayerStore } from '@/stores/gravity-shift-multiplayer.store';
import { getCourseById } from '../engine/course-catalog';
import {
  createInitialCharacter,
  rotateGravityClockwise,
  rotateGravityCounterClockwise,
  updateGravityCharacterPhysics,
} from '../engine/gravity-physics';
import type { PlayerInput } from '../engine/gravity-physics';
import { computeBotDecision } from '../engine/gravity-shift-bot';
import { GS_MSG } from '../multiplayer/gravity-shift-protocol';
import type {
  GSCheckpointPayload,
  GSFinishPayload,
  GSGravityShiftPayload,
  GSPositionSyncPayload,
} from '../multiplayer/gravity-shift-protocol';
import {
  getTargetRotationForGravity,
  renderGravityShiftFrame,
} from '../render/gravity-shift-renderer';
import { gravityShiftSoundService } from '../services/gravity-shift-sound.service';
import { gravityShiftStatsRepository } from '../services/gravity-shift-stats-repository';
import type { GravityDirection, GravityShiftPlayer } from '../types/gravity-shift.types';

export interface UseGravityShiftGameProps {
  courseId: string;
  isMultiplayer: boolean;
  onVictory?: (winner: GravityShiftPlayer, timeMs: number) => void;
}

export function useGravityShiftGame({
  courseId,
  isMultiplayer,
  onVictory,
}: UseGravityShiftGameProps) {
  const storePlayers = useGravityShiftMultiplayerStore((state) => state.players);
  const storeLocalPlayerId = useGravityShiftMultiplayerStore((state) => state.localPlayerId);
  const storeTransport = useGravityShiftMultiplayerStore((state) => state.transport);
  const setStoreGravity = useGravityShiftMultiplayerStore((state) => state.setGravity);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const course = getCourseById(courseId);

  // Local game state
  const [players, setPlayers] = useState<GravityShiftPlayer[]>(() => {
    if (isMultiplayer && storePlayers.length > 0) {
      return storePlayers.map((p) => ({
        ...p,
        character: createInitialCharacter(course.spawnPoint),
      }));
    }
    // Singleplayer / Practice vs 1 Bot
    return [
      {
        id: 'player-local',
        name: 'You',
        avatar: '⚡',
        color: '#38bdf8',
        isBot: false,
        isHost: true,
        ready: true,
        character: createInitialCharacter(course.spawnPoint),
      },
      {
        id: 'bot-1',
        name: 'Grav-Bot 1',
        avatar: '🤖',
        color: '#f59e0b',
        isBot: true,
        isHost: false,
        ready: true,
        character: createInitialCharacter(course.spawnPoint),
      },
    ];
  });

  const localPlayerId = isMultiplayer ? storeLocalPlayerId : 'player-local';
  const [currentGravity, setCurrentGravity] = useState<GravityDirection>(course.initialGravity);
  const [elapsedTimeMs, setElapsedTimeMs] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Smooth camera rotation
  const cameraRotRef = useRef(getTargetRotationForGravity(course.initialGravity));
  const keysPressed = useRef<Record<string, boolean>>({});
  const lastTimeRef = useRef<number | null>(null);
  const finishOrderRef = useRef<string[]>([]);
  const nextSyncTimeRef = useRef<number>(0);

  // Handle keyboard inputs
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      keysPressed.current[e.code] = true;

      // Gravity quick-shifts
      if (e.code === 'KeyQ') {
        triggerGravityShift(rotateGravityCounterClockwise(currentGravity));
      } else if (e.code === 'KeyE') {
        triggerGravityShift(rotateGravityClockwise(currentGravity));
      } else if (e.code === 'KeyW' || e.code === 'ArrowUp') {
        if (e.shiftKey) triggerGravityShift('up');
      } else if (e.code === 'KeyS' || e.code === 'ArrowDown') {
        if (e.shiftKey) triggerGravityShift('down');
      } else if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
        if (e.shiftKey) triggerGravityShift('left');
      } else if (e.code === 'KeyD' || e.code === 'ArrowRight') {
        if (e.shiftKey) triggerGravityShift('right');
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
  }, [currentGravity]);

  // Handle multiplayer transport events
  useEffect(() => {
    if (!isMultiplayer || !storeTransport) return;

    storeTransport.onAction((msg) => {
      if (msg.type === GS_MSG.GRAVITY_SHIFT) {
        const payload = msg.payload as GSGravityShiftPayload;
        setCurrentGravity(payload.newGravity);
        setStoreGravity(payload.newGravity);
        gravityShiftSoundService.playGravityShift();
      } else if (msg.type === GS_MSG.POSITION_SYNC) {
        const payload = msg.payload as GSPositionSyncPayload;
        if (payload.playerId !== localPlayerId) {
          setPlayers((prev) =>
            prev.map((p) =>
              p.id === payload.playerId ? { ...p, character: payload.character } : p,
            ),
          );
        }
      } else if (msg.type === GS_MSG.FINISH) {
        const payload = msg.payload as GSFinishPayload;
        if (!finishOrderRef.current.includes(payload.playerId)) {
          finishOrderRef.current.push(payload.playerId);
        }
      }
    });
  }, [isMultiplayer, storeTransport, localPlayerId, setStoreGravity]);

  const triggerGravityShift = useCallback(
    (newDir: GravityDirection) => {
      const me = players.find((p) => p.id === localPlayerId);
      if (!me) return;

      if (me.character.shiftCharges <= 0 || me.character.shiftCooldown > 0) {
        return;
      }

      // Consume charge and set cooldown
      me.character.shiftCharges -= 1;
      me.character.shiftCooldown = 2.0;

      setCurrentGravity(newDir);
      setStoreGravity(newDir);
      gravityShiftSoundService.playGravityShift();

      if (isMultiplayer && storeTransport) {
        const payload: GSGravityShiftPayload = {
          newGravity: newDir,
          shiftedBy: me.id,
          timestamp: Date.now(),
        };
        storeTransport.send(GS_MSG.GRAVITY_SHIFT, payload, me.id);
      }
    },
    [players, localPlayerId, isMultiplayer, storeTransport, setStoreGravity],
  );

  const restartGame = useCallback(() => {
    const freshCourse = getCourseById(courseId);
    setPlayers((prev) =>
      prev.map((p) => ({
        ...p,
        character: createInitialCharacter(freshCourse.spawnPoint),
      })),
    );
    setCurrentGravity(freshCourse.initialGravity);
    setStoreGravity(freshCourse.initialGravity);
    cameraRotRef.current = getTargetRotationForGravity(freshCourse.initialGravity);
    setElapsedTimeMs(0);
    setIsFinished(false);
    finishOrderRef.current = [];
    lastTimeRef.current = null;
  }, [courseId, setStoreGravity]);

  // Main game & physics tick loop
  useEffect(() => {
    let animId: number;

    const tick = (now: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = now;
      }
      const rawDt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;
      const dt = Math.min(rawDt, 0.05); // Cap delta to prevent tunnelling

      setElapsedTimeMs((prev) => prev + dt * 1000);

      // Smooth camera rotation
      const targetRot = getTargetRotationForGravity(currentGravity);
      let diff = targetRot - cameraRotRef.current;
      // Normalize angle diff to -PI .. PI
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      cameraRotRef.current += diff * Math.min(1, 10 * dt);

      // Local player input compilation
      const input: PlayerInput = {
        moveNegative: Boolean(
          keysPressed.current['KeyA'] ||
          keysPressed.current['ArrowLeft'] ||
          keysPressed.current['KeyW'] ||
          keysPressed.current['ArrowUp'],
        ),
        movePositive: Boolean(
          keysPressed.current['KeyD'] ||
          keysPressed.current['ArrowRight'] ||
          keysPressed.current['KeyS'] ||
          keysPressed.current['ArrowDown'],
        ),
        jump: Boolean(
          keysPressed.current['Space'] ||
          keysPressed.current['ArrowUp'] ||
          keysPressed.current['KeyW'],
        ),
      };

      setPlayers((currentPlayers) => {
        const nextPlayers = currentPlayers.map((p) => {
          let charInput = input;

          if (p.isBot) {
            const decision = computeBotDecision({
              character: p.character,
              currentGravity,
              course,
            });
            charInput = decision.input;

            if (decision.shiftRequest && p.character.shiftCharges > 0) {
              // Bot gravity shift
              triggerGravityShift(decision.shiftRequest);
            }
          } else if (p.id !== localPlayerId) {
            // Other remote player positions are updated via wire events
            return p;
          }

          const res = updateGravityCharacterPhysics(
            p.character,
            course,
            currentGravity,
            charInput,
            dt,
          );

          if (res.jumpTriggered && p.id === localPlayerId) {
            gravityShiftSoundService.playJump();
          }
          if (res.bounced) {
            gravityShiftSoundService.playBounce();
          }
          if (res.hazardHit) {
            gravityShiftSoundService.playHazard();
          }
          if (res.checkpointReached) {
            gravityShiftSoundService.playCheckpoint();
            if (isMultiplayer && storeTransport && p.id === localPlayerId) {
              const payload: GSCheckpointPayload = {
                playerId: p.id,
                checkpointId: res.checkpointReached,
                checkpointsPassed: res.character.checkpointsPassed,
              };
              storeTransport.send(GS_MSG.CHECKPOINT, payload, p.id);
            }
          }

          if (res.reachedFinish && !p.character.finishTimeMs) {
            res.character.finishTimeMs = Date.now();
            gravityShiftSoundService.playVictory();

            if (!finishOrderRef.current.includes(p.id)) {
              finishOrderRef.current.push(p.id);
            }

            const rank = finishOrderRef.current.length;
            p.rank = rank;

            if (p.id === localPlayerId) {
              setIsFinished(true);
              const won = rank === 1;
              gravityShiftStatsRepository.recordRaceCompletion(
                course.id,
                Date.now(),
                won,
                3 - res.character.shiftCharges,
                res.character.checkpointsPassed,
              );

              if (onVictory) {
                onVictory(p, Date.now());
              }

              if (isMultiplayer && storeTransport) {
                const payload: GSFinishPayload = {
                  playerId: p.id,
                  finishTimeMs: Date.now(),
                  rank,
                };
                storeTransport.send(GS_MSG.FINISH, payload, p.id);
              }
            }
          }

          return { ...p, character: res.character };
        });

        // Periodic multiplayer sync for local character
        if (isMultiplayer && storeTransport && now > nextSyncTimeRef.current) {
          nextSyncTimeRef.current = now + 50;
          const myPlayer = nextPlayers.find((p) => p.id === localPlayerId);
          if (myPlayer) {
            const payload: GSPositionSyncPayload = {
              playerId: myPlayer.id,
              character: myPlayer.character,
            };
            storeTransport.send(GS_MSG.POSITION_SYNC, payload, myPlayer.id);
          }
        }

        return nextPlayers;
      });

      // Render canvas frame
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          renderGravityShiftFrame(ctx, canvas.width, canvas.height, {
            course,
            players,
            localPlayerId,
            currentGravity,
            cameraRotation: cameraRotRef.current,
            elapsedTimeMs,
          });
        }
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [
    course,
    currentGravity,
    localPlayerId,
    isMultiplayer,
    storeTransport,
    triggerGravityShift,
    elapsedTimeMs,
    onVictory,
  ]);

  const localPlayer = players.find((p) => p.id === localPlayerId) ?? null;

  return {
    canvasRef,
    players,
    localPlayer,
    currentGravity,
    elapsedTimeMs,
    isFinished,
    triggerGravityShift,
    restartGame,
  };
}
