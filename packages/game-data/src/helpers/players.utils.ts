import type { PlayerCapacity } from '@playdeck/game-types';

export const getPCount = (min = 1, max?: number): PlayerCapacity => {
  return {
    min,
    max: max ?? min,
  };
};
