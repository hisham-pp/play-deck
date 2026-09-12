'use client';

import { Mail, Lock } from 'lucide-react';
import React from 'react';
import { Button, Input } from '@playdeck/ui';

export interface SignInTabProps {
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
}

export function SignInTab({
  email,
  setEmail,
  password,
  setPassword,
  onSubmit,
  isLoading,
}: SignInTabProps) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 mt-2">
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
    </form>
  );
}
