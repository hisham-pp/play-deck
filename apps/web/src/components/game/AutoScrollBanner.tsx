'use client';

import { ChevronLeft, ChevronRight, Info, Play, Sparkles, Users } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameDefinition } from '@playdeck/game-types';
import { Button } from '@/components/ui/Button';
import { GameStatusBadge, GameCategoryBadge } from './GameBadge';

interface AutoScrollBannerProps {
  games: GameDefinition[];
  intervalMs?: number;
}

export function AutoScrollBanner({ games, intervalMs = 4500 }: AutoScrollBannerProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const featuredGames = games.filter((g) => g.featured || g.status === 'available');
  const activeList = featuredGames.length > 0 ? featuredGames : games;
  const count = activeList.length;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % count);
    setProgress(0);
  }, [count]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + count) % count);
    setProgress(0);
  }, [count]);

  const goToSlide = (idx: number) => {
    setCurrentIndex(idx);
    setProgress(0);
  };

  // Timer & progress bar effect
  useEffect(() => {
    if (count <= 1 || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      return;
    }

    const startTime = Date.now();
    setProgress(0);

    const stepMs = 50;
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / intervalMs) * 100);
      setProgress(pct);
    }, stepMs);

    timerRef.current = setTimeout(() => {
      nextSlide();
    }, intervalMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [currentIndex, isPaused, count, intervalMs, nextSlide]);

  if (!activeList || activeList.length === 0) {
    return null;
  }

  const currentGame = activeList[currentIndex];

  const handleSlideClick = (e: React.MouseEvent) => {
    // Navigate to play page unless user clicked a specific button/link
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) {
      return;
    }
    router.push(`/play/${currentGame.slug}`);
  };

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden border border-surface-border bg-surface-raised shadow-xl group/banner"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Visual countdown progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-surface-base/60 z-30">
        <div
          className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 transition-all duration-75 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Main Slide Stage */}
      <div
        onClick={handleSlideClick}
        className="relative min-h-[360px] md:min-h-[420px] flex flex-col justify-end p-6 md:p-10 cursor-pointer overflow-hidden transition-all select-none"
      >
        {/* Cover Artwork Image / Background */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {currentGame.bannerUrl ? (
            <img
              src={currentGame.bannerUrl}
              alt={`${currentGame.name} cover`}
              className="w-full h-full object-cover object-center scale-100 group-hover/banner:scale-105 transition-transform duration-700 ease-out"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-deck-950 via-surface-base to-deck-900" />
          )}

          {/* Layered cinematic gradients for readable typography */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/60 to-transparent z-10" />
          {/* Subtle scanline texture */}
          <div className="absolute inset-0 opacity-15 arcade-texture pointer-events-none z-10" />
        </div>

        {/* Content Container */}
        <div className="relative z-20 flex flex-col gap-3 max-w-2xl">
          {/* Top Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Featured Arcade</span>
            </div>
            <GameCategoryBadge category={currentGame.category} size="sm" />
            <GameStatusBadge status={currentGame.status} label={currentGame.badge} size="sm" />
          </div>

          {/* Title & Headline */}
          <div className="flex items-center gap-3">
            {currentGame.thumbnailUrl && (
              <div className="w-12 h-12 rounded-xl bg-surface-overlay/80 border border-white/10 p-2 shadow-md hidden sm:flex items-center justify-center flex-shrink-0">
                <img
                  src={currentGame.thumbnailUrl}
                  alt=""
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <h2 className="text-3xl md:text-5xl font-black text-white font-display uppercase tracking-tight drop-shadow-md">
              {currentGame.name}
            </h2>
          </div>

          {/* Description */}
          <p className="text-sm md:text-base text-deck-200 line-clamp-2 md:line-clamp-3 leading-relaxed drop-shadow">
            {currentGame.description}
          </p>

          {/* Tags & Player Count info */}
          <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-deck-300">
            <div className="flex items-center gap-1.5 bg-surface-base/80 px-2.5 py-1 rounded-md border border-white/10">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {currentGame.players.min === currentGame.players.max
                  ? `${currentGame.players.min} Player`
                  : `${currentGame.players.min}-${currentGame.players.max} Players`}
              </span>
            </div>
            {currentGame.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded bg-surface-base/60 text-deck-300 border border-white/5 text-[11px]"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Actions Bar */}
          <div className="flex items-center gap-3 mt-4 pt-2">
            <Link href={`/play/${currentGame.slug}`}>
              <Button
                variant="primary"
                size="lg"
                className="gap-2.5 px-6 font-bold shadow-lg shadow-amber-500/25 group-hover/banner:scale-105 transition-transform"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Play Now</span>
              </Button>
            </Link>

            <Link href={`/games/${currentGame.slug}`}>
              <Button
                variant="outline"
                size="lg"
                className="gap-2 bg-surface-base/70 backdrop-blur-sm border-white/20 text-white hover:bg-surface-overlay"
              >
                <Info className="w-4 h-4 text-deck-400" />
                <span>Overview &amp; Rules</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Previous / Next Arrow Controls */}
        <div className="absolute bottom-6 right-6 z-20 flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              prevSlide();
            }}
            aria-label="Previous game"
            className="w-10 h-10 rounded-full bg-surface-base/80 backdrop-blur-md border border-white/10 hover:border-amber-500 text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-md"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              nextSlide();
            }}
            aria-label="Next game"
            className="w-10 h-10 rounded-full bg-surface-base/80 backdrop-blur-md border border-white/10 hover:border-amber-500 text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-md"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Quick Select Thumbnails Ticker at bottom */}
      <div
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        className="relative z-20 bg-surface-raised/95 border-t border-surface-border px-4 py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar [&::-webkit-scrollbar]:hidden"
      >
        <span className="text-[10px] font-bold uppercase tracking-wider text-deck-500 flex-shrink-0 mr-1">
          Spotlight:
        </span>
        {activeList.map((game, idx) => {
          const isActive = idx === currentIndex;
          return (
            <button
              key={game.id}
              onClick={() => goToSlide(idx)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex-shrink-0 border ${
                isActive
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-sm'
                  : 'bg-surface-base border-surface-border text-deck-400 hover:text-white hover:border-surface-borderHover'
              }`}
            >
              {game.thumbnailUrl && (
                <img
                  src={game.thumbnailUrl}
                  alt=""
                  className={`w-3.5 h-3.5 object-contain ${isActive ? 'brightness-0' : ''}`}
                />
              )}
              <span>{game.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
