export const GameStatuses = {
  AVAILABLE: 'available',
  COMING_SOON: 'coming-soon',
  MAINTENANCE: 'maintenance',
} as const;

export type GameStatus = (typeof GameStatuses)[keyof typeof GameStatuses];
