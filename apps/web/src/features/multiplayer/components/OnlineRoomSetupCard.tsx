'use client';

import { ArrowLeft, Loader2, Radio, Users } from 'lucide-react';
import React, { useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@playdeck/ui';

export interface OnlineRoomSetupCardProps {
  gameName?: string;
  title?: string;
  gameIcon?: React.ReactNode;
  subtitle?: string;
  description?: string;
  isHosting?: boolean;
  isJoining?: boolean;
  error?: string | null;
  onHost: () => void;
  onJoin: (code: string) => void;
  onBack?: () => void;
}

export function OnlineRoomSetupCard({
  gameName,
  title,
  gameIcon,
  subtitle,
  description,
  isHosting = false,
  isJoining = false,
  error = null,
  onHost,
  onJoin,
  onBack,
}: OnlineRoomSetupCardProps) {
  const [code, setCode] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const heading = title || (gameName ? `${gameName} Online` : 'Online Match');
  const subtext = description || subtitle || 'Play with friends in real-time with live voice chat!';

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = code.trim().toUpperCase();
    if (!clean) {
      setLocalError('Please enter a room code');
      return;
    }
    if (clean.length < 4) {
      setLocalError('Please enter a valid room code (at least 4 characters)');
      return;
    }
    setLocalError(null);
    onJoin(clean);
  };

  const isBusy = isHosting || isJoining;
  const displayError = error || localError;

  return (
    <Card className="w-full max-w-md mx-auto border-amber-500/20 bg-slate-900/95 shadow-2xl backdrop-blur">
      <CardHeader className="text-center pb-3">
        <div className="flex items-center justify-between mb-1">
          {onBack ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              disabled={isBusy}
              className="text-slate-400 hover:text-slate-200 -ml-2 h-8 px-2"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span>Back</span>
            </Button>
          ) : (
            <div />
          )}
        </div>
        <CardTitle className="text-xl font-black text-slate-100 flex items-center justify-center gap-2">
          {gameIcon && <span>{gameIcon}</span>}
          <span>{heading}</span>
        </CardTitle>
        <p className="text-xs text-slate-400 mt-1">{subtext}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          variant="primary"
          onClick={onHost}
          disabled={isBusy}
          className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
        >
          {isHosting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating Room…</span>
            </>
          ) : (
            <>
              <Radio className="w-4 h-4" />
              <span>Host New Online Match</span>
            </>
          )}
        </Button>

        <div className="relative flex items-center justify-center my-3">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-slate-900 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider absolute">
            Or Join Existing Room
          </span>
        </div>

        <form onSubmit={handleJoinSubmit} className="space-y-3">
          <Input
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              if (localError) setLocalError(null);
            }}
            placeholder="ENTER ROOM CODE"
            className="bg-slate-950/80 border-slate-700 text-center font-mono font-bold tracking-widest uppercase text-white"
            maxLength={8}
            disabled={isBusy}
          />

          {displayError && (
            <p className="text-xs text-rose-400 text-center font-medium">{displayError}</p>
          )}

          <Button
            type="submit"
            variant="outline"
            disabled={!code.trim() || isBusy}
            className="w-full border-slate-700 text-slate-200 hover:text-white"
          >
            {isJoining ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                <span>Joining Room…</span>
              </>
            ) : (
              <>
                <Users className="w-4 h-4 mr-1.5" />
                <span>Join Room</span>
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
