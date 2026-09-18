'use client';

import { useEffect, useState } from 'react';
import { BOT_PROFILE_COLUMNS, planBotPlacement, type BotSkill } from '../engine/elevator-bot';
import { PHASE_PLACING, SEAT_TYPE_BOT } from '../engine/elevator-constants';
import type { ElevatorEngine } from '../engine/elevator-engine';
import { getShape } from '../engine/elevator-objects';
import { createRng } from '../engine/elevator-rng';
import type { ElevatorGameState } from '../types/unstable-elevator.types';

export interface UseElevatorBotsOptions {
  engine: ElevatorEngine;
  state: ElevatorGameState;
  /** Only the machine running the simulation may act for the bots. */
  driving: boolean;
  seed: string;
  skill: BotSkill;
}

/**
 * Plays the bot seats. A bot lines the claw up straight away so the other
 * players can see where it is aiming, then releases after a beat.
 */
export function useElevatorBots({ engine, state, driving, seed, skill }: UseElevatorBotsOptions): {
  botThinking: boolean;
} {
  const [botThinking, setBotThinking] = useState(false);
  const { phase, floor, activeSeatId, pendingShapeId } = state;
  const seat = state.seats.find((entry) => entry.id === activeSeatId);
  const isBotTurn = Boolean(seat && seat.type === SEAT_TYPE_BOT && phase === PHASE_PLACING);

  useEffect(() => {
    if (!driving || !isBotTurn || !activeSeatId || !pendingShapeId) {
      setBotThinking(false);
      return;
    }

    const rng = createRng(`${seed}:bot:${floor}`);
    const profile = engine.getSurfaceProfile(BOT_PROFILE_COLUMNS);
    const plan = planBotPlacement(profile, getShape(pendingShapeId), skill, rng);

    engine.setClaw(plan.x, plan.angle);
    setBotThinking(true);

    const timer = setTimeout(() => {
      engine.drop(activeSeatId);
      setBotThinking(false);
    }, plan.thinkMs);

    return () => clearTimeout(timer);
  }, [driving, isBotTurn, activeSeatId, pendingShapeId, floor, seed, skill, engine]);

  return { botThinking };
}
