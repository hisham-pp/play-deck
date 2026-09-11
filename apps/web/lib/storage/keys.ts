export const STORAGE_KEYS = {
  PLAYER: 'playdeck:player',
  PREFERENCES: 'playdeck:preferences',
  SESSIONS: 'playdeck:sessions',
  ACTIVE_SESSION: 'playdeck:active_session',
  LIBRARY: 'playdeck:library',
  RECENT_GAMES: 'playdeck:recent_games',
  FAVORITES: 'playdeck:favorites',
  session: (id: string) => `playdeck:session:${id}`,
  gameSave: (gameId: string, slot: string = 'default') => `playdeck:save:${gameId}:${slot}`,
} as const;
