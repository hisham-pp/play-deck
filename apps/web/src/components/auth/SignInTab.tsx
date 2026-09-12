'use client';

import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import React, { useState } from 'react';
import { Button, Input } from '@playdeck/ui';
import { ICON_SIZE_CLASS } from '@/features/auth/auth.constants';

export interface SignInTabProps {
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
  onSwitchToSignUp?: () => void;
}

export function SignInTab({
  email,
  setEmail,
  password,
  setPassword,
  onSubmit,
  isLoading,
  onSwitchToSignUp,
}: SignInTabProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 mt-2">
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
        disabled={isLoading}
      />

      <Button
        type="submit"
        variant="primary"
        className="w-full mt-2"
        loading={isLoading}
        disabled={isLoading}
      >
        Sign In
      </Button>

      {onSwitchToSignUp && (
        <div className="text-center text-xs text-deck-400 mt-1">
          <span>Don&apos;t have an account? </span>
          <button
            type="button"
            onClick={onSwitchToSignUp}
            className="text-amber-400 hover:text-amber-300 font-medium underline underline-offset-2 cursor-pointer"
          >
            Create account
          </button>
        </div>
      )}
    </form>
  );
}
