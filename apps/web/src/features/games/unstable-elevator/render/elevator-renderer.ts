import { PHASE_COLLAPSE, PHASE_PLACING, PLATFORM_WIDTH } from '../engine/elevator-constants';
import type { ElevatorGameState } from '../types/unstable-elevator.types';
import { drawCargo, drawClaw, drawPlatform } from './cargo-layer';
import { createCamera, type ElevatorCamera } from './elevator-camera';
import { elevatorPalette, SEAT_HEX } from './elevator-palette';
import { drawShaft } from './shaft-layer';

export interface RenderOptions {
  state: ElevatorGameState;
  /** True when the local player may currently release the object. */
  clawClear: boolean;
  highContrast: boolean;
  /** Suppresses the camera shake for players who asked for less motion. */
  reducedMotion: boolean;
  /** Seconds since the run began, so the shake is not frame-rate dependent. */
  timeSeconds: number;
}

/** Peak camera shake, as a fraction of a world unit. */
const MAX_SHAKE = 0.16;

function rimByOwner(state: ElevatorGameState): Record<string, string> {
  const rims: Record<string, string> = {};
  for (const seat of state.seats) rims[seat.id] = SEAT_HEX[seat.color];
  return rims;
}

/** A small two-frequency wobble, which reads as machinery rather than noise. */
function shakeOffset(turbulence: number, timeSeconds: number): { x: number; y: number } {
  const strength = turbulence * MAX_SHAKE;
  return {
    x: Math.sin(timeSeconds * 37) * strength,
    y: Math.sin(timeSeconds * 53 + 1.7) * strength * 0.6,
  };
}

function drawCollapseFlash(
  ctx: CanvasRenderingContext2D,
  camera: ElevatorCamera,
  progress: number,
): void {
  ctx.fillStyle = `rgba(239, 68, 68, ${0.34 * (1 - progress)})`;
  ctx.fillRect(0, 0, camera.width, camera.height);
}

/**
 * Draws one frame. The renderer keeps no state of its own: everything it needs
 * arrives in `options`, which is what lets a guest draw the host's snapshot
 * with exactly the same code path.
 */
export function renderElevator(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: RenderOptions,
): void {
  const { state } = options;
  const camera = createCamera(width, height);
  const palette = elevatorPalette(options.highContrast);

  ctx.save();
  if (!options.reducedMotion && state.turbulence > 0.02) {
    const shake = shakeOffset(state.turbulence, options.timeSeconds);
    ctx.translate(shake.x * camera.scale, shake.y * camera.scale);
  }

  drawShaft(ctx, camera, palette, {
    floor: state.floor,
    ascentProgress: state.ascentProgress,
  });
  drawPlatform(ctx, camera, palette, state.platform);
  drawCargo(ctx, camera, palette, state.bodies, {
    rimByOwner: rimByOwner(state),
    dangerX: PLATFORM_WIDTH / 2,
  });

  if (state.phase === PHASE_PLACING) {
    const seat = state.seats.find((entry) => entry.id === state.activeSeatId);
    drawClaw(ctx, camera, palette, {
      shapeId: state.pendingShapeId,
      x: state.clawX,
      angle: state.clawAngle,
      clear: options.clawClear,
      rim: seat ? SEAT_HEX[seat.color] : palette.clawFrame,
    });
  }

  ctx.restore();

  if (state.phase === PHASE_COLLAPSE) {
    drawCollapseFlash(ctx, camera, 1 - Math.min(1, state.phaseRemainingMs / 2600));
  }
}
