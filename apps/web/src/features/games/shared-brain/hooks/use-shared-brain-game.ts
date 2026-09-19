'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSharedBrainMultiplayerStore } from '@/stores/shared-brain-multiplayer.store';
import { BuddyBotEngine } from '../engine/buddy-bot';
import { COURSES_CATALOG } from '../engine/course-catalog';
import { createInitialCharacter, updatePhysics } from '../engine/platformer-physics';
import type { SharedBrainActionEnvelope } from '../multiplayer/shared-brain-protocol';
import { SB_MSG } from '../multiplayer/shared-brain-protocol';
import { SharedBrainSoundService } from '../services/shared-brain-sound.service';
import { SharedBrainStatsRepository } from '../services/shared-brain-stats-repository';
import type {
  BrainCharacterState,
  CourseDefinition,
  PlayerPair,
  SharedBrainRole,
} from '../types/shared-brain.types';

export interface UseSharedBrainGameOptions {
  isMultiplayer?: boolean;
  localSoloMode?: 'both' | 'navigator_with_bot' | 'motor_with_bot' | 'local_2p';
}

export function useSharedBrainGame({
  isMultiplayer = false,
  localSoloMode = 'both',
}: UseSharedBrainGameOptions = {}) {
  // Multiplayer store
  const mpRoomCode = useSharedBrainMultiplayerStore((s) => s.roomCode);
  const mpLocalPlayerId = useSharedBrainMultiplayerStore((s) => s.localPlayerId);
  const mpPlayers = useSharedBrainMultiplayerStore((s) => s.players);
  const mpPairs = useSharedBrainMultiplayerStore((s) => s.pairs);
  const mpCourseId = useSharedBrainMultiplayerStore((s) => s.selectedCourseId);
  const mpTransport = useSharedBrainMultiplayerStore((s) => s.transport);
  const isHost = useSharedBrainMultiplayerStore((s) => s.isHost());

  // Course & World State
  const [courseIndex, setCourseIndex] = useState(0);
  const activeCourseId = isMultiplayer
    ? mpCourseId
    : COURSES_CATALOG[courseIndex]?.id || COURSES_CATALOG[0].id;
  const course: CourseDefinition =
    COURSES_CATALOG.find((c) => c.id === activeCourseId) || COURSES_CATALOG[0];

  // Local pairs for single player
  const [localPairs, setLocalPairs] = useState<PlayerPair[]>(() => [
    {
      pairId: 'team-1',
      navigatorId: 'local-nav',
      motorId: 'local-mot',
      navigatorName: 'Navigator',
      motorName: 'Motor',
      navigatorAvatar: '🧭',
      motorAvatar: '🕹️',
      colorA: '#38bdf8',
      colorB: '#f59e0b',
      isBotA: localSoloMode === 'motor_with_bot',
      isBotB: localSoloMode === 'navigator_with_bot',
      character: createInitialCharacter(course.spawnPoint),
    },
  ]);

  // Interactive Level State
  const [collectedTokenIds, setCollectedTokenIds] = useState<Set<string>>(new Set());
  const [activeSwitchIds, setActiveSwitchIds] = useState<Set<string>>(new Set());
  const [doorStates, setDoorStates] = useState<Map<string, number>>(new Map());

  // Game Run State
  const [runStatus, setRunStatus] = useState<'idle' | 'running' | 'completed' | 'failed'>('idle');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [deathCount, setDeathCount] = useState(0);
  const [victoryStats, setVictoryStats] = useState<{ time: number; tokens: number } | null>(null);

  // Active role for local player
  const localRole: SharedBrainRole = isMultiplayer
    ? mpPlayers.find((p) => p.id === mpLocalPlayerId)?.role || 'both'
    : localSoloMode === 'navigator_with_bot'
      ? 'navigator'
      : localSoloMode === 'motor_with_bot'
        ? 'motor'
        : 'both';

  // Input states
  const inputRef = useRef({
    left: false,
    right: false,
    jump: false,
    interact: false,
  });

  const lastFrameTimeRef = useRef<number>(performance.now());
  const buddyBotsRef = useRef<Map<string, BuddyBotEngine>>(new Map());

  // Determine local pair
  const activePairs = isMultiplayer && mpPairs.length > 0 ? mpPairs : localPairs;
  const localPair =
    activePairs.find((p) => p.navigatorId === mpLocalPlayerId || p.motorId === mpLocalPlayerId) ||
    activePairs[0];

  // Reset level
  const resetCourse = useCallback(() => {
    setCollectedTokenIds(new Set());
    setActiveSwitchIds(new Set());
    setDoorStates(new Map());
    setElapsedTime(0);
    setVictoryStats(null);
    setRunStatus('idle');

    if (isMultiplayer) {
      // Host or MP reset
      activePairs.forEach((pair) => {
        pair.character = createInitialCharacter(course.spawnPoint);
      });
    } else {
      setLocalPairs([
        {
          pairId: 'team-1',
          navigatorId: 'local-nav',
          motorId: 'local-mot',
          navigatorName: 'Navigator',
          motorName: 'Motor',
          navigatorAvatar: '🧭',
          motorAvatar: '🕹️',
          colorA: '#38bdf8',
          colorB: '#f59e0b',
          isBotA: localSoloMode === 'motor_with_bot',
          isBotB: localSoloMode === 'navigator_with_bot',
          character: createInitialCharacter(course.spawnPoint),
        },
      ]);
    }
  }, [activePairs, course, isMultiplayer, localSoloMode]);

  // Start run
  const startRun = useCallback(() => {
    resetCourse();
    setRunStatus('running');
    lastFrameTimeRef.current = performance.now();
    SharedBrainSoundService.play('checkpoint');

    if (isMultiplayer && mpTransport && mpRoomCode && isHost) {
      mpTransport.send(SB_MSG.START_RUN, { courseId: course.id }, mpLocalPlayerId || 'host');
    }
  }, [course.id, isHost, isMultiplayer, mpLocalPlayerId, mpRoomCode, mpTransport, resetCourse]);

  // Network transport listener
  useEffect(() => {
    if (!isMultiplayer || !mpTransport) return;

    const cleanup = mpTransport.onAction((msg) => {
      const envelope = msg as unknown as SharedBrainActionEnvelope;
      switch (envelope.type) {
        case SB_MSG.START_RUN:
          setRunStatus('running');
          lastFrameTimeRef.current = performance.now();
          break;

        case SB_MSG.INPUT_EVENT: {
          const { pairId, role, action, active } = envelope.payload as {
            pairId: string;
            role: string;
            action: string;
            active: boolean;
          };
          const targetPair = activePairs.find((p) => p.pairId === pairId);
          if (!targetPair) break;

          // Apply remote partner input if we share this pair
          if (pairId === localPair?.pairId) {
            if (role === 'navigator') {
              if (action === 'move_left') inputRef.current.left = active;
              if (action === 'move_right') inputRef.current.right = active;
            } else if (role === 'motor') {
              if (action === 'jump') inputRef.current.jump = active;
              if (action === 'interact') inputRef.current.interact = active;
            }
          }
          break;
        }

        case SB_MSG.CHARACTER_SYNC: {
          const { pairId, character, activeSwitches, collectedTokens } = envelope.payload as {
            pairId: string;
            character: BrainCharacterState;
            activeSwitches?: string[];
            collectedTokens?: string[];
          };
          const target = activePairs.find((p) => p.pairId === pairId);
          if (target && pairId !== localPair?.pairId) {
            Object.assign(target.character, character);
          }
          if (collectedTokens) {
            setCollectedTokenIds(new Set(collectedTokens));
          }
          if (activeSwitches) {
            setActiveSwitchIds(new Set(activeSwitches));
          }
          break;
        }

        case SB_MSG.COURSE_CLEAR: {
          const {
            pairId: _pairId,
            timeMs,
            tokensCollected,
          } = envelope.payload as {
            pairId: string;
            timeMs: number;
            tokensCollected: number;
          };
          setRunStatus('completed');
          setVictoryStats({ time: timeMs, tokens: tokensCollected });
          SharedBrainSoundService.play('victory');
          void SharedBrainStatsRepository.recordCompletion(course.id, timeMs, tokensCollected);
          break;
        }

        case SB_MSG.RESTART:
          resetCourse();
          break;
      }
    });

    return () => {
      cleanup();
    };
  }, [activePairs, course.id, isMultiplayer, localPair?.pairId, mpTransport, resetCourse]);

  // Keyboard handlers
  useEffect(() => {
    if (runStatus !== 'running') return;

    const sendNetworkInput = (action: string, active: boolean) => {
      if (isMultiplayer && mpTransport && localPair) {
        mpTransport.send(
          SB_MSG.INPUT_EVENT,
          {
            pairId: localPair.pairId,
            role: localRole,
            action,
            active,
          },
          mpLocalPlayerId || 'player',
        );
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }

      // Navigator controls (Left / Right)
      if (localRole === 'navigator' || localRole === 'both') {
        if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
          if (!inputRef.current.left) {
            inputRef.current.left = true;
            sendNetworkInput('move_left', true);
          }
        }
        if (e.code === 'KeyD' || e.code === 'ArrowRight') {
          if (!inputRef.current.right) {
            inputRef.current.right = true;
            sendNetworkInput('move_right', true);
          }
        }
      }

      // Motor controls (Jump / Interact)
      if (localRole === 'motor' || localRole === 'both') {
        if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') {
          if (!inputRef.current.jump) {
            inputRef.current.jump = true;
            sendNetworkInput('jump', true);
          }
        }
        if (e.code === 'KeyE' || e.code === 'KeyS' || e.code === 'ArrowDown') {
          if (!inputRef.current.interact) {
            inputRef.current.interact = true;
            sendNetworkInput('interact', true);
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (localRole === 'navigator' || localRole === 'both') {
        if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
          inputRef.current.left = false;
          sendNetworkInput('move_left', false);
        }
        if (e.code === 'KeyD' || e.code === 'ArrowRight') {
          inputRef.current.right = false;
          sendNetworkInput('move_right', false);
        }
      }

      if (localRole === 'motor' || localRole === 'both') {
        if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') {
          inputRef.current.jump = false;
          sendNetworkInput('jump', false);
        }
        if (e.code === 'KeyE' || e.code === 'KeyS' || e.code === 'ArrowDown') {
          inputRef.current.interact = false;
          sendNetworkInput('interact', false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isMultiplayer, localPair, localRole, mpTransport, runStatus]);

  // Main physics loop (requestAnimationFrame)
  useEffect(() => {
    let animId: number;

    const tick = (now: number) => {
      const dt = Math.min((now - lastFrameTimeRef.current) / 1000, 0.05); // Cap 50ms
      lastFrameTimeRef.current = now;

      if (runStatus === 'running') {
        setElapsedTime((prev) => prev + dt);

        // Update each pair
        activePairs.forEach((pair) => {
          let moveLeft = false;
          let moveRight = false;
          let jump = false;
          let interact = false;

          const isLocalCharacter = pair.pairId === localPair?.pairId;

          if (isLocalCharacter) {
            // Apply local inputs
            if (localRole === 'navigator' || localRole === 'both') {
              moveLeft = inputRef.current.left;
              moveRight = inputRef.current.right;
            }
            if (localRole === 'motor' || localRole === 'both') {
              jump = inputRef.current.jump;
              interact = inputRef.current.interact;
            }

            // Run AI Buddy bot for missing half if needed
            if (pair.isBotA || pair.isBotB) {
              let bot = buddyBotsRef.current.get(pair.pairId);
              if (!bot) {
                bot = new BuddyBotEngine(course);
                buddyBotsRef.current.set(pair.pairId, bot);
              }

              const botInputs = bot.update(
                pair.character,
                doorStates,
                activeSwitchIds,
                collectedTokenIds,
              );

              if (pair.isBotA) {
                // Bot navigates
                moveLeft = botInputs.moveLeft;
                moveRight = botInputs.moveRight;
              }
              if (pair.isBotB) {
                // Bot motors
                jump = botInputs.jump;
                interact = botInputs.interact;
              }
            }
          }

          // Run platformer physics
          const result = updatePhysics(
            pair.character,
            course,
            { moveLeft, moveRight, jump, interact },
            dt,
            activeSwitchIds,
            doorStates,
          );

          pair.character = result.character;

          // Sound effects & state updates for local character
          if (isLocalCharacter) {
            if (result.jumpTriggered) SharedBrainSoundService.play('jump');
            if (result.bounced) SharedBrainSoundService.play('bounce');
            if (result.switchToggled) {
              SharedBrainSoundService.play('lever');
              setActiveSwitchIds((prev) => {
                const next = new Set(prev);
                next.add(result.switchToggled!);
                return next;
              });
            }
            if (result.tokensCollected.length > 0) {
              SharedBrainSoundService.play('token');
              setCollectedTokenIds((prev) => {
                const next = new Set(prev);
                result.tokensCollected.forEach((id) => next.add(id));
                return next;
              });
            }
            if (result.fellInHazard) {
              SharedBrainSoundService.play('death');
              setDeathCount((c) => c + 1);
            }
            if (result.reachedGoal) {
              SharedBrainSoundService.play('victory');
              setRunStatus('completed');
              setVictoryStats({
                time: elapsedTime,
                tokens: collectedTokenIds.size + result.tokensCollected.length,
              });
              void SharedBrainStatsRepository.recordCompletion(
                course.id,
                elapsedTime,
                collectedTokenIds.size + result.tokensCollected.length,
              );

              if (isMultiplayer && mpTransport) {
                mpTransport.send(
                  SB_MSG.COURSE_CLEAR,
                  {
                    pairId: pair.pairId,
                    timeMs: Math.round(elapsedTime * 1000),
                    tokensCollected: collectedTokenIds.size + result.tokensCollected.length,
                  },
                  mpLocalPlayerId || 'player',
                );
              }
            }

            // Sync with multiplayer peers periodically (every 100ms)
            if (isMultiplayer && mpTransport && Math.random() < 0.15) {
              mpTransport.send(
                SB_MSG.CHARACTER_SYNC,
                {
                  pairId: pair.pairId,
                  character: pair.character,
                  activeSwitches: Array.from(activeSwitchIds),
                  collectedTokens: Array.from(collectedTokenIds),
                },
                mpLocalPlayerId || 'player',
              );
            }
          }
        });

        // Animate door opening/closing
        course.elements
          .filter((el) => el.type === 'door')
          .forEach((door) => {
            const isOpened = door.linkedSwitchId ? activeSwitchIds.has(door.linkedSwitchId) : false;
            const current = doorStates.get(door.id) ?? 0;
            const target = isOpened ? 1 : 0;
            if (current !== target) {
              const nextVal =
                target > current ? Math.min(1, current + dt * 2) : Math.max(0, current - dt * 2);
              doorStates.set(door.id, nextVal);
            }
          });
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(animId);
    };
  }, [
    activePairs,
    activeSwitchIds,
    collectedTokenIds,
    course,
    doorStates,
    elapsedTime,
    isMultiplayer,
    localPair,
    localRole,
    mpTransport,
    runStatus,
  ]);

  return {
    course,
    courseIndex,
    setCourseIndex,
    runStatus,
    elapsedTime,
    deathCount,
    victoryStats,
    localPairs: activePairs,
    localPair,
    localRole,
    collectedTokenIds,
    activeSwitchIds,
    doorStates,
    startRun,
    resetCourse,
  };
}
