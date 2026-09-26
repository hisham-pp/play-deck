'use client';

import { ChevronDown, HeadphoneOff, Headset, MicOff } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import type { SupabaseTransportService } from '@/features/multiplayer/services/supabase-transport.service';
import { usePlayerStore } from '@/stores/player.store';
import { LOCAL_LEVEL_KEY, useVoiceChatStore } from '@/stores/voice-chat.store';
import { usePushToTalk } from '../hooks/use-push-to-talk';
import { useVoiceSession } from '../hooks/use-voice-session';
import { buildParticipants, countConnected } from '../utils/voice-participants';
import { VoiceAudioSink } from './VoiceAudioSink';
import { VoiceJoinPanel } from './VoiceJoinPanel';
import { VoiceLivePanel } from './VoiceLivePanel';

export interface VoiceChatDockProps {
  roomCode: string;
  transport: SupabaseTransportService | null;
  /** Positioning classes, e.g. 'top-16 right-3 sm:top-20 sm:right-5' */
  anchorClassName?: string;
  /** 'floating' (default, fixed overlay) or 'inline' (rendered within layout flow) */
  variant?: 'floating' | 'inline';
  /** Initial open state. If omitted, floating docks start collapsed as a compact pill; inline docks start open. */
  defaultOpen?: boolean;
}

const DEFAULT_FLOATING_ANCHOR = 'top-16 right-3 sm:top-20 sm:right-5';

export function VoiceChatDock({
  roomCode,
  transport,
  anchorClassName,
  variant = 'floating',
  defaultOpen,
}: VoiceChatDockProps) {
  const isInline = variant === 'inline' || Boolean(anchorClassName?.includes('static'));
  const isFloating = !isInline;
  const resolvedAnchor = anchorClassName || DEFAULT_FLOATING_ANCHOR;

  const [isOpen, setIsOpen] = useState(() => (defaultOpen !== undefined ? defaultOpen : isInline));
  const player = usePlayerStore((state) => state.player);

  const localPlayer = useMemo(
    () =>
      player
        ? { id: player.id, displayName: player.displayName, avatar: player.avatar || '🎧' }
        : null,
    [player],
  );

  const { connect, leave, isSupported, isActive } = useVoiceSession({
    roomCode,
    transport,
    localPlayer,
  });

  const status = useVoiceChatStore((state) => state.status);
  const error = useVoiceChatStore((state) => state.error);
  const isMuted = useVoiceChatStore((state) => state.isMuted);
  const isDeafened = useVoiceChatStore((state) => state.isDeafened);
  const isPushToTalk = useVoiceChatStore((state) => state.isPushToTalk);
  const isTalkKeyHeld = useVoiceChatStore((state) => state.isTalkKeyHeld);
  const remotePeers = useVoiceChatStore((state) => state.remotePeers);
  const levels = useVoiceChatStore((state) => state.levels);
  const speaking = useVoiceChatStore((state) => state.speaking);
  const toggleMute = useVoiceChatStore((state) => state.toggleMute);
  const toggleDeafen = useVoiceChatStore((state) => state.toggleDeafen);
  const togglePushToTalk = useVoiceChatStore((state) => state.togglePushToTalk);

  usePushToTalk(isActive && isPushToTalk);

  const participants = useMemo(
    () =>
      buildParticipants({
        localPeerId: localPlayer?.id ?? null,
        localName: localPlayer?.displayName ?? 'You',
        localAvatar: localPlayer?.avatar ?? '🎧',
        isLocalMuted: isMuted,
        isLive: status === 'live',
        remotePeers,
        levels,
        speaking,
        localLevelKey: LOCAL_LEVEL_KEY,
      }),
    [localPlayer, isMuted, status, remotePeers, levels, speaking],
  );

  if (!localPlayer) return null;

  const connectedCount = countConnected(remotePeers);

  // Floating collapsed pill: compact, non-obstructive tactile audio control
  if (isFloating && !isOpen) {
    return (
      <div className={`fixed z-50 ${resolvedAnchor}`}>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2 rounded-full border border-surface-border bg-surface-raised/95 px-3.5 py-1.5 shadow-xl backdrop-blur-md transition-all hover:scale-105 hover:border-amber-500/50 hover:bg-surface-overlay active:scale-95 cursor-pointer"
          title="Open Voice Chat Audio Controls"
          aria-label="Open Voice Chat Audio Controls"
        >
          <Headset
            className={`h-4 w-4 transition-transform group-hover:scale-110 ${
              isActive ? 'text-emerald-400 animate-pulse' : 'text-amber-400'
            }`}
          />
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-deck-900 dark:text-deck-100">
            Voice
          </span>
          {isActive && (
            <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-black text-emerald-300">
              {connectedCount + 1}
            </span>
          )}
          {isMuted && <MicOff className="h-3.5 w-3.5 text-rose-400" />}
          {isDeafened && <HeadphoneOff className="h-3.5 w-3.5 text-rose-400" />}
          <ChevronDown className="h-3.5 w-3.5 text-deck-400 transition-transform rotate-180 group-hover:text-white" />
        </button>
        <VoiceAudioSink peers={remotePeers} isDeafened={isDeafened} />
      </div>
    );
  }

  const containerClasses = isFloating
    ? `fixed z-50 w-64 sm:w-72 overflow-hidden rounded-2xl border border-surface-border bg-surface-base shadow-2xl backdrop-blur-md ${resolvedAnchor}`
    : 'relative w-full max-w-sm overflow-hidden rounded-2xl border border-surface-border bg-surface-base shadow-lg';

  return (
    <div className={containerClasses}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between border-b border-surface-border bg-surface-raised p-3 text-left transition-colors hover:bg-surface-overlay cursor-pointer"
        title={isOpen ? 'Collapse voice controls' : 'Expand voice controls'}
        aria-label={isOpen ? 'Collapse voice controls' : 'Expand voice controls'}
      >
        <span className="flex items-center gap-2">
          <Headset className={`h-4 w-4 ${isActive ? 'text-emerald-400' : 'text-amber-400'}`} />
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-deck-900 dark:text-deck-100">
            Voice Chat
          </span>
          {isActive && (
            <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-black text-emerald-300">
              {connectedCount + 1} live
            </span>
          )}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-deck-400 transition-transform ${isOpen ? 'rotate-0' : 'rotate-180'}`}
        />
      </button>

      {isOpen && !isSupported && (
        <p className="p-3 text-[11px] leading-relaxed text-deck-500">
          This browser cannot run voice chat. Room chat still works.
        </p>
      )}

      {isOpen && isSupported && !isActive && (
        <VoiceJoinPanel
          roomCode={roomCode}
          error={error}
          isBusy={status === 'requesting-mic'}
          onConnect={connect}
        />
      )}

      {isOpen && isActive && (
        <VoiceLivePanel
          participants={participants}
          connectedCount={connectedCount}
          isMuted={isMuted}
          isDeafened={isDeafened}
          isPushToTalk={isPushToTalk}
          isTalkKeyHeld={isTalkKeyHeld}
          onToggleMute={toggleMute}
          onToggleDeafen={toggleDeafen}
          onTogglePushToTalk={togglePushToTalk}
          onLeave={leave}
        />
      )}

      <VoiceAudioSink peers={remotePeers} isDeafened={isDeafened} />
    </div>
  );
}
