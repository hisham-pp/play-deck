'use client';

import { Gamepad2 } from 'lucide-react';
import React, { useState } from 'react';
import { Button, Modal, Tabs, TabList, TabTrigger, TabContent } from '@playdeck/ui';
import { usePlayerStore } from '@/stores/player.store';
import { AuthModalNotice } from './AuthModalNotice';
import { SignInTab } from './SignInTab';
import { SignUpTab } from './SignUpTab';

const TAB_SIGNIN = 'signin';
const TAB_SIGNUP = 'signup';
type AuthTab = typeof TAB_SIGNIN | typeof TAB_SIGNUP;

export function AuthModal() {
  const {
    isAuthModalOpen,
    setAuthModalOpen,
    isLoadingAuth,
    authError,
    clearAuthError,
    signInWithEmail,
    signUpWithEmail,
    continueAsGuest,
  } = usePlayerStore();

  const [activeTab, setActiveTab] = useState<AuthTab>(TAB_SIGNIN);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleClose = () => {
    clearAuthError();
    setSuccessMessage(null);
    setAuthModalOpen(false);
  };

  const switchTab = (tab: AuthTab) => {
    clearAuthError();
    setSuccessMessage(null);
    setActiveTab(tab);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setSuccessMessage(null);
    const result = await signInWithEmail(email, password);
    if (result.success) {
      setEmail('');
      setPassword('');
      handleClose();
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setSuccessMessage(null);
    const result = await signUpWithEmail(email, password, displayName);
    if (result.success) {
      setEmail('');
      setPassword('');
      setDisplayName('');
      handleClose();
    }
  };

  return (
    <Modal
      isOpen={isAuthModalOpen}
      onClose={handleClose}
      title="PlayDeck Account"
      description="Sign in with Supabase or continue playing immediately as a guest."
      size="md"
    >
      <div className="flex flex-col gap-6">
        <AuthModalNotice
          error={authError}
          success={successMessage}
          onSwitchToSignIn={() => switchTab(TAB_SIGNIN)}
        />

        <Tabs value={activeTab} onValueChange={(val) => switchTab(val as AuthTab)}>
          <TabList className="grid grid-cols-2 w-full">
            <TabTrigger value={TAB_SIGNIN} className="text-center justify-center py-2">
              Sign In
            </TabTrigger>
            <TabTrigger value={TAB_SIGNUP} className="text-center justify-center py-2">
              Create Account
            </TabTrigger>
          </TabList>

          <TabContent value={TAB_SIGNIN}>
            <SignInTab
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              onSubmit={handleSignIn}
              isLoading={isLoadingAuth}
              onSwitchToSignUp={() => switchTab(TAB_SIGNUP)}
            />
          </TabContent>

          <TabContent value={TAB_SIGNUP}>
            <SignUpTab
              displayName={displayName}
              setDisplayName={setDisplayName}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              onSubmit={handleSignUp}
              isLoading={isLoadingAuth}
              onSwitchToSignIn={() => switchTab(TAB_SIGNIN)}
            />
          </TabContent>
        </Tabs>

        <div className="relative flex items-center justify-center my-1">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-surface-border" />
          </div>
          <span className="relative px-3 bg-surface-raised text-[11px] uppercase tracking-wider text-deck-500 font-mono">
            Or
          </span>
        </div>

        <Button
          type="button"
          variant="secondary"
          className="w-full flex items-center justify-center gap-2 py-2.5"
          onClick={() => continueAsGuest()}
        >
          <Gamepad2 className="w-4 h-4 text-amber-500" />
          <span>Continue as Guest</span>
        </Button>
      </div>
    </Modal>
  );
}
