'use client';

import React, { useState } from 'react';
import { Tabs, TabList, TabTrigger, TabContent } from '@playdeck/ui';
import { useMultiplayerStore } from '@/stores/multiplayer.store';
import { usePlayerStore } from '@/stores/player.store';
import { CreateRoomView } from './CreateRoomView';
import { JoinRoomView } from './JoinRoomView';

export interface OnlineSetupViewProps {
  onStartMatch: () => void;
}

export function OnlineSetupView({ onStartMatch }: OnlineSetupViewProps) {
  const { player } = usePlayerStore();
  const { roomCode, opponent, connectionStatus, errorMessage, createRoom, joinRoomByCode } =
    useMultiplayerStore();

  const [tab, setTab] = useState<'create' | 'join'>('create');

  const handleCreateRoom = async () => {
    if (!player) return;
    await createRoom('tic-tac-toe', player);
  };

  const handleJoinRoom = async (code: string) => {
    if (!player) return;
    const ok = await joinRoomByCode(code, player);
    if (ok) {
      onStartMatch();
    }
  };

  return (
    <div className="p-3 rounded-xl bg-surface-base/80 border border-surface-border">
      <Tabs value={tab} onValueChange={(val) => setTab(val as 'create' | 'join')}>
        <TabList className="grid grid-cols-2 w-full mb-3">
          <TabTrigger value="create" className="text-center justify-center py-1.5 text-xs">
            Create Room
          </TabTrigger>
          <TabTrigger value="join" className="text-center justify-center py-1.5 text-xs">
            Join with Code
          </TabTrigger>
        </TabList>

        <TabContent value="create">
          <CreateRoomView
            roomCode={roomCode}
            hasOpponent={Boolean(opponent)}
            isLoading={connectionStatus === 'connecting'}
            onCreate={handleCreateRoom}
            onStartGame={onStartMatch}
          />
        </TabContent>

        <TabContent value="join">
          <JoinRoomView
            isLoading={connectionStatus === 'connecting'}
            errorMessage={errorMessage}
            onJoin={handleJoinRoom}
          />
        </TabContent>
      </Tabs>
    </div>
  );
}
