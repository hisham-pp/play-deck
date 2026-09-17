'use client';

import { Check, Link2, Share2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { buildJoinLink } from '../services/join-link';

const COPIED_RESET_MS = 2000;

export interface ShareRoomLinkProps {
  gameId: string;
  roomCode: string;
  /** Game name used in the native share sheet text. */
  gameName?: string;
  className?: string;
}

/**
 * The link a host sends so a friend joins the room in one tap. Shows the link,
 * copies it, and offers the device share sheet where the browser has one.
 */
export function ShareRoomLink({ gameId, roomCode, gameName, className }: ShareRoomLinkProps) {
  const [link, setLink] = useState('');
  const [canShare, setCanShare] = useState(false);
  const [copied, setCopied] = useState(false);

  // The origin is only known in the browser, so the link is built after mount.
  useEffect(() => {
    setLink(buildJoinLink(gameId, roomCode, window.location.origin));
    setCanShare(typeof navigator.share === 'function');
  }, [gameId, roomCode]);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), COPIED_RESET_MS);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
    } catch {
      // Clipboard can be blocked; the link stays visible and selectable.
    }
  };

  const share = async () => {
    try {
      await navigator.share({
        title: gameName ? `Play ${gameName} on PlayDeck` : 'Join my PlayDeck room',
        text: `Join my ${gameName ?? 'game'} room (code ${roomCode})`,
        url: link,
      });
    } catch {
      // Dismissing the share sheet rejects; nothing to do.
    }
  };

  if (!link) return null;

  return (
    <div className={cn('flex w-full flex-col gap-1.5', className)}>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-deck-500">
        Or share an invite link
      </span>
      <div className="flex items-stretch gap-1.5">
        <input
          readOnly
          value={link}
          aria-label="Invite link"
          onFocus={(event) => event.currentTarget.select()}
          className="min-w-0 flex-1 truncate rounded-lg border border-surface-border bg-surface-overlay px-2.5 py-1.5 font-mono text-[11px] text-deck-300 focus:border-amber-500 focus:outline-none"
        />
        <button
          type="button"
          onClick={copy}
          className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-amber-500 px-2.5 text-xs font-bold text-deck-950 transition-colors hover:bg-amber-400"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
          <span>{copied ? 'Copied' : 'Copy link'}</span>
        </button>
        {canShare && (
          <button
            type="button"
            onClick={share}
            aria-label="Share invite link"
            title="Share invite link"
            className="inline-flex shrink-0 items-center rounded-lg border border-surface-border px-2 text-amber-400 transition-colors hover:border-amber-500"
          >
            <Share2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
