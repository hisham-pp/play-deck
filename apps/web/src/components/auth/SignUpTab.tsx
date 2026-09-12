'use client';

import { Mail, Lock, User, Sparkles, Eye, EyeOff } from 'lucide-react';
import React, { useState } from 'react';
import { Button, Input } from '@playdeck/ui';
import { ICON_SIZE_CLASS } from '@/features/auth/auth.constants';

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
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 mt-2">
      <Input
        label="Player Handle (Display Name)"
        type="text"
        placeholder="e.g. PixelKnight"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        icon={<User className={ICON_SIZE_CLASS} />}
        maxLength={24}
        disabled={isLoading}
      />
      <Input
        label="Email Address"
        type="email"
        placeholder="player@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        icon={<Mail className={ICON_SIZE_CLASS} />}
        required
        disabled={isLoading}
      />
      <Input
        label="Password"
        type={showPassword ? 'text' : 'password'}
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        icon={<Lock className={ICON_SIZE_CLASS} />}
        action={
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="text-deck-400 hover:text-deck-200 transition-colors p-0.5 cursor-pointer"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className={ICON_SIZE_CLASS} />
            ) : (
              <Eye className={ICON_SIZE_CLASS} />
            )}
          </button>
        }
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
