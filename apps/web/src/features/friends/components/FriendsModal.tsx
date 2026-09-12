'use client';

import { UserPlus, Users } from 'lucide-react';
import React, { useState } from 'react';
import { Modal } from '@/components/ui';
import { useFriendsStore } from '@/stores/friends.store';
import { FriendListTab } from './FriendListTab';
import { FriendRequestsTab } from './FriendRequestsTab';
import { FriendSearchTab } from './FriendSearchTab';

const TAB_FRIENDS = 'friends';
const TAB_SEARCH = 'search';
const TAB_REQUESTS = 'requests';

type TabType = typeof TAB_FRIENDS | typeof TAB_SEARCH | typeof TAB_REQUESTS;

export function FriendsModal() {
  const [activeTab, setActiveTab] = useState<TabType>(TAB_FRIENDS);
  const { isModalOpen, setModalOpen, friends, incomingRequests } = useFriendsStore();

  const pendingCount = incomingRequests.length;

  return (
    <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title="Arcade Friends Hub">
      <div className="flex flex-col gap-4">
        {/* Subheader / Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-base border border-surface-border">
          <button
            type="button"
            onClick={() => setActiveTab(TAB_FRIENDS)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === TAB_FRIENDS
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-deck-400 hover:text-deck-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Friends ({friends.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab(TAB_SEARCH)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === TAB_SEARCH
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-deck-400 hover:text-deck-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Friend</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab(TAB_REQUESTS)}
            className={`flex-1 relative flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === TAB_REQUESTS
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-deck-400 hover:text-deck-200'
            }`}
          >
            <span>Requests</span>
            {pendingCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-deck-950 font-black text-[9px] flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="min-h-[220px]">
          {activeTab === TAB_FRIENDS && (
            <FriendListTab onSwitchToSearch={() => setActiveTab(TAB_SEARCH)} />
          )}
          {activeTab === TAB_SEARCH && <FriendSearchTab />}
          {activeTab === TAB_REQUESTS && <FriendRequestsTab />}
        </div>
      </div>
    </Modal>
  );
}
