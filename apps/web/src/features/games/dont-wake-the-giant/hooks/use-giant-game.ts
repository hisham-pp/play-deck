'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { useGiantMultiplayerStore } from '@/stores/giant-multiplayer.store';
import { usePreferencesStore } from '@/stores/preferences.store';
import { botInput, claimsOf, createBotMemory, type BotMemory } from '../engine/giant-bot';
import { MAP_HEIGHT, MAP_WIDTH, MOOD_ASLEEP, PHASE_ESCAPE } from '../engine/giant-constants';
import { GiantEngine } from '../engine/giant-engine';
import type { StepResult } from '../engine/giant-engine';
import type { RoundSetup } from '../engine/giant-state';
import { isOver } from '../engine/scoring';
import { createRoundId, type RoundStartPayload } from '../multiplayer/giant-protocol';
import { prepareCanvas, renderFrame } from '../render/giant-renderer';
import { giantSound } from '../services/giant-sound.service';
import type { GiantHud, GiantInput, GiantSeat } from '../types/giant.types';
import { EMPTY_HUD, moodAnnouncement, phaseAnnouncement, projectHud } from './giant-hud';
import { useGiantInput, type GiantControls } from './use-giant-input';
import { useGiantLoop } from './use-giant-loop';
import { useGiantMultiplayer } from './use-giant-multiplayer';

/** React re-renders at this cadence; the simulation runs every frame regardless. */
const HUD_INTERVAL_MS = 120;
const MOOD_SEVERITY = { asleep: 0, stirring: 0.35, restless: 0.75, awake: 1 } as const;

export interface UseGiantGameOptions {
  seats: GiantSeat[];
  mapId: string;
  heistMs: number;
  isOnline: boolean;
  isHost: boolean;
  localPlayerId: string | null;
  onSeatsFromHost: (seats: GiantSeat[]) => void;
  onHeistEnd: (engine: GiantEngine) => void;
}

export interface GiantGame {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  hud: GiantHud;
  controls: GiantControls;
  /** Host and offline only: deals a fresh heist and tells the room. */
  startHeist: () => void;
  highContrast: boolean;
  setHighContrast: (on: boolean) => void;
}

