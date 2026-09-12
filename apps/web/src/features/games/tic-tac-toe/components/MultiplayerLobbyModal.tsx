'use client';

import React, { useState } from 'react';
import { Modal, Tabs, TabList, TabTrigger, TabContent } from '@playdeck/ui';
import { useMultiplayerStore } from '@/stores/multiplayer.store';
import { usePlayerStore } from '@/stores/player.store';
import { CreateRoomView } from './CreateRoomView';
import { JoinRoomView } from './JoinRoomView';

export interface MultiplayerLobbyModalProps {
  onMatchReady: () => void;
}

export function MultiplayerLobbyModal({ onMatchReady }: MultiplayerLobbyModalProps) {
  const { player } = usePlayerStore();
  const {
    isLobbyOpen,
    setLobbyOpen,
    roomCode,
    opponent,
    connectionStatus,
    errorMessage,
    createRoom,
    joinRoomByCode,
  } = useMultiplayerStore();

  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');

  const handleCreate = async () => {
    if (!player) return;
    await createRoom('tic-tac-toe', player);
  };

  const handleJoin = async (code: string) => {
    if (!player) return;
    const ok = await joinRoomByCode(code, player);
    if (ok) {
      onMatchReady();
    }
  };

  const handleStartGame = () => {
    setLobbyOpen(false);
    onMatchReady();
  };

  return (
    <Modal
      isOpen={isLobbyOpen}
      onClose={() => setLobbyOpen(false)}
      title="Online Multiplayer"
      description="Create a room to share a 6-digit code or enter a code to join."
      size="md"
    >
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'create' | 'join')}>
        <TabList className="grid grid-cols-2 w-full">
          <TabTrigger value="create" className="text-center justify-center py-2">
            Create Match
          </TabTrigger>
          <TabTrigger value="join" className="text-center justify-center py-2">
            Join with Code
          </TabTrigger>
        </TabList>

        <TabContent value="create">
          <CreateRoomView
            roomCode={roomCode}
            hasOpponent={Boolean(opponent)}
            isLoading={connectionStatus === 'connecting'}
            onCreate={handleCreate}
            onStartGame={handleStartGame}
          />
        </TabContent>

        <TabContent value="join">
          <JoinRoomView
            isLoading={connectionStatus === 'connecting'}
            errorMessage={errorMessage}
            onJoin={handleJoin}
          />
        </TabContent>
      </Tabs>
    </Modal>
  );
}
