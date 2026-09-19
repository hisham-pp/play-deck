import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { SupabaseTransportService } from '@/features/multiplayer/services/supabase-transport.service';
import { buildSabotageChain, getAttackingSaboteurId } from '../engine/chain-manager';
import {
  createInitialSaboteur,
  placeObstacle as enginePlaceObstacle,
  rechargeEnergy,
} from '../engine/obstacle-system';
import { updateBotDriver, updateBotSaboteur } from '../engine/racing-bot';
import {
  brakeVehicle,
  createInitialVehicle,
  jumpVehicle,
  steerVehicle,
  stepVehiclePhysics,
} from '../engine/vehicle-physics';
import {
  RR_MSG,
  type ObstaclePlacedPayload,
  type RacerFinishedPayload,
  type RRWireEnvelope,
  type VehicleUpdatePayload,
} from '../multiplayer/reverse-racing-protocol';
import { soundService } from '../services/reverse-racing-sound.service';
import { reverseRacingStatsRepo } from '../services/reverse-racing-stats-repository';
import type {
  Lane,
  Obstacle,
  ObstacleType,
  RacingPlayer,
  RaceStandings,
  SaboteurState,
  VehicleState,
} from '../types/reverse-racing.types';
import { useReverseRacingLoop } from './use-reverse-racing-loop';

export interface UseReverseRacingGameOptions {
  mode: 'solo' | 'online';
  localPlayer: { id: string; name: string; avatar: string; color: string };
  initialPlayers?: RacingPlayer[];
  transport?: SupabaseTransportService | null;
  onRaceFinish?: (standings: RaceStandings[]) => void;
}

