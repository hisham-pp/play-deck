/**
 * Local dice implementation. Lives OUTSIDE the reducer/engine on purpose:
 * the engine only ever receives an already-rolled value via the ROLL_DICE
 * action payload, so a future server can become the sole source of dice
 * values without any change to the reducer.
 */
export const DiceService = {
  roll(): number {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const buffer = new Uint32Array(1);
      crypto.getRandomValues(buffer);
      return (buffer[0] % 6) + 1;
    }
    return Math.floor(Math.random() * 6) + 1;
  },
};
