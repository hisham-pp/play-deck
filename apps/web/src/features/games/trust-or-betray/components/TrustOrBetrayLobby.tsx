'use client';

import React, { useState } from 'react';

import type { BotArchetype, TrustOrBetrayCareerStats } from '../types/trust-or-betray.types';

export interface TrustOrBetrayLobbyProps {
  careerStats: TrustOrBetrayCareerStats | null;
  onStartSolo: (params: { botCount: number; roundCount: number }) => void;
  onCreateRoom: () => void;
  onJoinRoom: (code: string) => void;
}

const ARCHETYPES_INFO: Array<{
  id: BotArchetype;
  name: string;
  icon: string;
  desc: string;
  color: string;
}> = [
  {
    id: 'saint',
    name: 'The Saint',
    icon: '🕊️',
    desc: 'Devoted to the group. Cooperates persistently unless pushed past breaking point.',
    color: 'text-sky-400 border-sky-500/30 bg-sky-950/20',
  },
  {
    id: 'opportunist',
    name: 'The Opportunist',
    icon: '🪙',
    desc: 'Calculates expected value. Cooperates during small pots, strikes when rewards peak.',
    color: 'text-amber-400 border-amber-500/30 bg-amber-950/20',
  },
  {
    id: 'grudgebearer',
    name: 'The Grudgebearer',
    icon: '⚖️',
    desc: 'Enforces strict tit-for-tat retaliation. Never forgets a broken alliance.',
    color: 'text-rose-400 border-rose-500/30 bg-rose-950/20',
  },
  {
    id: 'wildcard',
    name: 'The Wildcard',
    icon: '🎭',
    desc: 'Unpredictable and deceptive. Bluffs constantly in chat and sows paranoia.',
    color: 'text-purple-400 border-purple-500/30 bg-purple-950/20',
  },
];

export function TrustOrBetrayLobby({
  careerStats,
  onStartSolo,
  onCreateRoom,
  onJoinRoom,
}: TrustOrBetrayLobbyProps) {
  const [botCount, setBotCount] = useState(3);
  const [roundCount, setRoundCount] = useState(5);
  const [joinCode, setJoinCode] = useState('');

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    onJoinRoom(joinCode.trim().toUpperCase());
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 text-slate-100">
      {/* Hero Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="max-w-xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-black uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Social Dilemma & Strategy
            </span>
            <span className="text-xs font-mono text-slate-400">3–8 Players</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-100 tracking-tight">
            Trust or Betray
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
            Cooperate to build a shared reward pool, or betray your comrades to steal the entire
            pot. Beware: if two or more operatives betray, the mission implodes and nobody receives
            points!
          </p>
        </div>

        {/* Career Record Badge */}
        {careerStats && (
          <div className="grid grid-cols-2 gap-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 min-w-[240px]">
            <div>
              <div className="text-[10px] font-mono text-slate-500 uppercase font-bold">
                Matches Won
              </div>
              <div className="text-xl font-black text-amber-400">{careerStats.matchesWon}</div>
            </div>
            <div>
              <div className="text-[10px] font-mono text-slate-500 uppercase font-bold">
                High Score
              </div>
              <div className="text-xl font-black text-emerald-400">{careerStats.highScore}</div>
            </div>
            <div>
              <div className="text-[10px] font-mono text-slate-500 uppercase font-bold">
                Solo Heists
              </div>
              <div className="text-xl font-black text-rose-400">{careerStats.soloSabotages}</div>
            </div>
            <div>
              <div className="text-[10px] font-mono text-slate-500 uppercase font-bold">
                Alliances
              </div>
              <div className="text-xl font-black text-sky-400">
                {careerStats.successfulAlliances}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Solo Setup vs Multiplayer Gateway */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Solo Infiltration Setup */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-6">
          <div>
            <h2 className="text-lg font-black text-slate-100 flex items-center gap-2">
              <span>🤖</span>
              <span>Solo Operation (vs AI Archetypes)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Hone your deception and negotiation against distinct tactical bots.
            </p>
          </div>

          {/* Settings Sliders / Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-300 flex justify-between">
                <span>Operatives</span>
                <span className="text-amber-400 font-mono">
                  {botCount + 1} Players ({botCount} Bots)
                </span>
              </label>
              <div className="flex items-center gap-2 mt-1">
                {[2, 3, 5, 7].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setBotCount(num)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      botCount === num
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                    }`}
                  >
                    {num + 1}P
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-300 flex justify-between">
                <span>Rounds</span>
                <span className="text-amber-400 font-mono">{roundCount} Rounds</span>
              </label>
              <div className="flex items-center gap-2 mt-1">
                {[3, 5, 7].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setRoundCount(count)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      roundCount === count
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Archetype Dossier Preview */}
          <div className="flex flex-col gap-2">
            <div className="text-xs uppercase font-mono tracking-wider text-slate-400 font-bold">
              Autonomous Bot Dossiers
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ARCHETYPES_INFO.map((arch) => (
                <div key={arch.id} className={`p-3.5 rounded-2xl border ${arch.color}`}>
                  <div className="flex items-center gap-2 font-black text-sm">
                    <span>{arch.icon}</span>
                    <span>{arch.name}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 leading-snug">{arch.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onStartSolo({ botCount, roundCount })}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xl shadow-amber-950/50"
          >
            Launch Solo Operation
          </button>
        </div>

        {/* Right Col: Online Multiplayer */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between gap-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-100 flex items-center gap-2">
                <span>🌐</span>
                <span>Online Multiplayer</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Play in private rooms with real-time WebRTC voice chat & bluffing.
              </p>
            </div>

            <button
              type="button"
              onClick={onCreateRoom}
              className="w-full py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-cyan-950/40"
            >
              Host Secret Room
            </button>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-800" />
              <span className="flex-shrink mx-3 text-[10px] uppercase font-mono text-slate-500">
                Or Join Room
              </span>
              <div className="flex-grow border-t border-slate-800" />
            </div>

            <form onSubmit={handleJoinSubmit} className="flex flex-col gap-2">
              <input
                type="text"
                maxLength={6}
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="ENTER 6-DIGIT CODE"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center font-mono font-black text-sm tracking-widest text-amber-300 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                disabled={joinCode.length < 4}
                className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  joinCode.length >= 4
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700'
                    : 'bg-slate-900 text-slate-600 cursor-not-allowed border border-slate-850'
                }`}
              >
                Join Room
              </button>
            </form>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/60 text-[11px] text-slate-400 leading-relaxed">
            🎙️ <strong>Voice Chat Enabled:</strong> Built-in WebRTC audio lets you negotiate and
            accuse across the room.
          </div>
        </div>
      </div>
    </div>
  );
}
