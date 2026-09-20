'use client';

import { ArrowLeft, Maximize2, Minimize2, Tv, Volume2, VolumeX, X } from 'lucide-react';
import Link from 'next/link';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { GameDefinition } from '@playdeck/game-types';
import { useFullscreen, type UseFullscreenReturn } from '@/features/games/hooks/use-fullscreen';
import { cn } from '@/lib/utils';
import { usePreferencesStore } from '@/stores/preferences.store';
import { GameCategoryBadge } from './GameBadge';

const BUTTON_TYPE = 'button';
const LABEL_MUTE = 'Mute sound FX';
const LABEL_UNMUTE = 'Enable sound FX';

interface FullscreenStageContextValue extends UseFullscreenReturn {
  game: GameDefinition;
}

const FullscreenStageContext = createContext<FullscreenStageContextValue | null>(null);

/** Hook to access current game stage fullscreen state from within any game component */
export function useStageFullscreen(): FullscreenStageContextValue | null {
  return useContext(FullscreenStageContext);
}

export interface GameFullscreenStageProps {
  game: GameDefinition;
  children: React.ReactNode;
  className?: string;
}

/**
 * Unified Fullscreen & Theater Stage for all PlayDeck games.
 * Wraps games with native HTML5 fullscreen, CSS full-viewport fallback for iOS Safari,
 * auto-dimming arcade HUD dock, and responsive viewport expansion.
 */
