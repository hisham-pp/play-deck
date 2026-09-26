import type { GameControlItem } from '@playdeck/game-types';
import { GameControlKeys } from '../enums/controls.enum';

/**
 * Common pre-packaged control definitions and builders.
 */
export const CommonControls = {
  restart: (action = 'Restart game'): GameControlItem => ({
    key: GameControlKeys.R_RESTART,
    action,
  }),
  pause: (action = 'Pause / resume'): GameControlItem => ({
    key: GameControlKeys.PAUSE,
    action,
  }),
  esc: (action = 'Close or pause'): GameControlItem => ({
    key: GameControlKeys.ESC,
    action,
  }),
  voiceChat: (action = 'Push-to-talk voice communication'): GameControlItem => ({
    key: GameControlKeys.VOICE_PTT,
    action,
  }),
  microphone: (action = 'Toggle microphone'): GameControlItem => ({
    key: GameControlKeys.MIC_VOICE,
    action,
  }),
  clickTap: (action = 'Select or interact'): GameControlItem => ({
    key: GameControlKeys.CLICK_TAP,
    action,
  }),
  mouseTouch: (action = 'Select or navigate'): GameControlItem => ({
    key: GameControlKeys.MOUSE_TOUCH,
    action,
  }),
  mouseDrag: (action = 'Aim or drag piece'): GameControlItem => ({
    key: GameControlKeys.MOUSE_DRAG,
    action,
  }),
  wasdArrows: (action = 'Move character'): GameControlItem => ({
    key: GameControlKeys.WASD_ARROWS,
    action,
  }),
  arrows: (action = 'Move or navigate selection'): GameControlItem => ({
    key: GameControlKeys.ARROWS,
    action,
  }),
  leftRight: (action = 'Move left or right'): GameControlItem => ({
    key: GameControlKeys.LEFT_RIGHT,
    action,
  }),
  upDown: (action = 'Move up or down'): GameControlItem => ({
    key: GameControlKeys.UP_DOWN,
    action,
  }),
  space: (action = 'Action or jump'): GameControlItem => ({
    key: GameControlKeys.SPACE,
    action,
  }),
  enter: (action = 'Confirm or submit'): GameControlItem => ({
    key: GameControlKeys.ENTER,
    action,
  }),
  spaceEnter: (action = 'Confirm selection'): GameControlItem => ({
    key: GameControlKeys.SPACE_ENTER,
    action,
  }),
  tab: (action = 'Cycle selection or view'): GameControlItem => ({
    key: GameControlKeys.TAB,
    action,
  }),
  backspace: (action = 'Delete or undo'): GameControlItem => ({
    key: GameControlKeys.BACKSPACE,
    action,
  }),
  swipe: (action = 'Swipe direction'): GameControlItem => ({
    key: GameControlKeys.SWIPE,
    action,
  }),
  chat: (action = 'Send message in lobby'): GameControlItem => ({
    key: GameControlKeys.CHAT_INPUT,
    action,
  }),
};
