'use client';

import React, { useState } from 'react';

import type { SaboteurCareerStats } from '../types/secret-saboteur.types';

export interface SecretSaboteurLobbyProps {
  careerStats: SaboteurCareerStats | null;
  onStartSolo: (params: { botCount: number; roundCount: number }) => void;
  onCreateRoom: () => void;
  onJoinRoom: (code: string) => void;
}

const BOT_ARCHETYPES = [
  {
    id: 'loyal-specialist',
    name: 'Loyal Specialist',
    icon: '🛡️',
    desc: 'Dedicated worker. Always contributes the highest positive card to maximize reactor output.',
    color: 'text-sky-400 border-sky-500/30 bg-sky-950/20',
  },
  {
    id: 'methodical-auditor',
    name: 'Methodical Auditor',
    icon: '📊',
    desc: 'Analytical and deliberate. Accuses based on statistics and escalates toward final rounds.',
    color: 'text-amber-400 border-amber-500/30 bg-amber-950/20',
  },
  {
    id: 'erratic-tinkerer',
    name: 'Erratic Tinkerer',
    icon: '🔩',
    desc: 'Unpredictable worker. Randomly switches between best and worst positive cards.',
    color: 'text-purple-400 border-purple-500/30 bg-purple-950/20',
  },
  {
    id: 'cunning-infiltrator',
    name: 'Cunning Infiltrator',
    icon: '🕵️',
    desc: 'The hidden saboteur archetype. Blends in early, strikes catastrophically when it matters.',
    color: 'text-rose-400 border-rose-500/30 bg-rose-950/20',
  },
];

export function SecretSaboteurLobby({
  careerStats,
  onStartSolo,
  onCreateRoom,
  onJoinRoom,
}: SecretSaboteurLobbyProps) {
  const [botCount, setBotCount] = useState(4);
  const [roundCount, setRoundCount] = useState(6);
  const [joinCode, setJoinCode] = useState('');

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 text-slate-100">
      {/* Hero */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="max-w-xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-black uppercase bg-red-500/20 text-red-400 border border-red-500/30">
              ☢️ Hidden Role · Reactor Deduction
            </span>
            <span className="text-xs font-mono text-slate-400">4–8 Players</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-100 tracking-tight">
            Secret Saboteur
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
            Build the Reactor Core to 100% or trigger 3 critical meltdowns as the hidden Saboteur.
            Anonymous card contributions, accusation trials, and real-time voice chat.
          </p>
        </div>

        {careerStats && careerStats.matchesPlayed > 0 && (
          <div className="grid grid-cols-2 gap-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 min-w-[220px]">
            <div>
              <div className="text-[10px] font-mono text-slate-500 uppercase font-bold">
                Missions
              </div>
              <div className="text-xl font-black text-amber-400">{careerStats.matchesPlayed}</div>
            </div>
            <div>
              <div className="text-[10px] font-mono text-slate-500 uppercase font-bold">
                Victories
              </div>
              <div className="text-xl font-black text-emerald-400">{careerStats.matchesWon}</div>
            </div>
            <div>
              <div className="text-[10px] font-mono text-slate-500 uppercase font-bold">
                Reactor Saves
              </div>
              <div className="text-xl font-black text-sky-400">
                {careerStats.reactorCompletions}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-mono text-slate-500 uppercase font-bold">Caught</div>
              <div className="text-xl font-black text-rose-400">{careerStats.saboteursExposed}</div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Solo Configuration */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4">
          <h2 className="font-bold text-lg text-slate-100 flex items-center gap-2">
            🤖 Solo Mission
          </h2>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-mono text-slate-400">
              Operatives: <span className="text-amber-400 font-bold">{botCount + 1}</span>
            </label>
            <input
              id="bot-count-slider"
              type="range"
              min={3}
              max={7}
              value={botCount}
              onChange={(e) => setBotCount(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>4 players</span>
              <span>8 players</span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-mono text-slate-400">
              Rounds: <span className="text-amber-400 font-bold">{roundCount}</span>
            </label>
            <input
              id="round-count-slider"
              type="range"
              min={4}
              max={10}
              value={roundCount}
              onChange={(e) => setRoundCount(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>4 rounds</span>
              <span>10 rounds</span>
            </div>
          </div>

          <button
            id="start-solo-btn"
            onClick={() => onStartSolo({ botCount, roundCount })}
            className="mt-auto w-full py-3 rounded-xl font-bold text-sm bg-amber-500 hover:bg-amber-400 text-slate-900 transition-all shadow-lg shadow-amber-500/20"
          >
            ⚡ Launch Solo Mission
          </button>
        </div>

        {/* Online Room */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4">
          <h2 className="font-bold text-lg text-slate-100 flex items-center gap-2">
            🌐 Online Room
          </h2>

          <button
            id="create-room-btn"
            onClick={onCreateRoom}
            className="w-full py-3 rounded-xl font-bold text-sm border border-sky-500/40 text-sky-400 hover:bg-sky-500/10 transition-all"
          >
            ✦ Create Room
          </button>

          <div className="flex items-center gap-2 text-slate-600 text-xs">
            <div className="flex-1 h-px bg-slate-800" />
            or join existing
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          <div className="flex gap-2">
            <input
              id="join-code-input"
              type="text"
              placeholder="ROOM CODE"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
              className="flex-1 bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/60"
              maxLength={6}
            />
            <button
              id="join-room-btn"
              onClick={() => joinCode.length >= 4 && onJoinRoom(joinCode)}
              disabled={joinCode.length < 4}
              className="px-4 py-2 rounded-xl bg-amber-500 text-slate-900 font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-amber-400 transition-all"
            >
              Join
            </button>
          </div>

          <p className="text-xs text-slate-500 mt-auto">
            🎙️ Voice chat activates automatically in online rooms.
          </p>
        </div>
      </div>

      {/* Bot Archetypes */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">
          Operative Archetypes
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {BOT_ARCHETYPES.map((arch) => (
            <div
              key={arch.id}
              className={`flex items-start gap-3 border rounded-xl p-3 text-sm ${arch.color}`}
            >
              <span className="text-2xl leading-none mt-0.5">{arch.icon}</span>
              <div>
                <div className="font-bold text-xs">{arch.name}</div>
                <div className="text-xs opacity-80 mt-0.5">{arch.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
