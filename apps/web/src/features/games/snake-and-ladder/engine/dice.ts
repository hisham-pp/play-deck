import { DICE_MAX } from './snake-ladder-constants';

/**
 * Local dice, deliberately outside the reducer: the engine only ever receives
 * an already-rolled value through the ROLL_DICE payload, so an authoritative
 * server can become the sole source of dice values without touching the rules.
 */
export const SnakeLadderDice = {
  roll(): number {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const buffer = new Uint32Array(1);
      crypto.getRandomValues(buffer);
      return (buffer[0] % DICE_MAX) + 1;
    }
    return Math.floor(Math.random() * DICE_MAX) + 1;
  },
};
