'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { usePreferencesStore } from '@/stores/preferences.store';
import { useShadowTagMultiplayerStore } from '@/stores/shadow-tag-multiplayer.store';
import { botInput, createBotMemory, type BotMemory } from '../engine/shadow-tag-bot';
import { ARENA_HEIGHT, ARENA_WIDTH, PHASE_ROUND_OVER } from '../engine/shadow-tag-constants';
import { ShadowTagEngine } from '../engine/shadow-tag-engine';
import { chooseStartingIt, type RoundSetup } from '../engine/shadow-tag-state';
import { createRoundId, type RoundStartPayload } from '../multiplayer/shadow-tag-protocol';
import { prepareCanvas, renderFrame } from '../render/shadow-tag-renderer';
import { shadowTagSound } from '../services/shadow-tag-sound.service';
import type { ShadowTagHud, ShadowTagInput, ShadowTagSeat } from '../types/shadow-tag.types';
import { EMPTY_HUD, projectHud, tagAnnouncement } from './shadow-tag-hud';
import { useShadowTagInput, type ShadowTagControls } from './use-shadow-tag-input';
import { useShadowTagLoop } from './use-shadow-tag-loop';
import { useShadowTagMultiplayer } from './use-shadow-tag-multiplayer';

/** React re-renders at this cadence; the simulation runs every frame regardless. */
const HUD_INTERVAL_MS = 120;

export interface UseShadowTagGameOptions {
  seats: ShadowTagSeat[];
  arenaId: string;
  roundMs: number;
  isOnline: boolean;
  isHost: boolean;
  localPlayerId: string | null;
  onSeatsFromHost: (seats: ShadowTagSeat[]) => void;
  onRoundEnd: (engine: ShadowTagEngine) => void;
}

export interface ShadowTagGame {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  hud: ShadowTagHud;
  controls: ShadowTagControls;
  /** Host and offline only: deals a fresh round and tells the room. */
  startRound: () => void;
  highContrast: boolean;
  setHighContrast: (on: boolean) => void;
}