export function useGiantGame(options: UseGiantGameOptions): GiantGame {
  const { seats, isOnline, isHost, localPlayerId } = options;

  const engineRef = useRef<GiantEngine | null>(null);
  const roundIdRef = useRef('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const botMemory = useRef(new Map<string, BotMemory>());
  const announcement = useRef('');
  const hudClock = useRef(0);
  const lastBeep = useRef(-1);
  const endedRef = useRef(false);

  const [hud, setHud] = useState<GiantHud>(EMPTY_HUD);
  const [highContrast, setHighContrast] = useState(false);
  const reducedMotion = usePreferencesStore((state) => state.reducedMotion);
  const soundEnabled = usePreferencesStore((state) => state.soundEnabled);
  const disconnectedIds = useGiantMultiplayerStore((state) => state.disconnectedIds);

  const latest = useRef(options);
  latest.current = options;

  const colors = useMemo(
    () => Object.fromEntries(seats.map((seat) => [seat.id, seat.color])),
    [seats],
  );

  useEffect(() => giantSound.setSoundEnabled(soundEnabled), [soundEnabled]);

  const beginHeist = useCallback((setup: RoundSetup, roundId: string) => {
    roundIdRef.current = roundId;
    endedRef.current = false;
    lastBeep.current = -1;
    announcement.current = '';
    botMemory.current = new Map(
      setup.seats.filter((seat) => seat.type === 'bot').map((seat) => [seat.id, createBotMemory()]),
    );

    if (engineRef.current) engineRef.current.reset(setup);
    else engineRef.current = new GiantEngine(setup);
  }, []);

  const adoptHeist = useCallback(
    (payload: RoundStartPayload) => {
      latest.current.onSeatsFromHost(payload.seats);
      beginHeist(
        { seats: payload.seats, mapId: payload.mapId, heistMs: payload.heistMs },
        payload.roundId,
      );
    },
    [beginHeist],
  );

  const network = useGiantMultiplayer({
    enabled: isOnline,
    engineRef,
    roundIdRef,
    localPlayerId,
    isHost,
    onRoundStart: adoptHeist,
    onSeats: (incoming) => latest.current.onSeatsFromHost(incoming),
    onRemoteTake: (event) =>
      event.kind === 'charm' ? giantSound.playCharm() : giantSound.playTake(),
  });

  const startHeist = useCallback(() => {
    const roundId = createRoundId();
    const setup: RoundSetup = {
      seats: latest.current.seats,
      mapId: latest.current.mapId,
      heistMs: latest.current.heistMs,
    };
    beginHeist(setup, roundId);
    if (latest.current.isOnline && latest.current.isHost) {
      network.broadcastStart({ roundId, ...setup });
    }
  }, [beginHeist, network]);

  // The first heist deals itself offline; online it waits for the host's START.
  useEffect(() => {
    if (engineRef.current || seats.length === 0) return;
    if (isOnline && !isHost) return;
    startHeist();
  }, [isOnline, isHost, seats.length, startHeist]);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    for (const seat of seats) engine.setConnected(seat.id, !disconnectedIds.includes(seat.id));
  }, [disconnectedIds, seats]);

  const controls = useGiantInput(true);

  const collectInputs = useCallback(
    (engine: GiantEngine, authoritative: boolean): Record<string, GiantInput> => {
      const inputs: Record<string, GiantInput> = {};
      const me = latest.current.localPlayerId;
      if (me) inputs[me] = controls.readInput();
      if (!authoritative) return inputs;

      const world = engine.getWorld();
      // What the rest of the crew is already walking towards, so two bots do
      // not converge on one goblet and barge into each other taking it.
      const claimed = claimsOf(botMemory.current.values());

      for (const seat of latest.current.seats) {
        if (seat.type !== 'bot') continue;
        const thief = engine.thief(seat.id);
        if (!thief) continue;
        let memory = botMemory.current.get(seat.id);
        if (!memory) {
          memory = createBotMemory();
          botMemory.current.set(seat.id, memory);
        }
        inputs[seat.id] = botInput(world, thief, memory, claimed);
      }
      return inputs;
    },
    [controls],
  );

  /** Turns one frame's events into sound, speech and broadcasts. */
  const reactToFrame = useCallback(
    (result: StepResult, online: boolean) => {
      for (const take of result.takes) {
        if (take.kind === 'charm') giantSound.playCharm();
        else giantSound.playTake();
        if (online) network.broadcastTake(take);
      }
      if (result.banks.length > 0) giantSound.playEscape();
      if (result.spikes > result.takes.length) giantSound.playBump();

      if (result.moodChanged) {
        announcement.current = moodAnnouncement(result.moodChanged);
        if (result.moodChanged === 'awake') giantSound.playWake();
        else if (result.moodChanged !== MOOD_ASLEEP) {
          giantSound.playStir(MOOD_SEVERITY[result.moodChanged]);
        }
      }
      if (result.phaseChanged) {
        const line = phaseAnnouncement(result.phaseChanged, 0);
        if (line) announcement.current = line;
        if (result.phaseChanged === PHASE_ESCAPE) giantSound.playCountdown(true);
      }
    },
    [network],
  );

  useGiantLoop(seats.length > 0, (dtSec) => {
    const engine = engineRef.current;
    if (!engine) return;

    const now = typeof performance === 'undefined' ? Date.now() : performance.now();
    const online = latest.current.isOnline;
    const authoritative = !online || latest.current.isHost;

    if (online) network.applyRemotePoses(now);

    const result = engine.step(dtSec, collectInputs(engine, authoritative), { authoritative });
    reactToFrame(result, online);

    if (online) network.publish(now);

    const world = engine.getWorld();
    const canvas = canvasRef.current;
    const ctx = canvas ? prepareCanvas(canvas, MAP_WIDTH, MAP_HEIGHT) : null;
    if (ctx) {
      renderFrame(ctx, {
        world,
        options: {
          colors,
          localPlayerId: latest.current.localPlayerId,
          highContrast,
          reducedMotion,
        },
      });
    }

    const beat = Math.ceil(Math.max(0, world.countdownMs - world.elapsedMs) / 1000);
    if (beat !== lastBeep.current && beat > 0) {
      lastBeep.current = beat;
      giantSound.playCountdown(beat === 1);
    }

    hudClock.current += dtSec * 1000;
    if (hudClock.current >= HUD_INTERVAL_MS) {
      hudClock.current = 0;
      setHud(
        projectHud(
          engine,
          latest.current.seats,
          latest.current.localPlayerId,
          announcement.current,
        ),
      );
    }

    if (isOver(world) && !endedRef.current) {
      endedRef.current = true;
      announcement.current = phaseAnnouncement(world.phase, world.bankedTotal);
      latest.current.onHeistEnd(engine);
    }
  });

  return { canvasRef, hud, controls, startHeist, highContrast, setHighContrast };
}
