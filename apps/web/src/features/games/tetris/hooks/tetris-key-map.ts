import type { TetrisGameStatus } from '../types/tetris.types';

export type PlayingKeyAction =
  | 'move-left'
  | 'move-right'
  | 'soft-drop'
  | 'hard-drop'
  | 'rotate-cw'
  | 'rotate-ccw'
  | 'hold'
  | 'pause'
  | 'restart';

const ACTION_MOVE_LEFT: PlayingKeyAction = 'move-left';
const ACTION_MOVE_RIGHT: PlayingKeyAction = 'move-right';
const ACTION_SOFT_DROP: PlayingKeyAction = 'soft-drop';
const ACTION_HARD_DROP: PlayingKeyAction = 'hard-drop';
const ACTION_ROTATE_CW: PlayingKeyAction = 'rotate-cw';
const ACTION_ROTATE_CCW: PlayingKeyAction = 'rotate-ccw';
const ACTION_HOLD: PlayingKeyAction = 'hold';
const ACTION_PAUSE: PlayingKeyAction = 'pause';
const ACTION_RESTART: PlayingKeyAction = 'restart';

const PLAYING_KEY_ACTIONS: Record<string, PlayingKeyAction> = {
  ArrowLeft: ACTION_MOVE_LEFT,
  a: ACTION_MOVE_LEFT,
  A: ACTION_MOVE_LEFT,
  ArrowRight: ACTION_MOVE_RIGHT,
  d: ACTION_MOVE_RIGHT,
  D: ACTION_MOVE_RIGHT,
  ArrowDown: ACTION_SOFT_DROP,
  s: ACTION_SOFT_DROP,
  S: ACTION_SOFT_DROP,
  ' ': ACTION_HARD_DROP,
  ArrowUp: ACTION_ROTATE_CW,
  x: ACTION_ROTATE_CW,
  X: ACTION_ROTATE_CW,
  w: ACTION_ROTATE_CW,
  W: ACTION_ROTATE_CW,
  z: ACTION_ROTATE_CCW,
  Z: ACTION_ROTATE_CCW,
  Control: ACTION_ROTATE_CCW,
  c: ACTION_HOLD,
  C: ACTION_HOLD,
  Shift: ACTION_HOLD,
  p: ACTION_PAUSE,
  P: ACTION_PAUSE,
  Escape: ACTION_PAUSE,
  r: ACTION_RESTART,
  R: ACTION_RESTART,
};

export const REPEATABLE_PLAYING_ACTIONS = new Set<PlayingKeyAction>([
  ACTION_MOVE_LEFT,
  ACTION_MOVE_RIGHT,
  ACTION_SOFT_DROP,
]);

const KEY_ARROW_UP = 'ArrowUp';
const KEY_ARROW_DOWN = 'ArrowDown';
const KEY_ARROW_LEFT = 'ArrowLeft';
const KEY_ARROW_RIGHT = 'ArrowRight';
const KEY_SPACE = ' ';
const KEY_ENTER = 'Enter';
const KEY_ESCAPE = 'Escape';

export const PREVENT_DEFAULT_KEYS = new Set([
  KEY_ARROW_UP,
  KEY_ARROW_DOWN,
  KEY_ARROW_LEFT,
  KEY_ARROW_RIGHT,
  KEY_SPACE,
]);

export function resolvePlayingKeyAction(key: string): PlayingKeyAction | undefined {
  return PLAYING_KEY_ACTIONS[key];
}

export type IdleKeyAction = 'resume' | 'restart' | 'start';

const IDLE_ACTION_RESUME: IdleKeyAction = 'resume';
const IDLE_ACTION_RESTART: IdleKeyAction = 'restart';
const IDLE_ACTION_START: IdleKeyAction = 'start';

export function resolveIdleKeyAction(
  key: string,
  status: TetrisGameStatus,
): IdleKeyAction | undefined {
  if (key === 'p' || key === 'P' || key === KEY_ESCAPE) {
    return status === 'paused' ? IDLE_ACTION_RESUME : undefined;
  }
  if (key === 'r' || key === 'R') {
    return status !== 'idle' ? IDLE_ACTION_RESTART : undefined;
  }
  if (key === KEY_ENTER) {
    if (status === 'idle') return IDLE_ACTION_START;
    if (status === 'game-over') return IDLE_ACTION_RESTART;
  }
  return undefined;
}
