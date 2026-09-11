'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useLibraryStore } from '@/stores/library.store';
import { Button } from '@/components/ui/Button';
import { EmptyShelf } from '@/components/game/EmptyShelf';
import { Trash2, History, Play } from 'lucide-react';

export default function LibraryPage() {
  const { recentSessions, initLibrary, clearHistory } = useLibraryStore();

  useEffect(() => {
    initLibrary();
  }, [initLibrary]);

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between pb-4 border-b border-surface-border">
        <div>
          <h1 className="text-3xl font-extrabold text-deck-950 dark:text-white font-display tracking-tight">
            Your Library
          </h1>
          <p className="text-sm text-deck-500 mt-1">
            Persisted history of game sessions and saved matches from IndexedDB.
          </p>
        </div>

        {recentSessions.length > 0 && (
          <Button
            onClick={clearHistory}
            variant="outline"
            size="sm"
            className="text-rose-500 hover:text-rose-600 gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </Button>
        )}
      </div>

      {recentSessions.length === 0 ? (
        <EmptyShelf
          title="Your game shelf is waiting."
          description="Games you play will automatically be indexed and saved here."
          actionText="Discover games"
          actionHref="/games"
        />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-deck-400 uppercase tracking-wider">
            <History className="w-4 h-4" />
            <span>Recent Sessions</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentSessions.map((session) => (
              <div
                key={session.id}
                className="p-5 rounded-lg border border-surface-border bg-surface-raised flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-deck-400 mb-2">
                    <span className="capitalize px-2 py-0.5 rounded bg-surface-overlay border border-surface-border">
                      {session.status}
                    </span>
                    <span>{new Date(session.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h4 className="text-lg font-bold text-deck-950 dark:text-white capitalize mb-1">
                    {session.gameId}
                  </h4>
                  <p className="text-xs text-deck-500 font-mono">
                    ID: {session.id}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-surface-border flex items-center justify-between">
                  <span className="text-xs text-deck-500">
                    Players: {session.players.length}
                  </span>
                  <Link href={`/play/${session.gameId}`}>
                    <Button variant="primary" size="sm" className="gap-1.5">
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Launch</span>
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
