'use client';

import { Check, Copy, Flag, Loader2, LogOut, Plus, UserPlus, Users } from 'lucide-react';
import React, { useState } from 'react';
import { InviteToRoomModal } from '@/features/friends/components/InviteToRoomModal';
import { ShareRoomLink } from '@/features/multiplayer/components/ShareRoomLink';
import type { SummitRace } from '../hooks/use-summit-race';
import { SUMMIT_GAME_ID } from '../services/summit-progress-repository';
import { PRIMARY_BTN, SECONDARY_BTN } from './SummitOverlays';

interface SummitOnlinePanelProps {
  race: SummitRace;
  hasPlayer: boolean;
  isReady: boolean;
  onReady: () => void;
}

function JoinForm({ race, disabled }: { race: SummitRace; disabled: boolean }) {
  const [code, setCode] = useState('');
  const busy = race.connectionStatus === 'connecting';
  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        className={PRIMARY_BTN}
        onClick={() => void race.createRoom()}
        disabled={busy || disabled}
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        Create race room
      </button>
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-500">
        <span className="h-px flex-1 bg-white/10" />
        or join with a code
        <span className="h-px flex-1 bg-white/10" />
      </div>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void race.joinRoom(code.trim());
        }}
      >
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          inputMode="numeric"
          placeholder="6-digit code"
          aria-label="Room code"
          className="min-w-0 flex-1 rounded-xl border border-white/15 bg-slate-900 px-3 py-2 text-center font-mono text-sm font-bold tracking-[0.3em] text-white outline-none focus:border-amber-400"
        />
        <button
          type="submit"
          className={SECONDARY_BTN}
          disabled={code.length !== 6 || busy || disabled}
        >
          Join
        </button>
      </form>
    </div>
  );
}

function RoomCode({ code, onInvite }: { code: string; onInvite: () => void }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    void navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <span className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1 font-mono text-xl font-black tracking-widest text-amber-300">
        {code}
      </span>
      <button type="button" onClick={copy} className={`${SECONDARY_BTN} !px-2.5 !py-1.5 text-xs`}>
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? 'Copied' : 'Copy'}
      </button>
      <button
        type="button"
        onClick={onInvite}
        className={`${SECONDARY_BTN} !px-2.5 !py-1.5 text-xs`}
      >
        <UserPlus className="h-3.5 w-3.5" /> Invite
      </button>
    </div>
  );
}

function LobbyActions({ race, isReady, onReady }: Omit<SummitOnlinePanelProps, 'hasPlayer'>) {
  if (!race.opponent) {
    return (
      <p className="flex items-center justify-center gap-2 text-xs text-slate-300">
        <Loader2 className="h-4 w-4 animate-spin text-amber-400" /> Waiting for a rival to join…
      </p>
    );
  }
  const name = race.opponent.displayName;
  if (race.isHost) {
    return (
      <div className="flex flex-col gap-2">
        <p className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-300">
          <Users className="h-4 w-4" /> {name} is here{race.rival.ready ? ' and ready!' : ''}
        </p>
        <button type="button" className={PRIMARY_BTN} onClick={race.startRace} autoFocus>
          <Flag className="h-4 w-4" /> Start race
        </button>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      <p className="text-center text-xs text-slate-300">
        Racing <span className="font-bold text-fuchsia-200">{name}</span> — the host starts the
        race.
      </p>
      <button type="button" className={SECONDARY_BTN} onClick={onReady} disabled={isReady}>
        <Check className="h-4 w-4" /> {isReady ? 'Ready — waiting for host' : "I'm ready"}
      </button>
    </div>
  );
}

/** Create / join a race room, then wait in the lobby for the host to start. */
export function SummitOnlinePanel({ race, hasPlayer, isReady, onReady }: SummitOnlinePanelProps) {
  const [inviteOpen, setInviteOpen] = useState(false);
  const { roomCode } = race;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-center text-[11px] leading-relaxed text-slate-400">
        Race a friend on the same course. You each see the other as a ghost buggy — furthest
        distance wins. Voice chat opens once you are in a room.
      </p>
      {roomCode ? (
        <>
          <RoomCode code={roomCode} onInvite={() => setInviteOpen(true)} />
          <ShareRoomLink gameId={SUMMIT_GAME_ID} gameName="Summit Rush" roomCode={roomCode} />
          <LobbyActions race={race} isReady={isReady} onReady={onReady} />
          <button type="button" className={`${SECONDARY_BTN} text-xs`} onClick={race.leaveRoom}>
            <LogOut className="h-3.5 w-3.5" /> Leave room
          </button>
          <InviteToRoomModal
            isOpen={inviteOpen}
            onClose={() => setInviteOpen(false)}
            gameId={SUMMIT_GAME_ID}
            roomCode={roomCode}
          />
        </>
      ) : (
        <JoinForm race={race} disabled={!hasPlayer} />
      )}
      {race.errorMessage && (
        <p className="text-center font-mono text-[11px] text-red-400">{race.errorMessage}</p>
      )}
    </div>
  );
}
