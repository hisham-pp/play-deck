'use client';

import React, { useState } from 'react';

import type { SecretMissionPlayer } from '../types/secret-mission.types';

interface Props {
  players: SecretMissionPlayer[];
  localPlayerId: string;
  isHost: boolean;
  onAccuse: (suspectId: string, missionDescription: string) => void;
}

export function SecretMissionAccusationPanel({ players, localPlayerId, isHost, onAccuse }: Props) {
  const [suspectId, setSuspectId] = useState('');
  const [description, setDescription] = useState('');

  const others = players.filter((p) => p.id !== localPlayerId);

  const handleSubmit = () => {
    if (!suspectId || !description.trim()) return;
    onAccuse(suspectId, description.trim());
    setSuspectId('');
    setDescription('');
  };

  if (!isHost && localPlayerId) return null;

  return (
    <div className="w-full max-w-lg rounded-xl border border-rose-500/30 bg-rose-950/20 p-4 space-y-3">
      <p className="text-xs font-bold uppercase tracking-wider text-rose-400">🚨 Make Accusation</p>
      <select
        className="w-full rounded-lg bg-surface-base border border-surface-border text-sm text-deck-200 p-2"
        value={suspectId}
        onChange={(e) => setSuspectId(e.target.value)}
      >
        <option value="">Select suspect…</option>
        {others.map((p) => (
          <option key={p.id} value={p.id}>
            {p.displayName}
          </option>
        ))}
      </select>
      <input
        className="w-full rounded-lg bg-surface-base border border-surface-border text-sm text-deck-200 p-2"
        placeholder="Describe the mission you suspect…"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        maxLength={120}
      />
      <button
        onClick={handleSubmit}
        disabled={!suspectId || !description.trim()}
        className="w-full rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-bold py-2 text-sm transition-colors"
      >
        Accuse!
      </button>
    </div>
  );
}
