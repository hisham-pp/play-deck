export const GameCategories = {
  ALL: 'all',
  A: 'arcade',
  P: 'puzzle',
  S: 'strategy',
  B: 'board',
  C: 'card',
  CS: 'casual',
  T: 'trivia',
  M: 'mmo',
  R: 'racing',
  O: 'other',
} as const;

export type GameCategories = (typeof GameCategories)[keyof typeof GameCategories];
