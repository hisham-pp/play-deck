export const GameReleaseDates = {
  D_2026_09_11: '2026-09-11',
  D_2026_09_12: '2026-09-12',
  D_2026_09_13: '2026-09-13',
  D_2026_09_17: '2026-09-17',
  D_2026_09_18: '2026-09-18',
  D_2026_09_19: '2026-09-19',
  D_2026_09_20: '2026-09-20',
  D_2026_09_22: '2026-09-22',
  D_2026_09_23: '2026-09-23',
  D_2026_09_24: '2026-09-24',
  D_2026_09_25: '2026-09-25',
  D_2026_09_26: '2026-09-26',
  COMING_SOON: 'Coming Soon',
} as const;

export type GameReleaseDate = (typeof GameReleaseDates)[keyof typeof GameReleaseDates];
