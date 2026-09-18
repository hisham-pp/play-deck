import type {
  SnakeLadderGameState,
  SnakeLadderPlayer,
  SnakeLadderPlayerState,
  SnakeLadderRuleSettings,
} from '../types/snake-and-ladder.types';
import { DEFAULT_RULE_SETTINGS, START_SQUARE, STATUS_WAITING } from './snake-ladder-constants';

export function createPlayerState(player: SnakeLadderPlayer): SnakeLadderPlayerState {
  return {
    playerId: player.id,
    seatIndex: player.seatIndex,
    color: player.color,
    position: START_SQUARE,
    finished: false,
    finishRank: null,
    consecutiveSixes: 0,
  };
}

export function createInitialSnakeLadderState(
  players: SnakeLadderPlayer[],
  settings: Partial<SnakeLadderRuleSettings> = {},
): SnakeLadderGameState {
  const seated = [...players].sort((a, b) => a.seatIndex - b.seatIndex);

  return {
    status: STATUS_WAITING,
    players: seated.map(createPlayerState),
    currentTurnSeatIndex: seated[0]?.seatIndex ?? 0,
    dice: { value: null, rollsThisTurn: 0 },
    lastMove: null,
    lastMoveNote: null,
    winnerOrder: [],
    moveCount: 0,
    settings: { ...DEFAULT_RULE_SETTINGS, ...settings },
  };
}
