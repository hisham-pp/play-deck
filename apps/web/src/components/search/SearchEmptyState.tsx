'use client';

import { Gamepad2 } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

interface SearchEmptyStateProps {
  query: string;
  onReset: () => void;
  onClose: () => void;
}

export function SearchEmptyState({ query, onReset, onClose }: SearchEmptyStateProps) {
  return (
    <div className="py-12 px-4 text-center flex flex-col items-center justify-center">
      <div className="w-12 h-12 rounded-xl bg-surface-overlay border border-surface-border flex items-center justify-center text-deck-400 mb-3">
        <Gamepad2 className="w-6 h-6 opacity-60" />
      </div>
      <h4 className="text-sm font-semibold text-deck-200 mb-1">No games found</h4>
      <p className="text-xs text-deck-500 max-w-sm mb-4">
        No titles or tags match &quot;{query}&quot;. Try a different query or browse categories.
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onReset}
          className="px-3 py-1.5 text-xs font-semibold rounded-md border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 transition-colors"
        >
          Reset Search
        </button>
        <Link
          href="/games"
          onClick={onClose}
          className="px-3 py-1.5 text-xs font-semibold rounded-md border border-surface-border bg-surface-overlay hover:bg-surface-border text-deck-300 transition-colors"
        >
          Browse Full Catalog
        </Link>
      </div>
    </div>
  );
}
