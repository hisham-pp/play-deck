/** Shared guards for the game's window-level hotkeys. */

/** True when a plain key press (no modifiers, not a key repeat) should be handled. */
export function isPlainKeypress(event: KeyboardEvent): boolean {
  return !event.repeat && !event.ctrlKey && !event.metaKey && !event.altKey;
}

/** True when the player is typing into a field and hotkeys must stay out of it. */
export function isTypingTarget(): boolean {
  const el = document.activeElement;
  return el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement;
}
