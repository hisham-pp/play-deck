'use client';

import { Headphones, HeadphoneOff, Mic, MicOff, PhoneOff, Radio } from 'lucide-react';
import React from 'react';
import { PUSH_TO_TALK_KEY } from '../voice.constants';

const ICON_SM = 'h-4 w-4';
const BTN_TYPE = 'button';
const BASE_BUTTON =
  'inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border px-2.5 text-[11px] font-bold transition-colors';
const NEUTRAL_BUTTON = 'border-surface-border bg-surface-raised text-deck-400 hover:text-deck-100';
const DANGER_BUTTON = 'border-rose-500/40 bg-rose-500/15 text-rose-300 hover:bg-rose-500/25';

interface VoiceControlBarProps {
  isMuted: boolean;
  isDeafened: boolean;
  isPushToTalk: boolean;
  isTalkKeyHeld: boolean;
  onToggleMute: () => void;
  onToggleDeafen: () => void;
  onTogglePushToTalk: () => void;
  onLeave: () => void;
}

export function VoiceControlBar({
  isMuted,
  isDeafened,
  isPushToTalk,
  isTalkKeyHeld,
  onToggleMute,
  onToggleDeafen,
  onTogglePushToTalk,
  onLeave,
}: VoiceControlBarProps) {
  const talkKeyLabel = PUSH_TO_TALK_KEY.toUpperCase();

  return (
    <div className="flex items-center gap-1.5 border-t border-surface-border bg-surface-base p-2">
      <button
        type={BTN_TYPE}
        onClick={onToggleMute}
        aria-pressed={isMuted}
        aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
        className={`${BASE_BUTTON} flex-1 ${
          isMuted ? DANGER_BUTTON : 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
        }`}
      >
        {isMuted ? <MicOff className={ICON_SM} /> : <Mic className={ICON_SM} />}
        <span>{isMuted ? 'Muted' : 'Live'}</span>
      </button>

      <button
        type={BTN_TYPE}
        onClick={onToggleDeafen}
        aria-pressed={isDeafened}
        aria-label={isDeafened ? 'Turn room audio back on' : 'Silence room audio'}
        className={`${BASE_BUTTON} ${isDeafened ? DANGER_BUTTON : NEUTRAL_BUTTON}`}
      >
        {isDeafened ? <HeadphoneOff className={ICON_SM} /> : <Headphones className={ICON_SM} />}
      </button>

      <button
        type={BTN_TYPE}
        onClick={onTogglePushToTalk}
        aria-pressed={isPushToTalk}
        title={`Push to talk (hold ${talkKeyLabel})`}
        className={`${BASE_BUTTON} ${
          isPushToTalk
            ? `border-amber-500/50 bg-amber-500/15 text-amber-300 ${isTalkKeyHeld ? 'ring-1 ring-amber-400' : ''}`
            : NEUTRAL_BUTTON
        }`}
      >
        <Radio className={ICON_SM} />
        <span>{talkKeyLabel}</span>
      </button>

      <button
        type={BTN_TYPE}
        onClick={onLeave}
        aria-label="Leave voice chat"
        className={`${BASE_BUTTON} ${DANGER_BUTTON}`}
      >
        <PhoneOff className={ICON_SM} />
      </button>
    </div>
  );
}
