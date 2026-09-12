import { STATUS_COMPLETED } from './ludo-constants';
import type { LudoGameState } from '../types/ludo.types';

export function checkPlayerFinished(state: LudoGameState, seatIndex: number): LudoGameState {
  const player = state.players.find((p) => p.seatIndex === seatIndex);
  if (!player || player.finished) return state;

  const allHome = player.pieces.every((piece) => piece.location === 'home');
  if (!allHome) return state;

  const winnerOrder = [...state.winnerOrder, player.playerId];
  const nextPlayers = state.players.map((p) =>
    p.seatIndex === seatIndex ? { ...p, finished: true, finishRank: winnerOrder.length } : p,
  );

  return { ...state, players: nextPlayers, winnerOrder };
}

/**
 * Ends the game once at most one player remains unfinished (the default,
 * configurable rule). The last remaining player is auto-ranked last.
 */
export function checkGameCompletion(state: LudoGameState): LudoGameState {
  if (state.players.length < 2) return state;

  const unfinished = state.players.filter((p) => !p.finished);

  if (state.settings.endWhenOnePlayerRemains && unfinished.length <= 1) {
    let winnerOrder = state.winnerOrder;
    let players = state.players;

    if (unfinished.length === 1) {
      const last = unfinished[0];
      winnerOrder = [...winnerOrder, last.playerId];
      players = players.map((p) =>
        p.seatIndex === last.seatIndex ? { ...p, finished: true, finishRank: winnerOrder.length } : p,
      );
    }

    return { ...state, players, winnerOrder, status: STATUS_COMPLETED };
  }

  if (unfinished.length === 0) {
    return { ...state, status: STATUS_COMPLETED };
  }

  return state;
}
