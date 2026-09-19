'use client';

import { ArrowRight, Globe, Play, User, Users } from 'lucide-react';
import React, { useState } from 'react';

interface GravityGolfLobbyProps {
  onStartSolo: () => void;
  onStartPassAndPlay: (playerCount: number) => void;
  onCreateOnlineRoom: () => void;
  onJoinOnlineRoom: (code: string) => void;
  isJoining: boolean;
}

export function GravityGolfLobby({
  onStartSolo,
  onStartPassAndPlay,
  onCreateOnlineRoom,
  onJoinOnlineRoom,
  isJoining,
}: GravityGolfLobbyProps) {
  const [activeTab, setActiveTab] = useState<'solo' | 'local' | 'online'>('solo');
  const [localPlayers, setLocalPlayers] = useState(2);
  const [joinCode, setJoinCode] = useState('');

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinCode.trim().length === 6) {
      onJoinOnlineRoom(joinCode.trim());
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto p-6 rounded-2xl border border-surface-border bg-surface-raised/95 backdrop-blur-md shadow-2xl flex flex-col items-center gap-6">
      <div className="text-center">
        <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
          Galactic Flight Academy
        </span>
        <h2 className="text-3xl font-black text-white font-display mt-1">Gravity Golf</h2>
        <p className="text-xs text-deck-400 max-w-sm mt-1">
          Place gravity wells and orbital repellers to slingshot your golf orb into the galactic
          cup.
        </p>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex items-center p-1 rounded-xl bg-surface-overlay border border-surface-border w-full">
        <button
          type="button"
          onClick={() => setActiveTab('solo')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'solo'
              ? 'bg-amber-500 text-deck-950 shadow-sm'
              : 'text-deck-400 hover:text-white'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Solo Campaign</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('local')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'local'
              ? 'bg-amber-500 text-deck-950 shadow-sm'
              : 'text-deck-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Pass & Play</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('online')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'online'
              ? 'bg-amber-500 text-deck-950 shadow-sm'
              : 'text-deck-400 hover:text-white'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Online Room</span>
        </button>
      </div>

      {/* Solo Tab Content */}
      {activeTab === 'solo' && (
        <div className="w-full flex flex-col items-center gap-4 text-center">
          <div className="p-4 rounded-xl border border-surface-border bg-surface-overlay w-full text-left">
            <div className="text-xs font-bold text-white mb-1">9 Cosmic Holes</div>
            <p className="text-xs text-deck-400">
              Solve escalating gravitational puzzles from the Lunar Slingshot to the Supermassive
              Singularity. Earn up to 27 galactic stars.
            </p>
          </div>

          <button
            type="button"
            onClick={onStartSolo}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-deck-950 font-black text-xs uppercase tracking-wider transition-all shadow-arcade cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Play Solo Campaign</span>
          </button>
        </div>
      )}

      {/* Pass & Play Tab Content */}
      {activeTab === 'local' && (
        <div className="w-full flex flex-col items-center gap-4 text-center">
          <div className="p-4 rounded-xl border border-surface-border bg-surface-overlay w-full flex items-center justify-between">
            <span className="text-xs font-bold text-white">Local Astronauts</span>
            <div className="flex items-center gap-2">
              {[2, 3, 4].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setLocalPlayers(count)}
                  className={`w-8 h-8 rounded-lg border text-xs font-bold transition-colors cursor-pointer ${
                    localPlayers === count
                      ? 'border-amber-500 bg-amber-500/20 text-amber-400'
                      : 'border-surface-border bg-surface-base text-deck-400 hover:text-white'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onStartPassAndPlay(localPlayers)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-deck-950 font-black text-xs uppercase tracking-wider transition-all shadow-arcade cursor-pointer"
          >
            <Users className="w-4 h-4" />
            <span>Start {localPlayers}-Player Match</span>
          </button>
        </div>
      )}

      {/* Online Room Tab Content */}
      {activeTab === 'online' && (
        <div className="w-full flex flex-col items-center gap-4">
          <button
            type="button"
            onClick={onCreateOnlineRoom}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-deck-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg cursor-pointer"
          >
            <Globe className="w-4 h-4" />
            <span>Create New Room</span>
          </button>

          <div className="relative w-full flex items-center justify-center my-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-border" />
            </div>
            <span className="relative px-3 bg-surface-raised text-[10px] uppercase font-mono text-deck-500">
              Or join existing room
            </span>
          </div>

          <form onSubmit={handleJoin} className="w-full flex items-center gap-2">
            <input
              type="text"
              maxLength={6}
              placeholder="6-digit code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.replace(/\D/g, ''))}
              className="flex-1 px-4 py-2.5 rounded-xl border border-surface-border bg-surface-overlay text-white font-mono text-center tracking-widest text-base placeholder:text-deck-600 focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              disabled={joinCode.length !== 6 || isJoining}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-deck-950 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
            >
              <span>{isJoining ? 'Joining...' : 'Join'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
