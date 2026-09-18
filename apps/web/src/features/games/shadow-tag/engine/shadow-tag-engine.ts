import type {
  ShadowCast,
  ShadowTagInput,
  ShadowTagRunner,
  ShadowTagWorld,
  TagEvent,
} from '../types/shadow-tag.types';
import { disturbProps, expireFootsteps, shedFootsteps } from './clues';
import { advanceLights, applyLightInteraction, type LightInteraction } from './lights';
import { stepRunner } from './movement';
import { awardSurvival } from './scoring';
import { computeShadows } from './shadow-casting';
import {
  PHASE_COUNTDOWN,
  PHASE_PLAYING,
  PHASE_ROUND_OVER,
  TAG_GRACE_MS,
  TAG_POINTS,
} from './shadow-tag-constants';
import { createWorld, runnerById, type RoundSetup } from './shadow-tag-state';
import { resolveTag } from './tagging';

export interface StepOptions {
  /** Only the authority scores the round and settles tags. */
  authoritative: boolean;
}

export interface StepResult {
  tag: TagEvent | null;
  interactions: LightInteraction[];
  /** True on the frame the round clock runs out. */
  roundEnded: boolean;
}

const EMPTY_RESULT: StepResult = { tag: null, interactions: [], roundEnded: false };

/**
 * The whole simulation, free of React and of the network. Both sides of an
 * online match run this: the host with `authoritative: true` so it settles tags
 * and scores, guests without so their copy only predicts movement and light.
 */
export class ShadowTagEngine {
  private world: ShadowTagWorld;
  private casts: ShadowCast[] = [];

  constructor(setup: RoundSetup) {
    this.world = createWorld(setup);
    this.recomputeShadows();
  }

  getWorld(): ShadowTagWorld {
    return this.world;
  }

  getCasts(): ShadowCast[] {
    return this.casts;
  }

  reset(setup: RoundSetup): void {
    this.world = createWorld(setup);
    this.recomputeShadows();
  }

  private recomputeShadows(): void {
    this.casts = computeShadows(this.world.players, this.world.lights, this.world.arena.obstacles);
  }

  private advancePhase(): boolean {
    const world = this.world;
    if (world.phase === PHASE_COUNTDOWN && world.elapsedMs >= world.countdownMs) {
      world.phase = PHASE_PLAYING;
      return false;
    }
    if (world.phase === PHASE_PLAYING && world.elapsedMs - world.countdownMs >= world.roundMs) {
      world.phase = PHASE_ROUND_OVER;
      return true;
    }
    return false;
  }

  private moveEveryone(inputs: Record<string, ShadowTagInput>, dtSec: number): LightInteraction[] {
    const world = this.world;
    const interactions: LightInteraction[] = [];

    for (const runner of world.players) {
      const input = inputs[runner.id];
      if (!input || !runner.connected) continue;

      stepRunner(runner, input, world.arena, dtSec);
      shedFootsteps(world, runner);
      disturbProps(world.props, runner, world.elapsedMs);

      const interaction = applyLightInteraction(
        runner,
        world.lights,
        input.block,
        input.redirect,
        world.elapsedMs,
      );
      if (interaction) interactions.push(interaction);
    }

    return interactions;
  }

  step(dtSec: number, inputs: Record<string, ShadowTagInput>, options: StepOptions): StepResult {
    const world = this.world;
    if (world.phase === PHASE_ROUND_OVER) return EMPTY_RESULT;

    world.elapsedMs += dtSec * 1000;
    const roundEnded = this.advancePhase();

    advanceLights(world.lights, dtSec, world.elapsedMs);
    const interactions = this.moveEveryone(inputs, dtSec);
    world.footsteps = expireFootsteps(world.footsteps, world.elapsedMs);
    this.recomputeShadows();

    if (world.phase !== PHASE_PLAYING || !options.authoritative) {
      return { tag: null, interactions, roundEnded };
    }

    awardSurvival(world, dtSec);

    const itRunner = runnerById(world, world.itId);
    const resolution = itRunner
      ? resolveTag({
          itRunner,
          runners: world.players,
          casts: this.casts,
          elapsedMs: world.elapsedMs,
          tagPoints: TAG_POINTS,
        })
      : null;

    if (!resolution) return { tag: null, interactions, roundEnded };

    resolution.apply();
    world.itId = resolution.event.victimId;
    world.lastTag = resolution.event;
    return { tag: resolution.event, interactions, roundEnded };
  }

  /** Replays a tag the host settled, so every client agrees on who holds the mark. */
  applyRemoteTag(event: TagEvent): void {
    const world = this.world;
    const tagger = runnerById(world, event.taggerId);
    const victim = runnerById(world, event.victimId);
    if (!tagger || !victim || world.itId === event.victimId) return;

    tagger.tags += 1;
    tagger.score += TAG_POINTS;
    victim.timesTagged += 1;
    tagger.immuneUntilMs = world.elapsedMs + TAG_GRACE_MS;
    victim.immuneUntilMs = world.elapsedMs + TAG_GRACE_MS;
    world.itId = event.victimId;
    world.lastTag = event;
  }

  setConnected(playerId: string, connected: boolean): void {
    const runner = runnerById(this.world, playerId);
    if (runner) runner.connected = connected;
  }

  /** Places a remote player's body where their client last said it was. */
  placeRunner(playerId: string, pos: { x: number; y: number }, facing: number): void {
    const runner = runnerById(this.world, playerId);
    if (!runner) return;
    runner.pos.x = pos.x;
    runner.pos.y = pos.y;
    runner.facing = facing;
  }

  endRound(): void {
    this.world.phase = PHASE_ROUND_OVER;
  }

  localRunner(playerId: string): ShadowTagRunner | undefined {
    return runnerById(this.world, playerId);
  }
}
