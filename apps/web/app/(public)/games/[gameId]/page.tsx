import { ArrowLeft, Users, Play, Calendar, Tag, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { GAME_DEFINITIONS } from '@/data/games';

export async function generateStaticParams() {
  return GAME_DEFINITIONS.map((game) => ({
    gameId: game.id,
  }));
}

interface PageProps {
  params: Promise<{ gameId: string }>;
}

export default async function GameOverviewPage({ params }: PageProps) {
  const { gameId } = await params;
  const game = GAME_DEFINITIONS.find((g) => g.id === gameId || g.slug === gameId);

  if (!game) {
    notFound();
  }

  const isAvailable = game.status === 'available';

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8">
      {/* Back navigation */}
      <div>
        <Link
          href="/games"
          className="inline-flex items-center gap-2 text-xs font-medium text-deck-500 hover:text-deck-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to games</span>
        </Link>
      </div>

      {/* Main Game Shell Header */}
      <div className="rounded-2xl border border-surface-border bg-surface-raised p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-3xl flex-shrink-0">
            {game.category === 'strategy' ? '♟️' : game.category === 'arcade' ? '🕹️' : '🧩'}
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <Badge variant={isAvailable ? 'success' : 'neutral'}>
                {game.badge || game.status}
              </Badge>
              <Badge variant="outline">{game.category}</Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-deck-950 dark:text-white font-display">
              {game.name}
            </h1>
            <p className="text-xs text-deck-500 flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {game.players.min} - {game.players.max} Players
              </span>
              {game.releaseDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {game.releaseDate}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {isAvailable ? (
            <Link href={`/play/${game.id}`} className="w-full md:w-auto">
              <Button variant="primary" size="lg" className="w-full md:w-auto gap-2">
                <Play className="w-4 h-4 fill-current" />
                <span>Play Locally</span>
              </Button>
            </Link>
          ) : (
            <Button variant="outline" size="lg" disabled className="w-full md:w-auto opacity-60">
              Coming Soon
            </Button>
          )}
        </div>
      </div>

      {/* Description & Metadata grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 rounded-xl border border-surface-border bg-surface-raised p-6 flex flex-col gap-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-deck-900 dark:text-deck-100 font-display">
            About the Game
          </h2>
          <p className="text-sm text-deck-600 dark:text-deck-300 leading-relaxed">
            {game.description}
          </p>

          <div className="pt-4 border-t border-surface-border">
            <h3 className="text-xs font-semibold text-deck-500 uppercase tracking-wide mb-2">
              Tags
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {game.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-surface-overlay text-deck-600 dark:text-deck-400 border border-surface-border"
                >
                  <Tag className="w-3 h-3 opacity-60" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-surface-border bg-surface-raised p-6 flex flex-col gap-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-deck-900 dark:text-deck-100 font-display">
            Multiplayer Mode
          </h2>
          <div className="p-4 rounded-lg bg-surface-overlay border border-surface-border flex flex-col gap-2 text-xs">
            <div className="flex items-center justify-between font-semibold text-deck-800 dark:text-deck-200">
              <span>Online Lobby</span>
              <Badge variant="warning">Phase 2</Badge>
            </div>
            <p className="text-deck-500 leading-relaxed">
              Multiplayer room creation and WebRTC transport contracts are reserved and will become
              active in the next update.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-surface-overlay border border-surface-border flex flex-col gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-deck-700 dark:text-deck-300 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Offline Ready</span>
            </div>
            <p className="text-deck-500 leading-relaxed">
              Playable offline with local state persisted automatically to your browser storage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
