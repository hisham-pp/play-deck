'use client';

import { useEffect } from 'react';
import { useVoiceChatStore } from '@/stores/voice-chat.store';
import { PUSH_TO_TALK_KEY } from '../voice.constants';

const TEXT_ENTRY_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

/** The room chat box shares this screen, so never steal the key mid-sentence. */
function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return TEXT_ENTRY_TAGS.has(target.tagName) || target.isContentEditable;
}

export function usePushToTalk(isEnabled: boolean): void {
  const setTalkKeyHeld = useVoiceChatStore((state) => state.setTalkKeyHeld);

  useEffect(() => {
    if (!isEnabled) return;

    const matchesKey = (event: KeyboardEvent) =>
      event.key.toLowerCase() === PUSH_TO_TALK_KEY && !event.metaKey && !event.ctrlKey;

    const handleDown = (event: KeyboardEvent) => {
      if (event.repeat || isTypingTarget(event.target) || !matchesKey(event)) return;
      setTalkKeyHeld(true);
    };

    const handleUp = (event: KeyboardEvent) => {
      if (!matchesKey(event)) return;
      setTalkKeyHeld(false);
    };

    // A lost keyup (alt-tab, window blur) would otherwise leave the mic open.
    const handleBlur = () => setTalkKeyHeld(false);

    window.addEventListener('keydown', handleDown);
    window.addEventListener('keyup', handleUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleDown);
      window.removeEventListener('keyup', handleUp);
      window.removeEventListener('blur', handleBlur);
      setTalkKeyHeld(false);
    };
  }, [isEnabled, setTalkKeyHeld]);
}
