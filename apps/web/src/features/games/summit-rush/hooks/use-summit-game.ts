'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useMultiplayerStore } from '@/stores/multiplayer.store';
import { usePlayerStore } from '@/stores/player.store';
import type { PlayMode } from '../components/SummitOverlays';
import { buildRunResult, createWorld, runScore } from '../engine/summit-engine';
import type { RunResult, Vec2, World, WorldEvent } from '../engine/summit-types';
import { decideRaceOutcome, type RaceOutcome } from '../multiplayer/race-protocol';
import { summitSoundService } from '../services/summit-sound.service';
import { sampleHud, type HudSnapshot } from './use-summit-loop';
import { useSummitProgress } from './use-summit-progress';
import { useSummitRace } from './use-summit-race';

export type SummitPhase = 'menu' | 'countdown' | 'playing' | 'paused' | 'over' | 'upgrades';

const COUNTDOWN_FROM = 3;
const NEWBIE_RUNS = 3;

const randomSeed = () => Math.floor(Math.random() * 2 ** 31);

function hintFor(hud: HudSnapshot, newbie: boolean): string | null {
  if (hud.status !== 'running') return null;
  if (hud.fuel > 0 && hud.fuel / hud.fuelCapacity < 0.22) return 'Low fuel! Grab a red fuel can';
  if (!newbie) return null;
  if (hud.distance < 10 && hud.speedKmh < 15) return 'Hold GAS (D / →) to drive';
  if (hud.airborne) return 'Airborne: let go of gas to level out — hold it to flip!';
  return null;
}

