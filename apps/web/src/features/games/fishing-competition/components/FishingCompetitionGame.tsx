'use client';

import {
  Compass,
  Fish,
  Flame,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Trophy,
  Volume2,
  VolumeX,
  Waves,
} from 'lucide-react';
import Link from 'next/link';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  castLine,
  createInitialFishingState,
  FISHING_LOCATIONS,
  hookFish,
  setReeling,
  stepFishingMatch,
  type FishingLocationId,
  type FishingMatchState,
} from '../engine/fishing-competition-engine';
import { FishingWaterCanvas } from './FishingWaterCanvas';

export function FishingCompetitionGame() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showRules, setShowRules] = useState(false);
  const [chargingPower, setChargingPower] = useState(0);
  const [isCharging, setIsCharging] = useState(false);

  const [gameState, setGameState] = useState<FishingMatchState>(() =>
    createInitialFishingState({ locationId: 'lake', playerCount: 4, matchDuration: 90 }),
  );

  const audioCtxRef = useRef<AudioContext | null>(null);
  const chargeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const user = gameState.players[0];

  // Sound Synthesizer via Web Audio API
  const playSound = useCallback(
    (type: 'cast' | 'bite' | 'hook' | 'reel' | 'catch' | 'snap') => {
      if (!soundEnabled) return;
      try {
        if (!audioCtxRef.current) {
          const AudioContextClass =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          audioCtxRef.current = new AudioContextClass();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') ctx.resume();

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        switch (type) {
          case 'cast':
            osc.type = 'sine';
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.exponentialRampToValueAtTime(80, now + 0.3);
            gain.gain.setValueAtTime(0.25, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
            break;
          case 'bite':
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(880, now);
            osc.frequency.setValueAtTime(1174.66, now + 0.08);
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
            osc.start(now);
            osc.stop(now + 0.2);
            break;
          case 'hook':
            osc.type = 'square';
            osc.frequency.setValueAtTime(220, now);
            osc.frequency.exponentialRampToValueAtTime(440, now + 0.15);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
            osc.start(now);
            osc.stop(now + 0.2);
            break;
          case 'reel':
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(600 + Math.random() * 200, now);
            gain.gain.setValueAtTime(0.06, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
            osc.start(now);
            osc.stop(now + 0.05);
            break;
          case 'catch':
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(523.25, now);
            osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.12);
            osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.24);
            osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.36);
            gain.gain.setValueAtTime(0.35, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
            osc.start(now);
            osc.stop(now + 0.6);
            break;
          case 'snap':
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(180, now);
            osc.frequency.exponentialRampToValueAtTime(60, now + 0.25);
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
            break;
        }
      } catch {
        // Ignore audio errors
      }
    },
    [soundEnabled],
  );

  // Main match simulation tick (60 FPS)
  useEffect(() => {
    let lastTime = performance.now();
    const interval = setInterval(() => {
      const now = performance.now();
      const dt = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;

      setGameState((prev) => {
        if (prev.isGameOver) return prev;
        const next = { ...prev };

        // Sound triggers on state changes
        const prevStatus = next.players[0].status;
        stepFishingMatch(next, dt);
        const currStatus = next.players[0].status;

        if (prevStatus !== currStatus) {
          if (currStatus === 'bite_active') playSound('bite');
          else if (currStatus === 'celebrating_catch') playSound('catch');
          else if (currStatus === 'escaped') playSound('snap');
        }

        if (next.players[0].isReeling) {
          if (Math.random() < 0.2) playSound('reel');
        }

        return next;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [playSound]);

  // Charging cast power loop
  const startCharging = () => {
    if (user.status !== 'idle') return;
    setIsCharging(true);
    setChargingPower(10);

    let power = 10;
    let direction = 2.5;

    chargeIntervalRef.current = setInterval(() => {
      power += direction;
      if (power >= 100) {
        power = 100;
        direction = -2.5;
      } else if (power <= 15) {
        power = 15;
        direction = 2.5;
      }
      setChargingPower(Math.round(power));
    }, 25);
  };

  const releaseCast = () => {
    if (!isCharging) return;
    setIsCharging(false);
    if (chargeIntervalRef.current) clearInterval(chargeIntervalRef.current);

    setGameState((prev) => {
      const next = { ...prev };
      castLine(next, user.id, chargingPower);
      playSound('cast');
      return next;
    });
  };

  // Keyboard Spacebar for Cast & Reel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        if (user.status === 'idle') {
          startCharging();
        } else if (user.status === 'bite_active') {
          handleHook();
        } else if (user.status === 'reeling') {
          handleSetReel(true);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (isCharging) {
          releaseCast();
        } else if (user.status === 'reeling') {
          handleSetReel(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  });

  // Hook button handler
  const handleHook = () => {
    setGameState((prev) => {
      const next = { ...prev };
      hookFish(next.players[0]);
      playSound('hook');
      return next;
    });
  };

  // Reel button handler
  const handleSetReel = (reeling: boolean) => {
    setGameState((prev) => {
      const next = { ...prev };
      setReeling(next.players[0], reeling);
      return next;
    });
  };

  // Switch Location
  const handleSwitchLocation = (locId: FishingLocationId) => {
    setGameState(
      createInitialFishingState({
        locationId: locId,
        playerCount: 4,
        matchDuration: gameState.matchDurationSeconds,
      }),
    );
  };

  // Restart match
  const handleRestart = () => {
    setGameState(
      createInitialFishingState({
        locationId: gameState.location.id,
        playerCount: 4,
        matchDuration: 90,
      }),
    );
  };

  const isLucky = gameState.activeEvent.id === 'lucky_lure';
  const minSafe = isLucky ? 25 : 35;
  const maxSafe = isLucky ? 85 : 75;

  return (
    <div className="relative min-h-[720px] w-full max-w-6xl mx-auto flex flex-col gap-4 p-4 md:p-6 bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 shadow-2xl select-none">
      {/* Top Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-sky-500/10 border border-sky-500/30 rounded-xl text-sky-400">
            <Fish className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">
                Fishing Competition
              </h1>
              <span className="px-2 py-0.5 text-xs font-bold rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                ARCADE TOURNAMENT
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Location: <strong className="text-sky-300">{gameState.location.name}</strong> •{' '}
              {gameState.location.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSoundEnabled((v) => !v)}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title={soundEnabled ? 'Mute audio' : 'Enable audio'}
            aria-label={soundEnabled ? 'Mute audio' : 'Enable audio'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={() => setShowRules(true)}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Tournament Rules"
            aria-label="Tournament Rules"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleRestart}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart</span>
          </button>
        </div>
      </header>

      {/* Location Bar & Active Weather Event */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/80 rounded-xl border border-slate-800">
        {/* Location selector pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {(Object.keys(FISHING_LOCATIONS) as FishingLocationId[]).map((locKey) => {
            const loc = FISHING_LOCATIONS[locKey];
            const isSelected = loc.id === gameState.location.id;
            return (
              <button
                key={loc.id}
                type="button"
                onClick={() => handleSwitchLocation(loc.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-sky-500 text-slate-950 shadow-md ring-1 ring-sky-400/50'
                    : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                <Compass className="w-3 h-3" />
                <span>{loc.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Special Event Banner */}
        <div className="flex items-center gap-2">
          {gameState.activeEvent.id !== 'none' ? (
            <div className="px-3 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{gameState.activeEvent.name}</span>
              <span className="text-[10px] text-amber-400/80">
                ({Math.ceil(gameState.eventCountdown)}s)
              </span>
            </div>
          ) : (
            <div className="text-xs text-slate-500 font-medium">Standard Water Conditions</div>
          )}

          {/* Match Countdown Clock */}
          <div
            className={`px-3 py-1 rounded-lg font-mono text-xs font-bold border transition-colors ${
              gameState.timeRemainingSeconds <= 15
                ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse'
                : 'bg-slate-800 text-slate-200 border-slate-700'
            }`}
          >
            ⏱ {Math.ceil(gameState.timeRemainingSeconds)}s
          </div>
        </div>
      </div>

      {/* Main Fishing Water Canvas Stage */}
      <div className="relative">
        <FishingWaterCanvas
          location={gameState.location}
          player={user}
          isReeling={user.isReeling}
        />

        {/* Overlay Action HUD based on player state */}
        <div className="mt-3 p-4 bg-slate-900/90 rounded-xl border border-slate-800 shadow-xl flex flex-col gap-3">
          {/* Status 1: IDLE / CHARGING CAST */}
          {user.status === 'idle' && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-300">
                <p className="font-bold text-white text-sm">Ready to Cast Your Line</p>
                <p className="text-slate-400">
                  Hold the button (or Spacebar) to build power, then release to cast!
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {/* Power Bar */}
                <div className="w-36 h-4 bg-slate-800 rounded-full border border-slate-700 overflow-hidden relative">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 transition-all duration-75"
                    style={{ width: `${chargingPower}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white drop-shadow">
                    {chargingPower}%
                  </span>
                </div>

                <button
                  type="button"
                  onPointerDown={startCharging}
                  onPointerUp={releaseCast}
                  onPointerLeave={releaseCast}
                  className="flex-1 sm:flex-none px-6 py-3 bg-sky-500 hover:bg-sky-400 active:scale-95 text-slate-950 font-black rounded-xl text-sm transition-all shadow-lg shadow-sky-500/20"
                >
                  {isCharging ? 'Release to Cast!' : 'Hold to Cast'}
                </button>
              </div>
            </div>
          )}

          {/* Status 2: WAITING FOR BITE */}
          {user.status === 'waiting_for_bite' && (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-ping" />
                <span className="text-xs font-bold text-slate-300">
                  Bobber in water ({user.castPower}% cast distance). Watching for ripples...
                </span>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                Press Space or button on bite
              </span>
            </div>
          )}

          {/* Status 3: BITE ACTIVE — STRIKE BUTTON! */}
          {user.status === 'bite_active' && (
            <div className="flex items-center justify-between gap-4 animate-pulse">
              <div className="flex items-center gap-2">
                <span className="text-xl">❗</span>
                <div>
                  <div className="text-sm font-black text-amber-300">FISH ON THE HOOK!</div>
                  <div className="text-xs text-slate-400">Strike now before it gets away!</div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleHook}
                className="px-8 py-3.5 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black rounded-xl text-base transition-all shadow-xl shadow-amber-500/30 flex items-center gap-2"
              >
                <span>🎣 STRIKE & HOOK!</span>
              </button>
            </div>
          )}

          {/* Status 4: REELING & TENSION GAUGE */}
          {user.status === 'reeling' && (
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-white">
                    Fighting: {user.targetFish?.rarity.toUpperCase()} {user.targetFish?.name}
                  </span>
                </div>
                <div className="font-mono text-slate-300">
                  Distance:{' '}
                  <strong className="text-sky-300">{Math.round(user.reelDistance)}m left</strong>
                </div>
              </div>

              {/* Line Tension Gauge */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <span className="text-sky-400">Slack (&lt;{minSafe}%)</span>
                  <span className="text-emerald-400">
                    Sweet Spot ({minSafe}-{maxSafe}%)
                  </span>
                  <span className="text-rose-400">Snap Hazard (&gt;{maxSafe}%)</span>
                </div>

                <div className="relative w-full h-5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                  {/* Sweet spot indicator overlay */}
                  <div
                    className="absolute top-0 bottom-0 bg-emerald-500/25 border-x border-emerald-400/40"
                    style={{ left: `${minSafe}%`, width: `${maxSafe - minSafe}%` }}
                  />

                  {/* Tension Fill */}
                  <div
                    className={`h-full transition-all duration-75 ${
                      user.lineTension > maxSafe
                        ? 'bg-rose-500'
                        : user.lineTension < minSafe
                          ? 'bg-sky-500'
                          : 'bg-emerald-500'
                    }`}
                    style={{ width: `${user.lineTension}%` }}
                  />

                  {/* Pointer Needle */}
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-white shadow-md transition-all duration-75"
                    style={{ left: `${user.lineTension}%` }}
                  />
                </div>
              </div>

              {/* Reeling Action Controls */}
              <div className="flex items-center justify-between gap-4 pt-1">
                <div className="text-xs text-slate-400">
                  {user.lineTension > maxSafe ? (
                    <span className="text-rose-400 font-bold animate-pulse">
                      ⚠️ TENSION TOO HIGH! Release reel to avoid snap!
                    </span>
                  ) : user.lineTension < minSafe ? (
                    <span className="text-sky-400 font-bold animate-pulse">
                      ⚠️ LINE SLACK! Reel in to keep hook set!
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-bold">
                      ✓ OPTIMAL TENSION! Keep reeling smoothly!
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onPointerDown={() => handleSetReel(true)}
                  onPointerUp={() => handleSetReel(false)}
                  onPointerLeave={() => handleSetReel(false)}
                  className={`px-8 py-3 rounded-xl font-black text-sm transition-all shadow-lg ${
                    user.isReeling
                      ? 'bg-emerald-400 text-slate-950 scale-95 ring-2 ring-emerald-300'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                  }`}
                >
                  {user.isReeling ? 'Reeling In! ↺' : 'Hold to Reel In'}
                </button>
              </div>
            </div>
          )}

          {/* Status 5: CELEBRATING CATCH */}
          {user.status === 'celebrating_catch' && user.catches.length > 0 && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-800/80 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{user.catches[0].icon}</span>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Trophy Landed!
                  </div>
                  <div className="text-sm font-black text-white">
                    {user.catches[0].rarity.toUpperCase()} {user.catches[0].name} (
                    {user.catches[0].weightKg} kg)
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-base font-black text-amber-300">
                  +{user.catches[0].points} pts
                </div>
                <div className="text-[10px] text-slate-400">Added to Creel</div>
              </div>
            </div>
          )}

          {/* Status 6: ESCAPED */}
          {user.status === 'escaped' && (
            <div className="p-3 bg-rose-950/60 border border-rose-800/80 rounded-xl text-xs text-rose-300 text-center font-bold">
              The fish got away! Resetting line...
            </div>
          )}
        </div>
      </div>

      {/* Tournament Leaderboard & Catches Feed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Fisher Standings */}
        <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-bold text-slate-300">
            <div className="flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Standings</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">4 Anglers</span>
          </div>

          <div className="space-y-1.5">
            {[...gameState.players]
              .sort((a, b) => b.score - a.score)
              .map((p, idx) => (
                <div
                  key={p.id}
                  className={`p-2 rounded-lg border flex items-center justify-between text-xs ${
                    idx === 0
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-500">#{idx + 1}</span>
                    <span className="font-semibold">{p.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {p.catches.length} catches
                    </span>
                    <span className="font-mono font-bold text-white">{p.score} pts</span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Your Catch Log / Creel */}
        <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-bold text-slate-300">
            <div className="flex items-center gap-1.5">
              <Fish className="w-3.5 h-3.5 text-sky-400" />
              <span>Your Creel</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              {user.catches.length} landed
            </span>
          </div>

          <div className="max-h-36 overflow-y-auto space-y-1 text-xs">
            {user.catches.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">
                No catches yet. Cast your line into the water!
              </div>
            ) : (
              user.catches.map((c, i) => (
                <div
                  key={`${c.speciesId}-${i}`}
                  className="p-1.5 rounded bg-slate-800/60 border border-slate-700/60 flex items-center justify-between"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{c.icon}</span>
                    <span className="font-medium text-slate-200">{c.name}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[10px]">
                    <span className="text-slate-400">{c.weightKg} kg</span>
                    <span className="text-amber-400 font-bold">+{c.points}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-bold text-slate-300">
            <div className="flex items-center gap-1.5">
              <Waves className="w-3.5 h-3.5 text-sky-400" />
              <span>Tournament Log</span>
            </div>
          </div>

          <div className="max-h-36 overflow-y-auto space-y-1.5 text-[11px] text-slate-400">
            {gameState.activityLog.slice(0, 8).map((log, idx) => (
              <div key={idx} className="p-1 rounded bg-slate-800/40">
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal: Game Over Podium */}
      {gameState.isGameOver && (
        <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md rounded-2xl flex items-center justify-center p-6 z-40">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl text-center space-y-4">
            <div className="inline-flex p-3 bg-amber-500/20 rounded-xl text-amber-400 border border-amber-500/40">
              <Trophy className="w-10 h-10 animate-bounce" />
            </div>
            <h2 className="text-2xl font-black text-white">Tournament Complete!</h2>
            <p className="text-xs text-slate-400">
              The competition has ended. Here are the final tournament results:
            </p>

            {/* Standings list */}
            <div className="space-y-2 pt-2">
              {[...gameState.players]
                .sort((a, b) => b.score - a.score)
                .map((p, idx) => (
                  <div
                    key={p.id}
                    className={`p-2.5 rounded-lg border flex items-center justify-between ${
                      idx === 0
                        ? 'bg-amber-500/20 border-amber-500/60 text-amber-200 font-black'
                        : 'bg-slate-800 border-slate-700 text-slate-300 text-xs'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-400">#{idx + 1}</span>
                      <span>{p.name}</span>
                    </div>
                    <div className="flex items-center gap-3 font-mono">
                      <span className="text-[10px] text-slate-400">{p.catches.length} catches</span>
                      <span>{p.score} pts</span>
                    </div>
                  </div>
                ))}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleRestart}
                className="flex-1 py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black rounded-xl text-sm transition-colors shadow-lg"
              >
                Fish Again
              </button>
              <Link
                href="/games"
                className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-sm font-semibold transition-colors border border-slate-700"
              >
                Back to Arcade
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Rules Modal */}
      {showRules && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm rounded-2xl flex items-center justify-center p-6 z-50">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-sky-400" />
                How to Play Fishing Competition
              </h3>
              <button
                type="button"
                onClick={() => setShowRules(false)}
                className="text-slate-400 hover:text-white text-xs font-mono"
              >
                ✕ Close
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-2.5 leading-relaxed">
              <p>
                <strong>1. Cast Power:</strong> Press and hold the cast button or Spacebar to build
                distance power. Higher power increases the chance of rare and legendary fish!
              </p>
              <p>
                <strong>2. Watch for Bites:</strong> When the bobber dips and splashes with an
                exclamation mark, hit the Strike button immediately to set the hook.
              </p>
              <p>
                <strong>3. Tension Management:</strong> When reeling, keep the needle inside the
                green sweet spot (35-75%). Excessive tension snaps your line, while slack line lets
                the fish spit the hook!
              </p>
              <p>
                <strong>4. Dynamic Events:</strong> Watch out for Golden Hour (3x legendary rate)
                and Double Points Frenzy to surge ahead on the leaderboard!
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowRules(false)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-colors border border-slate-700"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
