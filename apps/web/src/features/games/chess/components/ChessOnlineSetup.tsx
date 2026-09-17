'use client';

import { Check, Copy, Loader2, LogIn, UserPlus, Users } from 'lucide-react';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Button, TabContent, TabList, Tabs, TabTrigger } from '@playdeck/ui';
import { InviteToRoomModal } from '@/features/friends/components/InviteToRoomModal';
import { useMultiplayerStore } from '@/stores/multiplayer.store';
import { usePlayerStore } from '@/stores/player.store';

const CHESS_GAME_ID = 'chess';
const CODE_LENGTH = 6;
const WIDE = 'w-full max-w-xs';

export interface ChessOnlineSetupProps {
  /** Called once both players are in the room and the game can begin. */
  onReady: () => void;
}

function RoomCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const copy = () => {
    void navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center justify-center gap-2">
      <div className="rounded-xl border border-amber-500/40 bg-surface-overlay px-6 py-2.5 font-mono text-3xl font-black tracking-widest text-amber-400 shadow-arcade">
        {code}
      </div>
      <Button variant="outline" size="sm" onClick={copy} className="h-auto p-3" title="Copy code">
        {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsInviteOpen(true)}
        className="h-auto p-3"
        title="Invite a friend"
      >
        <UserPlus className="h-4 w-4 text-amber-400" />
      </Button>
      <InviteToRoomModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        gameId={CHESS_GAME_ID}
        roomCode={code}
      />
    </div>
  );
}

function HostPanel({ onReady }: ChessOnlineSetupProps) {
  const player = usePlayerStore((state) => state.player);
  const { roomCode, role, opponent, connectionStatus, createRoom } = useMultiplayerStore();

  if (!roomCode || role !== 'host') {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <p className="text-xs text-deck-400">
          Create a room and share its code. You play White and move first.
        </p>
        <Button
          variant="primary"
          onClick={() => player && void createRoom(CHESS_GAME_ID, player)}
          loading={connectionStatus === 'connecting'}
          className={WIDE}
        >
          Create room
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 py-2 text-center">
      <span className="text-xs font-semibold uppercase tracking-wider text-deck-500">
        Room code
      </span>
      <RoomCode code={roomCode} />

      <div
        className={`${WIDE} flex items-center justify-center gap-2 rounded-lg border border-surface-border bg-surface-overlay/80 p-3 text-xs`}
      >
        {opponent ? (
          <>
            <Users className="h-4 w-4 text-emerald-400" />
            <span className="font-semibold text-emerald-400">
              {opponent.displayName} joined. You play White.
            </span>
          </>
        ) : (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
            <span className="text-deck-300">Waiting for an opponent…</span>
          </>
        )}
      </div>

      {opponent && (
        <Button variant="primary" onClick={onReady} className={WIDE}>
          Start game
        </Button>
      )}
    </div>
  );
}

function JoinPanel({ onReady }: ChessOnlineSetupProps) {
  const player = usePlayerStore((state) => state.player);
  const { connectionStatus, errorMessage, joinRoomByCode } = useMultiplayerStore();
  const [code, setCode] = useState('');
  const isLoading = connectionStatus === 'connecting';

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!player || code.length !== CODE_LENGTH) return;
    if (await joinRoomByCode(code, player)) onReady();
  };

  return (
    <form onSubmit={submit} className="flex flex-col items-center gap-4 py-4 text-center">
      <label htmlFor="chess-room-code" className={`${WIDE} flex flex-col gap-2`}>
        <span className="text-xs font-semibold uppercase tracking-wider text-deck-500">
          Room code
        </span>
        <input
          id="chess-room-code"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          maxLength={CODE_LENGTH}
          placeholder="••••••"
          value={code}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            setCode(event.target.value.replace(/\D/g, '').slice(0, CODE_LENGTH))
          }
          disabled={isLoading}
          className="w-full rounded-xl border border-surface-border bg-surface-overlay py-2.5 text-center font-mono text-3xl font-bold tracking-[0.3em] text-amber-400 placeholder-deck-600 focus:border-amber-500 focus:outline-none"
        />
        <span className="text-[11px] text-deck-400">You play Black.</span>
      </label>

      {errorMessage && (
        <p
          role="alert"
          className={`${WIDE} rounded-md border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs text-rose-400`}
        >
          {errorMessage}
        </p>
      )}

      <Button
        type="submit"
        variant="primary"
        loading={isLoading}
        disabled={code.length !== CODE_LENGTH || isLoading}
        className={`${WIDE} flex items-center justify-center gap-2`}
      >
        <LogIn className="h-4 w-4" />
        <span>Join game</span>
      </Button>
    </form>
  );
}

/**
 * Creating or joining a room. Seats follow the room: the host plays White and
 * the guest Black, so the two screens never have to negotiate colours.
 */
export function ChessOnlineSetup({ onReady }: ChessOnlineSetupProps) {
  const [tab, setTab] = useState<'create' | 'join'>('create');

  return (
    <div className="rounded-xl border border-surface-border bg-surface-base/80 p-3">
      <Tabs value={tab} onValueChange={(value) => setTab(value as 'create' | 'join')}>
        <TabList className="mb-3 grid w-full grid-cols-2">
          <TabTrigger value="create" className="justify-center py-1.5 text-center text-xs">
            Create room
          </TabTrigger>
          <TabTrigger value="join" className="justify-center py-1.5 text-center text-xs">
            Join with code
          </TabTrigger>
        </TabList>
        <TabContent value="create">
          <HostPanel onReady={onReady} />
        </TabContent>
        <TabContent value="join">
          <JoinPanel onReady={onReady} />
        </TabContent>
      </Tabs>
    </div>
  );
}
