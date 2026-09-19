import type {
  Gait,
  GiantInput,
  GiantMood,
  GiantPhase,
  GiantWorld,
  Thief,
  Vec2,
} from '../types/giant.types';
import { updateGiant } from './giant-ai';
import {
  LULLABY_RELIEF,
  MOOD_AWAKE,
  MUFFLE_MS,
  NOISE_MAX,
  PHASE_COUNTDOWN,
  PHASE_ESCAPE,
  PHASE_ESCAPED,
  PHASE_HEIST,
  PHASE_WOKEN,
} from './giant-constants';
import { createWorld, thiefById, type RoundSetup } from './giant-state';
import {
  emptyEvents,
  settleCrowding,
  updateThief,
  type FrameEvents,
  type TakeEvent,
} from './heist-step';
import { decayNoise, expireRipples, moodFor, relieveNoise } from './noise';
import { allEscaped, treasuresLeft } from './treasure';

export interface StepOptions {
  /** Only the authority ends the round and settles the shared clocks. */
  authoritative: boolean;
}

export interface StepResult extends FrameEvents {
  /** Set on the frame the giant's mood changes, so the UI can warn. */
  moodChanged: GiantMood | null;
  phaseChanged: GiantPhase | null;
}

/**
 * The whole simulation, free of React and of the network. Both sides of an
 * online heist run this: the host with `authoritative: true` so it settles the
 * clocks and the ending, guests without so their copy only predicts.
 */
export class GiantEngine {
  private world: GiantWorld;

  constructor(setup: RoundSetup) {
    this.world = createWorld(setup);
  }

  getWorld(): GiantWorld {
    return this.world;
  }

  reset(setup: RoundSetup): void {
    this.world = createWorld(setup);
  }

  thief(id: string): Thief | undefined {
    return thiefById(this.world, id);
  }

  /**
   * A full meter is irrevocable: it is latched before the room is allowed to
   * settle, so nobody escapes the giant's eyes opening by standing very still
   * for one frame.
   */
  private checkWake(): GiantPhase | null {
    const world = this.world;
    if (world.noise < NOISE_MAX || world.phase === PHASE_WOKEN) return null;
    world.phase = PHASE_WOKEN;
    world.mood = MOOD_AWAKE;
    return PHASE_WOKEN;
  }

  /** Countdown → heist → escape → out, with waking short-circuiting all of it. */
  private advancePhase(authoritative: boolean): GiantPhase | null {
    const world = this.world;

    const woken = this.checkWake();
    if (woken) return woken;

    if (world.phase === PHASE_COUNTDOWN && world.elapsedMs >= world.countdownMs) {
      world.phase = PHASE_HEIST;
      return PHASE_HEIST;
    }
    if (!authoritative) return null;

    if (world.phase === PHASE_HEIST) {
      const played = world.elapsedMs - world.countdownMs;
      // The crew can call it early by clearing the floor; otherwise the clock does.
      if (played < world.heistMs && treasuresLeft(world) > 0) return null;
      world.phase = PHASE_ESCAPE;
      world.escapeStartedMs = world.elapsedMs;
      return PHASE_ESCAPE;
    }

    if (world.phase === PHASE_ESCAPE) {
      const spent = world.elapsedMs - world.escapeStartedMs;
      if (!allEscaped(world) && spent < world.escapeMs) return null;
      world.phase = PHASE_ESCAPED;
      return PHASE_ESCAPED;
    }

    return null;
  }

  private moveEveryone(inputs: Record<string, GiantInput>, dtSec: number, events: FrameEvents) {
    for (const thief of this.world.thieves) {
      const input = inputs[thief.id];
      if (!input) continue;
      updateThief(this.world, thief, input, dtSec, events);
    }
    settleCrowding(this.world, events);
  }

  step(dtSec: number, inputs: Record<string, GiantInput>, options: StepOptions): StepResult {
    const world = this.world;
    const events = emptyEvents();
    const result: StepResult = { ...events, moodChanged: null, phaseChanged: null };

    if (world.phase === PHASE_ESCAPED || world.phase === PHASE_WOKEN) return result;

    world.elapsedMs += dtSec * 1000;

    const alreadyWoken = this.checkWake();
    if (alreadyWoken) return { ...events, moodChanged: MOOD_AWAKE, phaseChanged: alreadyWoken };

    decayNoise(world, dtSec);

    if (world.phase !== PHASE_COUNTDOWN) this.moveEveryone(inputs, dtSec, events);

    const nextMood = moodFor(world.noise);
    const moodChanged = nextMood !== world.mood ? nextMood : null;
    world.mood = nextMood;

    updateGiant(world.giant, world.mood, dtSec);
    world.ripples = expireRipples(world.ripples, world.elapsedMs);

    const phaseChanged = this.advancePhase(options.authoritative);

    return { ...events, moodChanged, phaseChanged };
  }

  /** Replays a pickup another client made, so every copy agrees on what is left. */
  applyRemoteTake(event: TakeEvent): void {
    const world = this.world;
    const thief = thiefById(world, event.thiefId);
    if (!thief) return;

    if (event.kind === 'charm') {
      const charm = world.charms.find((candidate) => candidate.id === event.id);
      if (!charm || charm.usedBy !== null) return;
      charm.usedBy = thief.id;
      // Mirrored locally so the meter reacts at once; the host snapshot is final.
      if (charm.kind === 'lullaby') relieveNoise(world, LULLABY_RELIEF);
      else thief.muffledUntilMs = world.elapsedMs + MUFFLE_MS;
      return;
    }

    const treasure = world.treasures.find((candidate) => candidate.id === event.id);
    if (!treasure || treasure.takenBy !== null) return;
    treasure.takenBy = thief.id;
    thief.carried += treasure.value;
    thief.carriedCount += 1;
  }

  /** Places a remote thief's body where their client last said it was. */
  placeThief(thiefId: string, pos: Vec2, facing: number, gait: Gait): void {
    const thief = thiefById(this.world, thiefId);
    if (!thief) return;
    thief.pos.x = pos.x;
    thief.pos.y = pos.y;
    thief.facing = facing;
    thief.gait = gait;
  }

  setConnected(thiefId: string, connected: boolean): void {
    const thief = thiefById(this.world, thiefId);
    if (thief) thief.connected = connected;
  }

  /** Forces the ending the host has already decided on. */
  finish(phase: GiantPhase): void {
    if (phase === PHASE_WOKEN) this.world.mood = MOOD_AWAKE;
    this.world.phase = phase;
  }
}
