'use client';

import { AlertTriangle, Loader2 } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import type { GameDefinition, Player } from '@playdeck/game-types';
import { Button } from '@playdeck/ui';
import { useLudoMultiplayerStore } from '@/stores/ludo-multiplayer.store';
import { useMiniGolfMultiplayerStore } from '@/stores/mini-golf-multiplayer.store';
import { useMultiplayerStore } from '@/stores/multiplayer.store';
import { usePlayerStore } from '@/stores/player.store';
import { useSnakeLadderMultiplayerStore } from '@/stores/snake-ladder-multiplayer.store';
import { JOIN_ROOM_PARAM, parseJoinCode } from '../services/join-link';

const LUDO_GAME_ID = 'ludo';
const MINI_GOLF_GAME_ID = 'mini-golf';
const SNAKE_LADDER_GAME_ID = 'snake-and-ladder';

type GateStatus = 'idle' | 'joining' | 'failed';

/** Games with dedicated multi-seat room stores route to their own stores. */
function currentRoomCodeFor(gameId: string): string | null {
  if (gameId === LUDO_GAME_ID) return useLudoMultiplayerStore.getState().roomCode;
  if (gameId === MINI_GOLF_GAME_ID) return useMiniGolfMultiplayerStore.getState().roomCode;
  if (gameId === SNAKE_LADDER_GAME_ID) return useSnakeLadderMultiplayerStore.getState().roomCode;
  return useMultiplayerStore.getState().roomCode;
}

async function joinRoomFor(gameId: string, code: string, player: Player): Promise<string | null> {
  if (gameId === LUDO_GAME_ID) {
    const store = useLudoMultiplayerStore.getState();
    const ok = await store.joinRoomByCode(code, {
      id: player.id,
      displayName: player.displayName,
      avatar: player.avatar || '🕹️',
    });
    return ok ? null : (useLudoMultiplayerStore.getState().error ?? 'Could not join room');
  }

  if (gameId === MINI_GOLF_GAME_ID) {
    const store = useMiniGolfMultiplayerStore.getState();
    const ok = await store.joinRoomByCode(code, {
      id: player.id,
      displayName: player.displayName,
      avatar: player.avatar || '⛳',
    });
    return ok ? null : (useMiniGolfMultiplayerStore.getState().error ?? 'Could not join room');
  }

  if (gameId === SNAKE_LADDER_GAME_ID) {
    const store = useSnakeLadderMultiplayerStore.getState();
    const ok = await store.joinRoomByCode(code, {
      id: player.id,
      displayName: player.displayName,
      avatar: player.avatar || '🕹️',
    });
    return ok ? null : (useSnakeLadderMultiplayerStore.getState().error ?? 'Could not join room');
  }

  const store = useMultiplayerStore.getState();
  // A player switching rooms leaves the old one first so the channel is free.
  if (store.roomCode && store.roomCode !== code) store.leaveRoom();
  const ok = await store.joinRoomByCode(code, player, gameId);
  return ok ? null : (useMultiplayerStore.getState().errorMessage ?? 'Could not join room');
}

export interface JoinLinkGateProps {
  game: GameDefinition;
  children: ReactNode;
}

/** Drops `?room=` from the address bar, keeping any other query parameters. */
function useClearJoinParam() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return useCallback(() => {
    const next = new URLSearchParams(searchParams.toString());
    next.delete(JOIN_ROOM_PARAM);
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);
}

/** Joins the room named by the page's `?room=` link, once per link. */
function useJoinLink(gameId: string) {
  const rawParam = useSearchParams().get(JOIN_ROOM_PARAM);
  const code = parseJoinCode(rawParam);
  const clearParam = useClearJoinParam();
  const player = usePlayerStore((state) => state.player);

  const [status, setStatus] = useState<GateStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  // The link value already dealt with. The address bar updates a beat after
  // `router.replace`, so this keeps the gate from acting on the same link twice.
  const [handledParam, setHandledParam] = useState<string | null>(null);
  const isPending = rawParam !== null && rawParam !== handledParam;

  const finish = useCallback(() => {
    setHandledParam(rawParam);
    setStatus('idle');
    clearParam();
  }, [clearParam, rawParam]);

  const fail = useCallback((message: string) => {
    setError(message);
    setStatus('failed');
  }, []);

  const join = useCallback(async () => {
    if (!code || !player) return;
    setStatus('joining');
    setError(null);
    const failure = await joinRoomFor(gameId, code, player);
    if (failure) fail(failure);
    else finish();
  }, [code, fail, finish, gameId, player]);

  useEffect(() => {
    if (!isPending || status !== 'idle' || !player) return;
    if (!code) fail('That invite link is not valid');
    // Arriving from an accepted invite: already in this room, nothing to do.
    else if (currentRoomCodeFor(gameId) === code) finish();
    else void join();
  }, [code, fail, finish, gameId, isPending, join, player, status]);

  return { code, isPending, hasPlayer: Boolean(player), status, error, join, finish };
}

/**
 * Handles shareable `/play/<gameId>?room=<code>` links. Joins the room before
 * the game mounts, so each game opens already seated as the guest, exactly as
 * it does after accepting a friend's invite. The code is then dropped from the
 * address bar so a later reload does not try to join again.
 */
export function JoinLinkGate({ game, children }: JoinLinkGateProps) {
  const { code, isPending, hasPlayer, status, error, join, finish } = useJoinLink(game.id);
  const initPlayer = usePlayerStore((state) => state.initPlayer);

  // Someone may open the link as their first page, before the navbar loads the player.
  useEffect(() => {
    if (isPending && !hasPlayer) void initPlayer();
  }, [hasPlayer, initPlayer, isPending]);

  if (!isPending) return <>{children}</>;

  if (status === 'failed') {
    return (
      <JoinFailedView
        gameName={game.name}
        error={error}
        onRetry={code ? () => void join() : undefined}
        onSkip={finish}
      />
    );
  }

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      <span className="font-display text-xs font-semibold uppercase tracking-wider text-deck-400">
        Joining {game.name} room {code ?? ''}…
      </span>
    </div>
  );
}

interface JoinFailedViewProps {
  gameName: string;
  error: string | null;
  onRetry?: () => void;
  onSkip: () => void;
}

function JoinFailedView({ gameName, error, onRetry, onSkip }: JoinFailedViewProps) {
  return (
    <div className="mx-auto flex min-h-[40vh] w-full max-w-sm flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-lg font-bold text-deck-950 dark:text-white">
          Couldn&apos;t join {gameName}
        </h2>
        <p className="text-sm text-deck-400">
          {error}. The room may have closed. Ask your friend for a fresh link.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {onRetry && (
          <Button variant="primary" size="sm" onClick={onRetry}>
            Try again
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={onSkip}>
          Open {gameName} without joining
        </Button>
      </div>
    </div>
  );
}
