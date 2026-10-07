'use client';

import React from 'react';
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useFriendsStore } from '@/stores/friends.store';

export default function ProfileFriendsPage() {
  const { friends, setModalOpen } = useFriendsStore();
  
  return (
    <div className="flex flex-col gap-8">
      {/* Friends Card */}
      <div className="p-6 rounded-2xl border border-surface-border bg-surface-raised flex flex-col sm:flex-row sm:items-center justify-between shadow-xl gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-deck-100">Friends & Rivals</h4>
            <p className="text-sm text-deck-400">
              {friends.length} {friends.length === 1 ? 'friend' : 'friends'} connected
            </p>
          </div>
        </div>
        <Button variant="secondary" onClick={() => setModalOpen(true)}>
          Manage Friends
        </Button>
      </div>
      
      <div className="p-12 text-center text-deck-500 text-sm border border-dashed border-surface-border rounded-2xl">
        Select 'Manage Friends' to add friends by their Player ID.
      </div>
    </div>
  );
}
