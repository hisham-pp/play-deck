import { SHAFT_HEIGHT, SHAFT_WIDTH } from '../engine/elevator-constants';

/** Maps the y-up simulation onto the y-down canvas. */
export interface ElevatorCamera {
  scale: number;
  originX: number;
  originY: number;
  width: number;
  height: number;
}

/** Share of the canvas height below the platform, so falls stay visible. */
const PLATFORM_ANCHOR = 0.76;
const SIDE_MARGIN = 0.6;

export function createCamera(width: number, height: number): ElevatorCamera {
  const scale = Math.min(width / (SHAFT_WIDTH + SIDE_MARGIN), height / SHAFT_HEIGHT);
  return {
    scale,
    originX: width / 2,
    originY: height * PLATFORM_ANCHOR,
    width,
    height,
  };
}

export function screenX(camera: ElevatorCamera, x: number): number {
  return camera.originX + x * camera.scale;
}

export function screenY(camera: ElevatorCamera, y: number): number {
  return camera.originY - y * camera.scale;
}

/** Canvas pointer position back in world units, for drag-to-aim. */
export function worldXFromScreen(camera: ElevatorCamera, x: number): number {
  return (x - camera.originX) / camera.scale;
}
