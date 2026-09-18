import type {
  ColorThiefGameState,
  ColorThiefLogEntry,
  ColorThiefPlayerState,
  ColorThiefRuleSettings,
  ColorThiefSeat,
} from '../types/color-thief.types';
import { ABILITY_BY_COLOR, DEFAULT_RULE_SETTINGS, STATUS_WAITING } from './color-thief-constants';
import { createBoard } from './grid';

export function createPlayerState(seat: ColorThiefSeat): ColorThiefPlayerState {
  return {
    playerId: seat.id,
    seatIndex: seat.seatIndex,
    color: seat.color,
    ability: ABILITY_BY_COLOR[seat.color],
    abilityRevealed: false,
    abilityReadyOnRound: 0,
    blockadedTurns: 0,
  };
}

export function appendLog(
  log: ColorThiefLogEntry[],
  entry: Omit<ColorThiefLogEntry, 'id'>,
): ColorThiefLogEntry[] {
  const id = (log[log.length - 1]?.id ?? 0) + 1;
  // Only the recent tail is ever rendered, and an unbounded log would be
  // copied into every broadcast state snapshot.
  return [...log, { ...entry, id }].slice(-40);
}

export function createInitialColorThiefState(
  seats: ColorThiefSeat[],
  settings: Partial<ColorThiefRuleSettings> = {},
): ColorThiefGameState {
  const rules: ColorThiefRuleSettings = { ...DEFAULT_RULE_SETTINGS, ...settings };
  const seated = [...seats].sort((a, b) => a.seatIndex - b.seatIndex);

  return {
    status: STATUS_WAITING,
    columns: rules.columns,
    rows: rules.rows,
    board: createBoard({ columns: rules.columns, rows: rules.rows }),
    players: seated.map(createPlayerState),
    currentTurnSeatIndex: seated[0]?.seatIndex ?? 0,
    round: 1,
    paintRemaining: rules.paintPerTurn,
    log: [],
    actionCount: 0,
    winnerIds: [],
    settings: rules,
  };
}
