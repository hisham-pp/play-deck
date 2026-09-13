import type { Coordinate } from '../../types/snake.types';
import {
  coordToPathPoint,
  interpolatePath,
  isDiscontinuous,
  type PathPoint,
} from './snake-body-geometry';

/**
 * Bridges the discrete, tick-based snake engine to a continuously moving 3D
 * body: every engine tick becomes a glide from the previously rendered pose to
 * the new one, so the snake crawls instead of teleporting cell to cell.
 */
export interface SnakeMotion {
  /** Registers the latest engine snapshot; starts a new glide when it changed. */
  sync(snake: Coordinate[]): void;
  /**
   * Advances the glide and returns the pose to render this frame. Passing
   * `running: false` freezes the pose mid-glide instead of snapping forward.
   */
  advance(deltaSeconds: number, speedMs: number, running: boolean): PathPoint[];
}

export function createSnakeMotion(initial: Coordinate[]): SnakeMotion {
  let target = initial;
  let from = initial.map(coordToPathPoint);
  let rendered = from;
  let progress = 1;

  return {
    sync(snake) {
      if (snake === target) return;
      if (isDiscontinuous(target, snake)) {
        from = snake.map(coordToPathPoint);
        rendered = from;
        progress = 1;
      } else {
        from = rendered;
        progress = 0;
      }
      target = snake;
    },

    advance(deltaSeconds, speedMs, running) {
      if (running && progress < 1) {
        progress = Math.min(1, progress + (deltaSeconds * 1000) / Math.max(16, speedMs));
      }
      rendered = interpolatePath(from, target, progress);
      return rendered;
    },
  };
}
