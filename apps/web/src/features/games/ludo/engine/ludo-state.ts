import type {
  LudoGameState,
  LudoPieceState,
  LudoPlayer,
  LudoPlayerState,
  LudoRuleSettings,
} from '../types/ludo.types';
import { resolveLayout } from './board-layout';
import {
  DEFAULT_RULE_SETTINGS,
  PHASE_AWAITING_ROLL,
  PIECES_PER_PLAYER,
  STATUS_WAITING,
} from './ludo-constants';

function createPieces(color: LudoPlayer['color']): LudoPieceState[] {
  return Array.from({ length: PIECES_PER_PLAYER }, (_, pieceIndex) => ({
    id: `${color}-${pieceIndex}`,
    color,
    pieceIndex: pieceIndex as 0 | 1 | 2 | 3,
    location: 'base',
    steps: 0,
  }));
}

function createPlayerState(player: LudoPlayer): LudoPlayerState {
  return {
    playerId: player.id,
    seatIndex: player.seatIndex,
    color: player.color,
    pieces: createPieces(player.color),
    finished: false,
    finishRank: null,
    consecutiveSixes: 0,
  };
}

export function createInitialLudoState(
  players: LudoPlayer[],
  settingsOverrides: Partial<LudoRuleSettings> = {},
): LudoGameState {
  const seatCount = players.length;
  const layout = resolveLayout(seatCount);
  const settings: LudoRuleSettings = {
    ...DEFAULT_RULE_SETTINGS,
    boardLayout: layout.id,
    ...settingsOverrides,
  };

  const orderedPlayers = [...players].sort((a, b) => a.seatIndex - b.seatIndex);

  return {
    status: STATUS_WAITING,
    layout: layout.id,
    players: orderedPlayers.map(createPlayerState),
    currentTurnSeatIndex: orderedPlayers[0]?.seatIndex ?? 0,
    dice: { value: null, rollsThisTurn: 0 },
    turnPhase: PHASE_AWAITING_ROLL,
    winnerOrder: [],
    lastMoveNote: null,
    actionLog: [],
    settings,
  };
}
