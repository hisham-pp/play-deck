import type { LudoBoardLayoutId, LudoColor } from '../types/ludo.types';

export interface BoardLayout {
  id: LudoBoardLayoutId;
  arms: number;
  cellsPerArm: number;
  trackLength: number;
  homeStretchLength: number;
  colors: LudoColor[];
  entryOffsets: number[];
  /** Offsets relative to each color's own entry square that are safe from capture. */
  safeCellOffsets: number[];
}

/**
 * Standard 4-arm cross board: 13 cells per arm = 52 shared track cells.
 * Used for 2, 3, and 4 player games.
 */
export const CLASSIC_4_LAYOUT: BoardLayout = {
  id: 'classic4',
  arms: 4,
  cellsPerArm: 13,
  trackLength: 52,
  homeStretchLength: 5,
  colors: ['red', 'green', 'yellow', 'blue'],
  entryOffsets: [0, 13, 26, 39],
  safeCellOffsets: [0, 8],
};

/**
 * Extended 6-arm board. Ludo has no official 6-player variant, so this is a
 * deliberate, documented generalization of the same math (6 arms x 9 cells)
 * rather than an attempt at historical accuracy. Used for 5 and 6 player games.
 */
export const EXTENDED_6_LAYOUT: BoardLayout = {
  id: 'extended6',
  arms: 6,
  cellsPerArm: 9,
  trackLength: 54,
  homeStretchLength: 5,
  colors: ['red', 'yellow', 'green', 'cyan', 'blue', 'purple'],
  entryOffsets: [0, 9, 18, 27, 36, 45],
  safeCellOffsets: [0, 4],
};

export function resolveLayout(seatCount: number): BoardLayout {
  return seatCount >= 5 ? EXTENDED_6_LAYOUT : CLASSIC_4_LAYOUT;
}

/**
 * Maps seat index -> arm index for a given player count. 2-player games use
 * opposite arms for visual/positional symmetry; every other count fills arms
 * sequentially starting from arm 0.
 */
export function assignSeatsToArms(seatCount: number): number[] {
  const layout = resolveLayout(seatCount);
  if (seatCount === 2 && layout.arms >= 4) {
    return [0, 2];
  }
  return Array.from({ length: seatCount }, (_, i) => i % layout.arms);
}

export function colorForSeat(seatIndex: number, seatCount: number): LudoColor {
  const layout = resolveLayout(seatCount);
  const arms = assignSeatsToArms(seatCount);
  return layout.colors[arms[seatIndex]];
}

export function finishSteps(layout: BoardLayout): number {
  return layout.trackLength - 1 + layout.homeStretchLength + 1;
}

/** Global track index (0..trackLength-1) for a piece with `steps` in [1, trackLength - 1]. */
export function globalTrackIndex(layout: BoardLayout, color: LudoColor, steps: number): number {
  const entry = layout.entryOffsets[layout.colors.indexOf(color)];
  return (entry + steps - 1) % layout.trackLength;
}

/** Home-stretch cell index (1..homeStretchLength) for steps beyond track steps. */
export function homeStretchIndex(layout: BoardLayout, steps: number): number {
  return steps - (layout.trackLength - 1);
}

export function isTrackSteps(layout: BoardLayout, steps: number): boolean {
  return steps >= 1 && steps <= layout.trackLength - 1;
}

export function isHomeStretchSteps(layout: BoardLayout, steps: number): boolean {
  return steps >= layout.trackLength && steps < finishSteps(layout);
}

export function isFinishedSteps(layout: BoardLayout, steps: number): boolean {
  return steps === finishSteps(layout);
}

/** Whether the global track cell at `globalIndex` is a safe cell for any color. */
export function isSafeCell(layout: BoardLayout, globalIndex: number): boolean {
  return layout.colors.some((color) => {
    const entry = layout.entryOffsets[layout.colors.indexOf(color)];
    return layout.safeCellOffsets.some(
      (offset) => (entry + offset) % layout.trackLength === globalIndex,
    );
  });
}