export function GameFullscreenStage({ game, children, className }: GameFullscreenStageProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fullscreen = useFullscreen({
    targetRef: containerRef,
    enableHotkey: true,
    lockScroll: true,
  });

  const { isFullscreen, isNative, toggleFullscreen, toggleTheater, exitFullscreen } = fullscreen;

  const soundEnabled = usePreferencesStore((s) => s.soundEnabled);
  const toggleSound = usePreferencesStore((s) => s.toggleSound);

  // Auto-dim HUD during active fullscreen play when cursor is idle
  const [isControlsDimmed, setIsControlsDimmed] = useState(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetIdleTimer = useCallback(() => {
    setIsControlsDimmed(false);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (isFullscreen) {
      idleTimerRef.current = setTimeout(() => {
        setIsControlsDimmed(true);
      }, 3500);
    }
  }, [isFullscreen]);

  useEffect(() => {
    resetIdleTimer();
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [isFullscreen, resetIdleTimer]);

  const contextValue: FullscreenStageContextValue = {
    ...fullscreen,
    game,
  };

  return (
    <FullscreenStageContext.Provider value={contextValue}>
      <div
        ref={containerRef}
        data-fullscreen={isFullscreen ? 'true' : 'false'}
        className={cn(
          'w-full transition-colors duration-200',
          isFullscreen
            ? 'fixed inset-0 z-[100] h-[100dvh] w-screen bg-[#070b14] overflow-hidden select-none flex flex-col is-fullscreen'
            : 'relative flex flex-col items-center',
          className,
        )}
        style={
          isFullscreen
            ? {
                paddingTop: 'env(safe-area-inset-top)',
                paddingBottom: 'env(safe-area-inset-bottom)',
                paddingLeft: 'env(safe-area-inset-left)',
                paddingRight: 'env(safe-area-inset-right)',
              }
            : undefined
        }
        onMouseMove={isFullscreen ? resetIdleTimer : undefined}
        onTouchStart={isFullscreen ? resetIdleTimer : undefined}
      >
        {/* Normal Page View: Floating Arcade Quick-Action Pill */}
        {!isFullscreen && (
          <div className="w-full max-w-6xl mx-auto flex items-center justify-end px-3 py-1.5 mb-2">
            <div className="inline-flex items-center gap-1.5 p-1 rounded-xl border border-surface-border bg-surface-raised/90 backdrop-blur-md shadow-sm">
              {/* Fullscreen Button with [F] hotkey */}
              <button
                type={BUTTON_TYPE}
                onClick={toggleFullscreen}
                className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 transition-all font-semibold text-xs active:scale-95"
                title="Enter Fullscreen (F)"
                aria-label="Enter Fullscreen"
              >
                <Maximize2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                <span>Fullscreen</span>
                <kbd className="hidden sm:inline-block px-1 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-[9px] font-mono leading-none text-amber-300">
                  F
                </kbd>
              </button>

              {/* Theater View Toggle */}
              <button
                type={BUTTON_TYPE}
                onClick={toggleTheater}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-surface-border bg-surface-base/80 hover:bg-surface-overlay text-deck-400 hover:text-white transition-colors text-xs font-medium"
                title="Expand Theater View"
                aria-label="Expand Theater View"
              >
                <Tv className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Theater</span>
              </button>

              {/* Quick Sound Toggle */}
              <button
                type={BUTTON_TYPE}
                onClick={() => void toggleSound()}
                className="p-1.5 rounded-lg border border-surface-border bg-surface-base/80 hover:bg-surface-overlay text-deck-400 hover:text-white transition-colors"
                title={soundEnabled ? LABEL_MUTE : LABEL_UNMUTE}
                aria-label={soundEnabled ? LABEL_MUTE : LABEL_UNMUTE}
              >
                {soundEnabled ? (
                  <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5 text-deck-500" />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Fullscreen / Theater Mode: Tactical Floating Arcade Dock */}
        {isFullscreen && (
          <header
            className={cn(
              'w-full border-b border-surface-border/80 bg-surface-base/90 backdrop-blur-md px-3 sm:px-5 py-2.5 flex items-center justify-between z-20 shadow-2xl transition-opacity duration-300',
              isControlsDimmed
                ? 'opacity-25 hover:opacity-100 focus-within:opacity-100'
                : 'opacity-100',
            )}
            onMouseEnter={() => setIsControlsDimmed(false)}
          >
            {/* Left side: Back to catalog + Game Branding */}
            <div className="flex items-center gap-3 min-w-0">
              <Link
                href="/games"
                onClick={exitFullscreen}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-surface-border bg-surface-raised/80 hover:bg-surface-overlay text-deck-300 hover:text-white transition-colors text-xs font-medium shrink-0"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Back to games</span>
              </Link>

              <div className="h-4 w-px bg-surface-border hidden sm:block" />

              <div className="flex items-center gap-2 truncate">
                <span className="font-display font-black text-sm tracking-wide text-white truncate">
                  {game.name}
                </span>
                <GameCategoryBadge category={game.category} size="xs" />
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {isNative ? 'FULLSCREEN' : 'THEATER'}
                </span>
              </div>
            </div>

            {/* Right side: Controls (Sound, Toggle, Exit) */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Sound toggle */}
              <button
                type={BUTTON_TYPE}
                onClick={() => void toggleSound()}
                className="p-1.5 rounded-lg border border-surface-border bg-surface-raised hover:bg-surface-overlay text-deck-400 hover:text-white transition-colors"
                title={soundEnabled ? LABEL_MUTE : LABEL_UNMUTE}
                aria-label={soundEnabled ? LABEL_MUTE : LABEL_UNMUTE}
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-amber-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-deck-500" />
                )}
              </button>

              {/* Toggle Fullscreen / Theater */}
              <button
                type={BUTTON_TYPE}
                onClick={toggleFullscreen}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-semibold transition-all active:scale-95"
                title="Toggle Fullscreen (F)"
                aria-label="Toggle Fullscreen"
              >
                <Minimize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Exit Fullscreen</span>
                <kbd className="hidden lg:inline-block px-1 py-0.2 rounded bg-amber-500/20 text-[9px] font-mono border border-amber-500/30">
                  F
                </kbd>
              </button>

              {/* Quick Exit (Esc) */}
              <button
                type={BUTTON_TYPE}
                onClick={exitFullscreen}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-surface-border bg-surface-raised hover:bg-surface-overlay text-deck-400 hover:text-white text-xs font-medium transition-colors"
                title="Close Fullscreen (Esc)"
                aria-label="Close Fullscreen"
              >
                <X className="w-4 h-4" />
                <kbd className="hidden md:inline-block px-1 py-0.2 rounded bg-surface-overlay text-[9px] font-mono border border-surface-border">
                  Esc
                </kbd>
              </button>
            </div>
          </header>
        )}

        {/* Main Stage Arena: Max-height responsive viewport */}
        <div
          className={cn(
            'w-full',
            isFullscreen
              ? 'flex-1 min-h-0 flex items-center justify-center p-2 sm:p-4 overflow-y-auto overflow-x-hidden'
              : 'flex-1 flex flex-col items-center justify-center',
          )}
        >
          {children}
        </div>
      </div>
    </FullscreenStageContext.Provider>
  );
}
