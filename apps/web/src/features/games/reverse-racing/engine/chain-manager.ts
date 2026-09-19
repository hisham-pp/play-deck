import type { RacingPlayer } from '../types/reverse-racing.types';

export interface SabotagePairing {
  saboteurId: string;
  targetRacerId: string;
}

/**
 * Builds the circular chain of sabotage across N players.
 * Every player is assigned exactly one racer whose track they sabotage.
 *
 * For example, in a 3-player game:
 * - Player 0 sabotages Player 2
 * - Player 1 sabotages Player 0
 * - Player 2 sabotages Player 1
 *
 * So Player 0's racer is attacked by Player 1, Player 1 by Player 2, and Player 2 by Player 0.
 */
export function buildSabotageChain(players: RacingPlayer[]): Map<string, string> {
  const pairingMap = new Map<string, string>();
  const n = players.length;

  if (n < 2) return pairingMap;

  for (let i = 0; i < n; i++) {
    const saboteur = players[i];
    // The racer this saboteur attacks is the predecessor in the circle
    const targetRacerIndex = (i - 1 + n) % n;
    const targetRacer = players[targetRacerIndex];
    pairingMap.set(saboteur.id, targetRacer.id);
  }

  return pairingMap;
}

/**
 * Gets the player id of the saboteur attacking a specific racer.
 */
export function getAttackingSaboteurId(racerId: string, players: RacingPlayer[]): string | null {
  const n = players.length;
  if (n < 2) return null;

  const racerIndex = players.findIndex((p) => p.id === racerId);
  if (racerIndex === -1) return null;

  // The saboteur attacking this racer is the successor in the circle
  const saboteurIndex = (racerIndex + 1) % n;
  return players[saboteurIndex].id;
}
