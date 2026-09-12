'use client';

import { LogIn } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';

export interface JoinRoomViewProps {
  isLoading: boolean;
  errorMessage: string | null;
  onJoin: (code: string) => Promise<void>;
}

export function JoinRoomView({ isLoading, errorMessage, onJoin }: JoinRoomViewProps) {
  const [code, setCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = code.trim().replace(/\D/g, '');
    if (clean.length !== 6) return;
    await onJoin(clean);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(val);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-5 py-4 text-center">
      <div className="w-full max-w-xs flex flex-col gap-2">
        <label
          htmlFor="six-digit-code"
          className="text-xs font-semibold uppercase tracking-wider text-deck-500"
        >
          Enter 6-Digit Room Code
        </label>
        <input
          id="six-digit-code"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          placeholder="••••••"
          value={code}
          onChange={handleInputChange}
          className="w-full text-center text-3xl font-mono font-bold tracking-[0.3em] py-3 rounded-xl border border-surface-border bg-surface-overlay text-amber-400 focus:outline-none focus:border-amber-500 placeholder-deck-600"
          autoFocus
          disabled={isLoading}
        />
        <span className="text-[11px] text-deck-400">
          Ask the host for their 6-digit game number.
        </span>
      </div>

      {errorMessage && (
        <div className="p-2.5 rounded-md bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 w-full max-w-xs">
          {errorMessage}
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        loading={isLoading}
        disabled={code.length !== 6 || isLoading}
        className="w-full max-w-xs flex items-center justify-center gap-2"
      >
        <LogIn className="w-4 h-4" />
        <span>Join Match</span>
      </Button>
    </form>
  );
}