export function useShadowTagGame(options: UseShadowTagGameOptions): ShadowTagGame {
  const { seats, isOnline, isHost, localPlayerId } = options;

  const engineRef = useRef<ShadowTagEngine | null>(null);
  const roundIdRef = useRef('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const botMemory = useRef(new Map<string, BotMemory>());
  const announcement = useRef('');
  const hudClock = useRef(0);
  const lastBeep = useRef(-1);
  const endedRef = useRef(false);

  const [hud, setHud] = useState<ShadowTagHud>(EMPTY_HUD);
  const [highContrast, setHighContrast] = useState(false);
  const reducedMotion = usePreferencesStore((state) => state.reducedMotion);
  const soundEnabled = usePreferencesStore((state) => state.soundEnabled);
  const disconnectedIds = useShadowTagMultiplayerStore((state) => state.disconnectedIds);

  const latest = useRef(options);
  latest.current = options;

  const colors = useMemo(
    () => Object.fromEntries(seats.map((seat) => [seat.id, seat.color])),
    [seats],
  );

  useEffect(() => shadowTagSound.setSoundEnabled(soundEnabled), [soundEnabled]);

  const beginRound = useCallback((setup: RoundSetup, roundId: string) => {
    roundIdRef.current = roundId;
    endedRef.current = false;
    lastBeep.current = -1;
    announcement.current = '';
    botMemory.current = new Map(
      setup.seats.filter((seat) => seat.type === 'bot').map((seat) => [seat.id, createBotMemory()]),
    );

    if (engineRef.current) engineRef.current.reset(setup);
    else engineRef.current = new ShadowTagEngine(setup);
  }, []);

  const adoptRound = useCallback(
    (payload: RoundStartPayload) => {
      latest.current.onSeatsFromHost(payload.seats);
      beginRound(
        {
          seats: payload.seats,
          arenaId: payload.arenaId,
          roundMs: payload.roundMs,
          itId: payload.itId,
        },
        payload.roundId,
      );
    },
    [beginRound],
  );

  const network = useShadowTagMultiplayer({
    enabled: isOnline,
    engineRef,
    roundIdRef,
    localPlayerId,
    isHost,
    onRoundStart: adoptRound,
    onSeats: (incoming) => latest.current.onSeatsFromHost(incoming),
    onRemoteTag: (event) => {
      announcement.current = tagAnnouncement(
        latest.current.seats,
        event.taggerId,
        event.victimId,
        latest.current.localPlayerId,
      );
      shadowTagSound.playTag();
    },
  });

  const startRound = useCallback(() => {
    const roundId = createRoundId();
    const setup: RoundSetup = {
      seats: latest.current.seats,
      arenaId: latest.current.arenaId,
      roundMs: latest.current.roundMs,
      itId: chooseStartingIt(latest.current.seats),
    };
    beginRound(setup, roundId);
    if (latest.current.isOnline && latest.current.isHost) {
      network.broadcastStart({ roundId, ...setup });
    }
  }, [beginRound, network]);

  // The first round deals itself offline; online it waits for the host's START.
  useEffect(() => {
    if (engineRef.current || seats.length === 0) return;
    if (isOnline && !isHost) return;
    startRound();
  }, [isOnline, isHost, seats.length, startRound]);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    for (const seat of seats) engine.setConnected(seat.id, !disconnectedIds.includes(seat.id));
  }, [disconnectedIds, seats]);

  const controls = useShadowTagInput(true);

  const collectInputs = useCallback(
    (engine: ShadowTagEngine, authoritative: boolean): Record<string, ShadowTagInput> => {
      const inputs: Record<string, ShadowTagInput> = {};
      const me = latest.current.localPlayerId;
      if (me) inputs[me] = controls.readInput();
      if (!authoritative) return inputs;

      const world = engine.getWorld();
      for (const seat of latest.current.seats) {
        if (seat.type !== 'bot') continue;
        const runner = engine.localRunner(seat.id);
        if (!runner) continue;
        let memory = botMemory.current.get(seat.id);
        if (!memory) {
          memory = createBotMemory();
          botMemory.current.set(seat.id, memory);
        }
        inputs[seat.id] = botInput(world, engine.getCasts(), runner, memory);
      }
      return inputs;
    },
    [controls],
  );

  useShadowTagLoop(seats.length > 0, (dtSec) => {
    const engine = engineRef.current;
    if (!engine) return;

    const now = typeof performance === 'undefined' ? Date.now() : performance.now();
    const authoritative = !latest.current.isOnline || latest.current.isHost;

    if (latest.current.isOnline) network.applyRemotePoses(now);

    const result = engine.step(dtSec, collectInputs(engine, authoritative), { authoritative });

    if (result.tag) {
      announcement.current = tagAnnouncement(
        latest.current.seats,
        result.tag.taggerId,
        result.tag.victimId,
        latest.current.localPlayerId,
      );
      shadowTagSound.playTag();
      if (latest.current.isOnline) network.broadcastTag(result.tag);
    }
    if (result.interactions.length > 0) shadowTagSound.playLamp();

    if (latest.current.isOnline) network.publish(now);

    const canvas = canvasRef.current;
    const ctx = canvas ? prepareCanvas(canvas, ARENA_WIDTH, ARENA_HEIGHT) : null;
    if (ctx) {
      renderFrame(ctx, {
        world: engine.getWorld(),
        casts: engine.getCasts(),
        options: {
          colors,
          localPlayerId: latest.current.localPlayerId,
          highContrast,
          reducedMotion,
        },
      });
    }

    const beat = Math.ceil(
      Math.max(0, engine.getWorld().countdownMs - engine.getWorld().elapsedMs) / 1000,
    );
    if (beat !== lastBeep.current && beat > 0) {
      lastBeep.current = beat;
      shadowTagSound.playCountdown(beat === 1);
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

    if (engine.getWorld().phase === PHASE_ROUND_OVER && !endedRef.current) {
      endedRef.current = true;
      shadowTagSound.playRoundEnd();
      latest.current.onRoundEnd(engine);
    }
  });

  return { canvasRef, hud, controls, startRound, highContrast, setHighContrast };
}
