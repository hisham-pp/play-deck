'use client';

import { Mail, Lock, User, Sparkles } from 'lucide-react';
import React from 'react';
import { Button, Input } from '@playdeck/ui';

export interface SignUpTabProps {
  displayName: string;
  setDisplayName: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
  onSwitchToSignIn?: () => void;
}

export function SignUpTab({
  displayName,
  setDisplayName,
  email,
  setEmail,
  password,
  setPassword,
  onSubmit,
  isLoading,
  onSwitchToSignIn,
}: SignUpTabProps) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 mt-2">
      <Input
        label="Player Handle (Display Name)"
        type="text"
        placeholder="e.g. PixelKnight"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        icon={<User className="w-4 h-4" />}
        maxLength={24}
        disabled={isLoading}
      />
      <Input
        label="Email Address"
        type="email"
        placeholder="player@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        icon={<Mail className="w-4 h-4" />}
        required
        disabled={isLoading}
      />
      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        icon={<Lock className="w-4 h-4" />}
        required
        minLength={6}
        disabled={isLoading}
      />

      <div className="flex items-center gap-2 text-[11px] text-amber-400/90 bg-surface-overlay/80 px-3 py-2 rounded-md border border-surface-border">
        <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-400" />
        <span>Instant Play: No email verification required. Data saves to users table.</span>
      </div>

      <Button
        type="submit"
        variant="primary"
        className="w-full mt-1"
        loading={isLoading}
        disabled={isLoading}
      >
        Create & Save Player
      </Button>

      {onSwitchToSignIn && (
        <div className="text-center text-xs text-deck-400 mt-1">
          <span>Already have an account? </span>
          <button
            type="button"
            onClick={onSwitchToSignIn}
            className="text-amber-400 hover:text-amber-300 font-medium underline underline-offset-2 cursor-pointer"
          >
            Sign in
          </button>
        </div>
      )}
    </form>
  );
}
