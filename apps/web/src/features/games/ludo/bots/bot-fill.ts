import { generateId } from '@playdeck/shared';
import { colorForSeat } from '../engine/board-layout';
import type { LudoPlayer } from '../types/ludo.types';
import { LUDO_BOT_DEFINITIONS, type LudoBotDefinition } from './bot-registry';

/**
 * Fills every empty seat (`null`) with a bot player, cycling through the
 * provided bot roster for variety. Occupied seats are returned unchanged.
 */
export function fillEmptySeatsWithBots(
  seats: (LudoPlayer | null)[],
  botPool: LudoBotDefinition[] = LUDO_BOT_DEFINITIONS,
): LudoPlayer[] {
  const seatCount = seats.length;
  let botCursor = 0;

  return seats.map((seat, seatIndex) => {
    if (seat) return seat;

    const botDef = botPool[botCursor % botPool.length];
    botCursor += 1;

    const player: LudoPlayer = {
      id: generateId('bot'),
      displayName: botDef.name,
      type: 'bot',
      color: colorForSeat(seatIndex, seatCount),
      seatIndex,
      status: 'ready',
      ready: true,
      botConfig: {
        difficulty: botDef.difficulty,
        personality: botDef.personality,
        botDefinitionId: botDef.id,
      },
    };
    return player;
  });
}

/** Adds a single bot to the first empty seat, if any. Returns the same array if full. */
export function addBotToFirstEmptySeat(
  seats: (LudoPlayer | null)[],
  botDef: LudoBotDefinition = LUDO_BOT_DEFINITIONS[0],
): (LudoPlayer | null)[] {
  const emptyIndex = seats.findIndex((seat) => seat === null);
  if (emptyIndex === -1) return seats;

  const next = [...seats];
  next[emptyIndex] = {
    id: generateId('bot'),
    displayName: botDef.name,
    type: 'bot',
    color: colorForSeat(emptyIndex, seats.length),
    seatIndex: emptyIndex,
    status: 'ready',
    ready: true,
    botConfig: {
      difficulty: botDef.difficulty,
      personality: botDef.personality,
      botDefinitionId: botDef.id,
    },
  };
  return next;
}
