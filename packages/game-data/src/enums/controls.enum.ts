export const GameControlKeys = {
  // Navigation & Movement
  WASD_ARROWS: 'WASD / Arrow Keys',
  ARROWS: 'Arrow Keys',
  LEFT_RIGHT: 'A / D or Left / Right',
  UP_DOWN: 'W / S or Up / Down',
  MOVE_LEFT: 'A / ←',
  MOVE_RIGHT: 'D / →',
  MOVE_UP: 'W / ↑',
  MOVE_DOWN: 'S / ↓',
  SWIPE: 'Swipe',
  SWIPE_DRAG: 'Swipe / Drag',

  // Actions & Inputs
  SPACE: 'Space',
  SPACEBAR: 'Spacebar',
  ENTER: 'Enter',
  SPACE_ENTER: 'Space / Enter',
  ENTER_SPACE: 'Enter / Space',
  TAB: 'Tab',
  BACKSPACE: 'Backspace',
  SHIFT: 'Shift',
  CTRL: 'Ctrl',
  CTRL_Z: 'Ctrl+Z / Undo',
  DIGITS_1_9: '1 – 9',
  LETTERS_A_Z: 'A – Z',
  KEY_E: 'E',
  KEY_F: 'F',
  KEY_Q: 'Q',
  KEY_C: 'C',
  KEY_P: 'P',
  KEY_Q_E: 'Q / E',

  // System & Meta
  R_RESTART: 'R',
  PAUSE: 'P / Esc',
  ESC: 'Esc',

  // Pointer & Touch
  CLICK_TAP: 'Click / Tap',
  MOUSE_TOUCH: 'Mouse / Touch',
  MOUSE_DRAG: 'Mouse / Touch Drag',
  DRAG_RELEASE: 'Drag & Release',
  TOUCH_PAD: 'Touch / On-Screen Pad',

  // Voice & Social
  MIC_VOICE: 'Microphone (M)',
  VOICE_PTT: 'V / Space',
  CHAT_INPUT: 'Chat Input & Enter',
} as const;

export type GameControlKey = (typeof GameControlKeys)[keyof typeof GameControlKeys];