export function useReverseRacingGame({
  mode,
  localPlayer,
  initialPlayers = [],
  transport,
  onRaceFinish,
}: UseReverseRacingGameOptions) {
  // Players list
  const [players] = useState<RacingPlayer[]>(() => {
    if (initialPlayers.length >= 2) return initialPlayers;
    // Default solo setup: local player vs 2 AI bots
    return [
      {
        id: localPlayer.id,
        name: localPlayer.name,
        avatar: localPlayer.avatar,
        seatIndex: 0,
        color: localPlayer.color,
        isBot: false,
        ready: true,
        trackId: `track-${localPlayer.id}`,
      },
      {
        id: 'bot-1',
        name: 'Apex AI',
        avatar: '🤖',
        seatIndex: 1,
        color: '#3b82f6',
        isBot: true,
        ready: true,
        trackId: 'track-bot-1',
      },
      {
        id: 'bot-2',
        name: 'Nitro CPU',
        avatar: '👾',
        seatIndex: 2,
        color: '#10b981',
        isBot: true,
        ready: true,
        trackId: 'track-bot-2',
      },
    ];
  });

  // Sabotage Chain (circular map: saboteurId -> targetRacerId)
  const sabotageChain = useMemo(() => buildSabotageChain(players), [players]);
  const targetPlayerId = sabotageChain.get(localPlayer.id) || null;
  const attackerPlayerId = useMemo(
    () => getAttackingSaboteurId(localPlayer.id, players),
    [localPlayer.id, players],
  );

  // Local Racer Vehicle
  const [localVehicle, setLocalVehicle] = useState<VehicleState>(() =>
    createInitialVehicle(
      localPlayer.id,
      localPlayer.name,
      localPlayer.avatar,
      localPlayer.color,
      false,
    ),
  );

  // Other racers' vehicles
  const [otherVehicles, setOtherVehicles] = useState<Record<string, VehicleState>>(() => {
    const map: Record<string, VehicleState> = {};
    for (const p of players) {
      if (p.id !== localPlayer.id) {
        map[p.id] = createInitialVehicle(p.id, p.name, p.avatar, p.color, p.isBot);
      }
    }
    return map;
  });

  // Track Obstacles
  const [trackObstacles, setTrackObstacles] = useState<Record<string, Obstacle[]>>(() => {
    const map: Record<string, Obstacle[]> = {};
    for (const p of players) {
      map[p.id] = [];
    }
    return map;
  });

  // Local Saboteur State
  const [saboteur, setSaboteur] = useState<SaboteurState>(() =>
    createInitialSaboteur(localPlayer.id, targetPlayerId || ''),
  );

  // Bot Saboteurs
  const [botSaboteurs, setBotSaboteurs] = useState<Record<string, SaboteurState>>(() => {
    const map: Record<string, SaboteurState> = {};
    for (const p of players) {
      if (p.isBot) {
        const target = sabotageChain.get(p.id) || '';
        map[p.id] = createInitialSaboteur(p.id, target);
      }
    }
    return map;
  });

  // Race Lifecycle
  const [raceState, setRaceState] = useState<'countdown' | 'racing' | 'finished'>('countdown');
  const [countdown, setCountdown] = useState(3);
  const [elapsedTimeMs, setElapsedTimeMs] = useState(0);
  const [standings, setStandings] = useState<RaceStandings[]>([]);
  const [isVictoryModalOpen, setIsVictoryModalOpen] = useState(false);

  // Settings
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  // Countdown timer effect
  useEffect(() => {
    if (raceState !== 'countdown') return;
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setRaceState('racing');
    }
  }, [raceState, countdown]);

  // Handle network actions for online mode
  useEffect(() => {
    if (!transport || mode !== 'online') return;

    const unsubscribe = transport.onAction((msg) => {
      const envelope = msg as unknown as RRWireEnvelope;
      if (envelope.senderId === localPlayer.id) return;

      switch (envelope.type) {
        case RR_MSG.VEHICLE_UPDATE: {
          const payload = envelope.payload as VehicleUpdatePayload;
          setOtherVehicles((prev) => ({
            ...prev,
            [payload.vehicle.playerId]: payload.vehicle,
          }));
          break;
        }
        case RR_MSG.OBSTACLE_PLACED: {
          const payload = envelope.payload as ObstaclePlacedPayload;
          const obs = payload.obstacle;
          const targetPlayer = obs.trackId.replace('track-', '');
          setTrackObstacles((prev) => ({
            ...prev,
            [targetPlayer]: [...(prev[targetPlayer] || []), obs],
          }));
          break;
        }
        case RR_MSG.RACER_FINISHED: {
          const payload = envelope.payload as RacerFinishedPayload;
          setOtherVehicles((prev) => {
            const v = prev[payload.playerId];
            if (!v) return prev;
            return {
              ...prev,
              [payload.playerId]: {
                ...v,
                status: 'finished',
                finishTimeMs: payload.finishTimeMs,
              },
            };
          });
          break;
        }
        default:
          break;
      }
    });

    return () => {
      unsubscribe();
    };
  }, [transport, mode, localPlayer.id]);

  // Racer Controls
  const handleSteerLeft = useCallback(() => {
    if (raceState !== 'racing') return;
    soundService.playSteer();
    setLocalVehicle((v) => steerVehicle(v, 'left'));
  }, [raceState]);

  const handleSteerRight = useCallback(() => {
    if (raceState !== 'racing') return;
    soundService.playSteer();
    setLocalVehicle((v) => steerVehicle(v, 'right'));
  }, [raceState]);

  const handleJump = useCallback(() => {
    if (raceState !== 'racing') return;
    soundService.playJump();
    setLocalVehicle((v) => jumpVehicle(v));
  }, [raceState]);

  const handleBrake = useCallback(
    (dt: number) => {
      if (raceState !== 'racing') return;
      setLocalVehicle((v) => brakeVehicle(v, dt));
    },
    [raceState],
  );

  // Saboteur Controls
  const handleSelectObstacle = useCallback((type: ObstacleType) => {
    setSaboteur((s) => ({ ...s, selectedObstacle: type }));
  }, []);

  const handlePlaceObstacle = useCallback(
    (distance: number, lane: Lane) => {
      if (raceState !== 'racing' || !targetPlayerId) return;

      const targetVehicle =
        targetPlayerId === localPlayer.id ? localVehicle : otherVehicles[targetPlayerId];
      if (!targetVehicle) return;

      const currentObstacles = trackObstacles[targetPlayerId] || [];
      const res = enginePlaceObstacle(
        saboteur,
        `track-${targetPlayerId}`,
        distance,
        lane,
        saboteur.selectedObstacle,
        targetVehicle.distance,
        currentObstacles,
      );

      if (res.obstacle) {
        soundService.playObstaclePlaced();
        setSaboteur(res.saboteur);
        setTrackObstacles((prev) => ({
          ...prev,
          [targetPlayerId]: [...(prev[targetPlayerId] || []), res.obstacle!],
        }));

        if (mode === 'online' && transport) {
          transport.send(
            RR_MSG.OBSTACLE_PLACED,
            { obstacle: res.obstacle } satisfies ObstaclePlacedPayload,
            localPlayer.id,
          );
        }
      } else {
        soundService.playEnergyWarning();
      }
    },
    [
      raceState,
      targetPlayerId,
      localPlayer.id,
      localVehicle,
      otherVehicles,
      trackObstacles,
      saboteur,
      mode,
      transport,
    ],
  );

  // Main Physics & AI Loop
  const broadcastThrottleRef = useRef(0);

  const handleTick = useCallback(
    (dt: number, timeMs: number) => {
      if (raceState !== 'racing') return;

      setElapsedTimeMs((t) => t + dt * 1000);

      // 1. Recharge local saboteur energy
      setSaboteur((s) => rechargeEnergy(s, dt));

      // 2. Step local vehicle physics
      const myObstacles = trackObstacles[localPlayer.id] || [];
      const tickRes = stepVehiclePhysics(localVehicle, myObstacles, dt);

      if (tickRes.collisionEvent !== 'none') {
        if (
          tickRes.collisionEvent === 'crash_roadblock' ||
          tickRes.collisionEvent === 'crash_wall' ||
          tickRes.collisionEvent === 'crash_pitfall'
        ) {
          soundService.playCrash();
        } else if (tickRes.collisionEvent === 'slip_oil') {
          soundService.playOilSlick();
        } else if (tickRes.collisionEvent === 'hit_speedbump') {
          soundService.playSpeedBump();
        } else if (tickRes.collisionEvent === 'turbo_boost') {
          soundService.playBoostPad();
        }
      }

      setLocalVehicle(tickRes.vehicle);

      // 3. Update AI Bots
      setOtherVehicles((prev) => {
        const next = { ...prev };
        for (const [botId, vehicle] of Object.entries(prev)) {
          if (vehicle.isBot && vehicle.status !== 'finished') {
            const botObs = trackObstacles[botId] || [];
            const drivenBot = updateBotDriver(vehicle, botObs);
            const botTick = stepVehiclePhysics(drivenBot, botObs, dt);
            next[botId] = botTick.vehicle;
          }
        }
        return next;
      });

      // 4. Update Bot Saboteurs
      for (const [botId, botSab] of Object.entries(botSaboteurs)) {
        const targetId = botSab.targetPlayerId;
        const targetVeh = targetId === localPlayer.id ? tickRes.vehicle : otherVehicles[targetId];

        if (targetVeh && targetVeh.status !== 'finished') {
          const recharged = rechargeEnergy(botSab, dt);
          const currentObs = trackObstacles[targetId] || [];
          const botPlacement = updateBotSaboteur(
            recharged,
            `track-${targetId}`,
            targetVeh,
            currentObs,
            timeMs / 1000,
          );

          setBotSaboteurs((prev) => ({ ...prev, [botId]: botPlacement.saboteur }));

          if (botPlacement.newObstacle) {
            setTrackObstacles((prev) => ({
              ...prev,
              [targetId]: [...(prev[targetId] || []), botPlacement.newObstacle!],
            }));
          }
        }
      }

      // 5. Broadcast vehicle position in online mode
      if (mode === 'online' && transport) {
        broadcastThrottleRef.current += dt;
        if (broadcastThrottleRef.current >= 0.05) {
          // 20hz sync
          broadcastThrottleRef.current = 0;
          transport.send(
            RR_MSG.VEHICLE_UPDATE,
            { vehicle: tickRes.vehicle } satisfies VehicleUpdatePayload,
            localPlayer.id,
          );
        }
      }

      // 6. Check Race Completion
      const allVehicles = [tickRes.vehicle, ...Object.values(otherVehicles)];
      const allFinished = allVehicles.every((v) => v.status === 'finished');

      if (tickRes.finished && localVehicle.status !== 'finished') {
        soundService.playFinish();
        if (mode === 'online' && transport) {
          transport.send(
            RR_MSG.RACER_FINISHED,
            {
              playerId: localPlayer.id,
              finishTimeMs: tickRes.vehicle.finishTimeMs || elapsedTimeMs,
              crashes: tickRes.vehicle.crashesSuffered,
            } satisfies RacerFinishedPayload,
            localPlayer.id,
          );
        }
      }

      if (allFinished && raceState === 'racing') {
        // Compile Final Standings
        const computedStandings: RaceStandings[] = allVehicles
          .sort((a, b) => (a.finishTimeMs || 999999) - (b.finishTimeMs || 999999))
          .map((v, index) => ({
            rank: index + 1,
            player: players.find((p) => p.id === v.playerId) || {
              id: v.playerId,
              name: v.playerName,
              avatar: v.avatar,
              seatIndex: index,
              color: v.color,
              isBot: v.isBot,
              trackId: `track-${v.playerId}`,
            },
            finishTimeMs: v.finishTimeMs || 0,
            crashesSuffered: v.crashesSuffered,
            obstaclesPlaced:
              v.playerId === localPlayer.id
                ? saboteur.obstaclesPlaced
                : botSaboteurs[v.playerId]?.obstaclesPlaced || 0,
            crashesInflicted:
              v.playerId === localPlayer.id
                ? saboteur.crashesInflicted
                : botSaboteurs[v.playerId]?.crashesInflicted || 0,
            sabotageScore:
              v.playerId === localPlayer.id
                ? saboteur.sabotageScore
                : botSaboteurs[v.playerId]?.sabotageScore || 0,
          }));

        setStandings(computedStandings);
        setRaceState('finished');
        setIsVictoryModalOpen(true);

        // Record stats for local player
        const myStanding = computedStandings.find((s) => s.player.id === localPlayer.id);
        if (myStanding) {
          void reverseRacingStatsRepo.recordRaceCompletion(
            myStanding.rank,
            myStanding.finishTimeMs,
            myStanding.crashesSuffered,
            myStanding.crashesInflicted,
            myStanding.obstaclesPlaced,
          );
        }

        onRaceFinish?.(computedStandings);
      }
    },
    [
      raceState,
      trackObstacles,
      localPlayer,
      localVehicle,
      otherVehicles,
      botSaboteurs,
      mode,
      transport,
      saboteur,
      players,
      elapsedTimeMs,
      onRaceFinish,
    ],
  );

  useReverseRacingLoop({
    onTick: handleTick,
    isActive: raceState === 'racing',
  });

  const restartRace = useCallback(() => {
    setLocalVehicle(
      createInitialVehicle(
        localPlayer.id,
        localPlayer.name,
        localPlayer.avatar,
        localPlayer.color,
        false,
      ),
    );
    setOtherVehicles(() => {
      const map: Record<string, VehicleState> = {};
      for (const p of players) {
        if (p.id !== localPlayer.id) {
          map[p.id] = createInitialVehicle(p.id, p.name, p.avatar, p.color, p.isBot);
        }
      }
      return map;
    });
    setTrackObstacles(() => {
      const map: Record<string, Obstacle[]> = {};
      for (const p of players) {
        map[p.id] = [];
      }
      return map;
    });
    setSaboteur(createInitialSaboteur(localPlayer.id, targetPlayerId || ''));
    setElapsedTimeMs(0);
    setCountdown(3);
    setRaceState('countdown');
    setIsVictoryModalOpen(false);
  }, [localPlayer, players, targetPlayerId]);

  return {
    raceState,
    countdown,
    elapsedTimeMs,
    players,
    targetPlayerId,
    attackerPlayerId,
    localVehicle,
    otherVehicles,
    trackObstacles,
    saboteur,
    standings,
    isVictoryModalOpen,
    setIsVictoryModalOpen,
    soundEnabled,
    setSoundEnabled: (v: boolean) => {
      setSoundEnabled(v);
      soundService.setSoundEnabled(v);
    },
    reducedMotion,
    setReducedMotion,
    highContrast,
    setHighContrast,
    handleSteerLeft,
    handleSteerRight,
    handleJump,
    handleBrake,
    handleSelectObstacle,
    handlePlaceObstacle,
    restartRace,
  };
}