export function useSummitGame() {
  const { progress, progressRef, isLoaded, recordRun, buyUpgrade } = useSummitProgress();
  const recordGamePlayed = usePlayerStore((s) => s.recordGamePlayed);
  const [seatedOnMount] = useState(() => Boolean(useMultiplayerStore.getState().roomCode));

  const worldRef = useRef<World | null>(null);
  const [phase, setPhase] = useState<SummitPhase>('menu');
  const [mode, setMode] = useState<PlayMode>(seatedOnMount ? 'online' : 'solo');
  const [upgradesReturn, setUpgradesReturn] = useState<'menu' | 'over'>('menu');
  const [result, setResult] = useState<RunResult | null>(null);
  const [countdown, setCountdown] = useState(COUNTDOWN_FROM);
  const [showGo, setShowGo] = useState(false);
  const [hud, setHud] = useState<HudSnapshot | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  if (worldRef.current === null) worldRef.current = createWorld(randomSeed(), progress.upgrades);

  const beginWorld = useCallback(
    (seed: number) => {
      worldRef.current = createWorld(seed, progressRef.current.upgrades);
      setResult(null);
      setHud(sampleHud(worldRef.current));
    },
    [progressRef],
  );

  const onRaceStart = useCallback(
    (seed: number) => {
      summitSoundService.unlock();
      beginWorld(seed);
      setIsReady(false);
      setCountdown(COUNTDOWN_FROM);
      setPhase('countdown');
    },
    [beginWorld],
  );

  const race = useSummitRace({ enabled: mode === 'online', onRaceStart });
  const inRace = mode === 'online' && race.raceId !== null && Boolean(race.roomCode);

  // A fresh menu course whenever upgrades load, so the parked buggy matches the garage.
  useEffect(() => {
    if (isLoaded && phaseRef.current === 'menu') beginWorld(randomSeed());
  }, [isLoaded, beginWorld]);

  useEffect(() => {
    if (phase !== 'countdown') return;
    summitSoundService.playCountdown(false);
    const timer = setInterval(() => {
      setCountdown((value) => {
        const next = value - 1;
        summitSoundService.playCountdown(next === 0);
        if (next <= 0) {
          clearInterval(timer);
          setPhase('playing');
          setShowGo(true);
          setTimeout(() => setShowGo(false), 700);
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'playing') summitSoundService.silenceEngine();
  }, [phase]);
  useEffect(() => () => summitSoundService.silenceEngine(), []);

  const startSolo = useCallback(() => {
    summitSoundService.unlock();
    setMode('solo');
    beginWorld(randomSeed());
    setPhase('playing');
  }, [beginWorld]);

  const finishRun = useCallback(
    (world: World) => {
      // The loop can tick again before React re-renders; flip the ref now so the run ends once.
      phaseRef.current = 'over';
      const run = buildRunResult(world, progressRef.current);
      recordRun(run);
      setResult(run);
      setPhase('over');
      if (inRace) {
        race.publishFinish({
          distance: run.distance,
          score: run.score,
          coins: run.coins,
          reason: run.reason,
        });
      } else {
        void recordGamePlayed(run.isNewBest, 'arcade');
      }
    },
    [inRace, progressRef, race, recordGamePlayed, recordRun],
  );

  const onEvents = useCallback((events: WorldEvent[]) => {
    for (const event of events) summitSoundService.playEvent(event);
  }, []);

  const onFrame = useCallback(
    (world: World, now: number) => {
      const current = phaseRef.current;
      const driving = current === 'playing' && world.status === 'running';
      const v = world.vehicle;
      summitSoundService.updateEngine(
        Math.min(1, Math.abs(v.wheels[0].spin) / 40),
        world.input.gas,
        driving && world.fuel > 0,
      );
      if (inRace && (current === 'playing' || current === 'over'))
        race.publishFrame(world, runScore(world), now);
      if (current === 'playing' && world.status === 'ended') finishRun(world);
    },
    [finishRun, inRace, race],
  );

  const onHud = useCallback(
    (sample: HudSnapshot) => {
      setHud(sample);
      setHint(
        phaseRef.current === 'playing'
          ? hintFor(sample, progressRef.current.totalRuns < NEWBIE_RUNS)
          : null,
      );
    },
    [progressRef],
  );

  const getFocus = useCallback((): Vec2 | null => {
    if (!inRace || phaseRef.current !== 'over' || race.rivalRef.current.status === 'ended')
      return null;
    const [ghost] = race.getGhosts(performance.now());
    return ghost ? { x: ghost.pose.x, y: ghost.pose.y } : null;
  }, [inRace, race]);

  const endRunEarly = useCallback(() => {
    const world = worldRef.current;
    if (!world) return;
    world.status = 'ended';
    world.crashReason ??= 'fuel';
    finishRun(world);
  }, [finishRun]);

  const togglePause = useCallback(() => {
    if (inRace) return;
    setPhase((p) => (p === 'playing' ? 'paused' : p === 'paused' ? 'playing' : p));
  }, [inRace]);

  const openUpgrades = useCallback((from: 'menu' | 'over') => {
    setUpgradesReturn(from);
    setPhase('upgrades');
  }, []);

  const handleBuy = useCallback(
    (id: Parameters<typeof buyUpgrade>[0]) => {
      if (buyUpgrade(id)) summitSoundService.playPurchase();
    },
    [buyUpgrade],
  );

  const toMenu = useCallback(() => {
    beginWorld(randomSeed());
    setPhase('menu');
  }, [beginWorld]);

  const sendReady = useCallback(() => {
    setIsReady(true);
    race.sendReady();
  }, [race]);

  const rivalFinish = race.rival.finish;
  const rivalGone = inRace && !race.opponent;
  let raceOutcome: RaceOutcome | null = null;
  if (inRace && result) {
    if (rivalFinish) raceOutcome = decideRaceOutcome(result, rivalFinish);
    else if (rivalGone) raceOutcome = 'win';
  }

  const recordedRaceRef = useRef<string | null>(null);
  useEffect(() => {
    if (!raceOutcome || !race.raceId || recordedRaceRef.current === race.raceId) return;
    recordedRaceRef.current = race.raceId;
    void recordGamePlayed(raceOutcome === 'win', 'arcade');
  }, [raceOutcome, race.raceId, recordGamePlayed]);

  // Leaving the room mid-race drops back to solo.
  useEffect(() => {
    if (!race.roomCode && mode === 'online' && phase === 'countdown') toMenu();
  }, [race.roomCode, mode, phase, toMenu]);

  return {
    progress,
    worldRef,
    phase,
    setPhase,
    mode,
    setMode,
    upgradesReturn,
    result,
    countdown,
    showGo,
    hud,
    hint,
    isReady,
    race,
    inRace,
    raceOutcome,
    rivalGone,
    startSolo,
    togglePause,
    endRunEarly,
    openUpgrades,
    handleBuy,
    toMenu,
    sendReady,
    onEvents,
    onFrame,
    onHud,
    getFocus,
  };
}
