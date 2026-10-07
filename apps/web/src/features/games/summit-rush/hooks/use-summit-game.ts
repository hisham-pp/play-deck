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
import { useAchievementsStore } from '@/stores/achievements.store';
import { PLAYDECK_ACHIEVEMENTS } from '@/data/achievements';

export type SummitPhase = 'menu' | 'countdown' | 'playing' | 'paused' | 'over' | 'upgrades' | 'vehicles' | 'maps' | 'leaderboard';

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
  const { progress, progressRef, isLoaded, recordRun, buyUpgrade, selectVehicle, selectMap, unlockVehicle, unlockMap } = useSummitProgress();
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

  if (worldRef.current === null) {
    worldRef.current = createWorld(
      randomSeed(), 
      progress.upgrades, 
      progress.selectedVehicleId, 
      progress.selectedMapId
    );
  }

  const beginWorld = useCallback(
    (seed: number) => {
      worldRef.current = createWorld(
        seed, 
        progressRef.current.upgrades, 
        progressRef.current.selectedVehicleId, 
        progressRef.current.selectedMapId
      );
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

  // A fresh menu course whenever upgrades load, or when selected vehicle/map changes.
  useEffect(() => {
    if (isLoaded && ['menu', 'vehicles', 'maps', 'upgrades'].includes(phase)) {
      beginWorld(randomSeed());
    }
  }, [isLoaded, phase, progress.selectedVehicleId, progress.selectedMapId, beginWorld]);

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
      
      const p = progressRef.current;
      const store = useAchievementsStore.getState();
      
      // --- Single Run Achievements ---
      if (run.distance >= 500) store.unlock(PLAYDECK_ACHIEVEMENTS.summit_dist_500);
      if (run.distance >= 1000) store.unlock(PLAYDECK_ACHIEVEMENTS.summit_dist_1000);
      if (run.distance >= 2500) store.unlock(PLAYDECK_ACHIEVEMENTS.summit_dist_2500);
      if (run.distance >= 5000) store.unlock(PLAYDECK_ACHIEVEMENTS.summit_dist_5000);
      if (run.distance >= 10000) store.unlock(PLAYDECK_ACHIEVEMENTS.summit_dist_10000);

      if (run.score >= 5000) store.unlock(PLAYDECK_ACHIEVEMENTS.summit_score_5k);
      if (run.score >= 20000) store.unlock(PLAYDECK_ACHIEVEMENTS.summit_score_20k);
      if (run.score >= 50000) store.unlock(PLAYDECK_ACHIEVEMENTS.summit_score_50k);
      if (run.score >= 100000) store.unlock(PLAYDECK_ACHIEVEMENTS.summit_score_100k);
      if (run.score >= 250000) store.unlock(PLAYDECK_ACHIEVEMENTS.summit_score_250k);

      if (run.distance >= 1000) {
        if (p.selectedMapId === 'meadows') store.unlock(PLAYDECK_ACHIEVEMENTS.summit_meadows_1000);
        if (p.selectedMapId === 'desert') store.unlock(PLAYDECK_ACHIEVEMENTS.summit_desert_1000);
        if (p.selectedMapId === 'snow') store.unlock(PLAYDECK_ACHIEVEMENTS.summit_snow_1000);
        if (p.selectedMapId === 'moon') store.unlock(PLAYDECK_ACHIEVEMENTS.summit_moon_1000);
      }

      // --- Fail/Crash Achievements ---
      if (run.reason === 'fuel') store.unlock(PLAYDECK_ACHIEVEMENTS.summit_fail_gas);
      if (run.reason === 'head') store.unlock(PLAYDECK_ACHIEVEMENTS.summit_fail_flip);
      if (run.distance < 50 && (run.reason === 'head' || run.reason === 'flipped' || run.reason === 'gap')) {
        store.unlock(PLAYDECK_ACHIEVEMENTS.summit_fail_quick);
      }

      // --- Cumulative Achievements (evaluated after adding current run) ---
      const totalRuns = p.totalRuns + 1;
      if (totalRuns >= 10) store.unlock(PLAYDECK_ACHIEVEMENTS.summit_runs_10);
      if (totalRuns >= 50) store.unlock(PLAYDECK_ACHIEVEMENTS.summit_runs_50);
      if (totalRuns >= 250) store.unlock(PLAYDECK_ACHIEVEMENTS.summit_runs_250);
      if (totalRuns >= 1000) store.unlock(PLAYDECK_ACHIEVEMENTS.summit_runs_1000);

      const totalDist = p.totalDistance + run.distance;
      if (totalDist >= 10000) store.unlock(PLAYDECK_ACHIEVEMENTS.summit_total_dist_10k);
      if (totalDist >= 50000) store.unlock(PLAYDECK_ACHIEVEMENTS.summit_total_dist_50k);
      if (totalDist >= 250000) store.unlock(PLAYDECK_ACHIEVEMENTS.summit_total_dist_250k);
      if (totalDist >= 1000000) store.unlock(PLAYDECK_ACHIEVEMENTS.summit_total_dist_1000k);

      const totalCoins = p.coins + run.coins;
      if (totalCoins >= 100) store.unlock(PLAYDECK_ACHIEVEMENTS.summit_coins_100);
      if (totalCoins >= 1000) store.unlock(PLAYDECK_ACHIEVEMENTS.summit_coins_1k);
      if (totalCoins >= 10000) store.unlock(PLAYDECK_ACHIEVEMENTS.summit_coins_10k);
      if (totalCoins >= 50000) store.unlock(PLAYDECK_ACHIEVEMENTS.summit_coins_50k);
      if (totalCoins >= 100000) store.unlock(PLAYDECK_ACHIEVEMENTS.summit_coins_100k);

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
    const store = useAchievementsStore.getState();
    for (const event of events) {
      summitSoundService.playEvent(event);
      if (event.type === 'land' && event.impact < 1) {
        store.unlock(PLAYDECK_ACHIEVEMENTS.summit_perfect_landing);
      }
      if (event.type === 'stunt' && event.label) {
        if (event.label.includes('5x BACKFLIP') || event.label.includes('5x FRONTFLIP')) {
          store.unlock(PLAYDECK_ACHIEVEMENTS.summit_flip_5);
        } else if (event.label.includes('4x BACKFLIP') || event.label.includes('4x FRONTFLIP')) {
          store.unlock(PLAYDECK_ACHIEVEMENTS.summit_flip_4);
        } else if (event.label.includes('3x BACKFLIP') || event.label.includes('3x FRONTFLIP')) {
          store.unlock(PLAYDECK_ACHIEVEMENTS.summit_flip_3);
        } else if (event.label.includes('DOUBLE')) {
          store.unlock(PLAYDECK_ACHIEVEMENTS.summit_flip_2);
        } else if (event.label.includes('FLIP')) {
          store.unlock(PLAYDECK_ACHIEVEMENTS.summit_flip_1);
        }
        
        if (event.label.includes('LONG JUMP')) {
          const match = event.label.match(/\d+/);
          if (match) {
            const m = parseInt(match[0], 10);
            if (m >= 150) store.unlock(PLAYDECK_ACHIEVEMENTS.summit_jump_150);
            else if (m >= 100) store.unlock(PLAYDECK_ACHIEVEMENTS.summit_jump_100);
            else if (m >= 75) store.unlock(PLAYDECK_ACHIEVEMENTS.summit_jump_75);
            else if (m >= 50) store.unlock(PLAYDECK_ACHIEVEMENTS.summit_jump_50);
            else if (m >= 25) store.unlock(PLAYDECK_ACHIEVEMENTS.summit_jump_25);
          }
        }
        
        if (event.label.includes('AIR TIME')) {
          const match = event.label.match(/[\d.]+/);
          if (match) {
            const s = parseFloat(match[0]);
            if (s >= 12) store.unlock(PLAYDECK_ACHIEVEMENTS.summit_air_12);
            else if (s >= 8) store.unlock(PLAYDECK_ACHIEVEMENTS.summit_air_8);
            else if (s >= 5) store.unlock(PLAYDECK_ACHIEVEMENTS.summit_air_5);
            else if (s >= 3) store.unlock(PLAYDECK_ACHIEVEMENTS.summit_air_3);
          }
        }
      }
    }
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

  const toVehicles = useCallback(() => setPhase('vehicles'), []);
  const toMaps = useCallback(() => setPhase('maps'), []);
  const toLeaderboard = useCallback(() => setPhase('leaderboard'), []);

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
    toVehicles,
    toMaps,
    toLeaderboard,
    sendReady,
    onEvents,
    onFrame,
    onHud,
    getFocus,
    progressRef,
    selectVehicle,
    unlockVehicle,
    selectMap,
    unlockMap,
  };
}
