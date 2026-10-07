import { ArrowLeft, Car, Map, Play, Trophy, Lock, Check } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { MAPS } from '../engine/maps';
import { VEHICLES } from '../engine/vehicles';
import { OverlayShell, PRIMARY_BTN } from './SummitOverlays';
function VehicleIcon({ id, className }: { id: string; className?: string }) {
  return (
    <img src={`/images/vehicles/${id}-ui.png`} className={className} alt={id} style={{ objectFit: 'contain' }} />
  );
}

function MapIcon({ type, className }: { type: 'meadows' | 'desert' | 'snow' | 'moon'; className?: string }) {
  const colors = {
    meadows: { bg: '#86efac', fg: '#22c55e' },
    desert: { bg: '#fde047', fg: '#eab308' },
    snow: { bg: '#e0f2fe', fg: '#38bdf8' },
    moon: { bg: '#475569', fg: '#94a3b8' },
  };
  const c = colors[type] || colors.meadows;
  
  return (
    <svg viewBox="0 0 100 60" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="60" rx="8" fill={c.bg} opacity="0.3" />
      <path d="M10 50L35 20L55 40L80 15L90 30" stroke={c.fg} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SummitVehicles({
  progress,
  onSelect,
  onUnlock,
  onNext,
  onBack,
}: {
  progress: SummitProgress;
  onSelect: (id: string) => void;
  onUnlock: (id: string, cost: number) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [previewId, setPreviewId] = useState(progress.selectedVehicleId);
  
  // Update preview when selection changes externally
  useEffect(() => {
    setPreviewId(progress.selectedVehicleId);
  }, [progress.selectedVehicleId]);

  const activeVehicle = VEHICLES.find((v) => v.id === previewId) || VEHICLES[0];
  const unlocked = progress.unlockedVehicles.includes(activeVehicle.id);
  const selected = progress.selectedVehicleId === activeVehicle.id;

  return (
    <OverlayShell>
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <button onClick={onBack} className="text-slate-400 hover:text-white transition">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="font-display text-2xl font-black text-white flex items-center gap-2">
          <Car className="h-5 w-5 text-amber-400" /> Garage
        </h2>
        <div className="text-sm font-bold text-amber-400">{progress.coins} Coins</div>
      </div>

      {/* Preview Area */}
      <div className="mt-4 flex flex-col gap-3">
        <div className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-display text-2xl font-black text-white flex items-center gap-3">
                <VehicleIcon id={activeVehicle.id} className="w-12 h-12 drop-shadow-md" />
                {activeVehicle.name}
              </h3>
              <p className="text-sm text-slate-300 mt-1">{activeVehicle.description}</p>
            </div>
          </div>

          <div className="flex gap-4 mt-4">
            <div className="flex flex-col flex-1">
              <span className="text-[10px] uppercase text-slate-500 font-bold">Speed</span>
              <div className="flex items-center gap-1 mt-1">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full ${i < activeVehicle.stats.speed ? 'bg-amber-400' : 'bg-white/10'}`} />
                ))}
              </div>
            </div>
            <div className="flex flex-col flex-1">
              <span className="text-[10px] uppercase text-slate-500 font-bold">Acceleration</span>
              <div className="flex items-center gap-1 mt-1">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full ${i < activeVehicle.stats.acceleration ? 'bg-amber-400' : 'bg-white/10'}`} />
                ))}
              </div>
            </div>
            <div className="flex flex-col flex-1">
              <span className="text-[10px] uppercase text-slate-500 font-bold">Grip</span>
              <div className="flex items-center gap-1 mt-1">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full ${i < activeVehicle.stats.grip ? 'bg-amber-400' : 'bg-white/10'}`} />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4">
            {unlocked ? (
              <button
                className={`w-full py-2.5 rounded-lg text-sm font-bold uppercase transition ${selected ? 'bg-amber-500 text-slate-950' : 'bg-white/10 text-white hover:bg-white/20'}`}
                onClick={() => onSelect(activeVehicle.id)}
              >
                {selected ? 'Equipped' : 'Equip Vehicle'}
              </button>
            ) : (
              <button
                className={`w-full py-2.5 rounded-lg text-sm font-bold uppercase transition flex items-center justify-center gap-2 ${progress.coins >= activeVehicle.unlockCost ? 'bg-amber-500 text-slate-950 hover:bg-amber-400' : 'bg-white/5 text-slate-500 cursor-not-allowed'}`}
                onClick={() => onUnlock(activeVehicle.id, activeVehicle.unlockCost)}
                disabled={progress.coins < activeVehicle.unlockCost}
              >
                <Lock className="h-4 w-4" /> Unlock for {activeVehicle.unlockCost} Coins
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Horizontal Selection List */}
      <div className="mt-4 -mx-1">
        <div className="flex gap-2 overflow-x-auto pb-4 px-1 custom-scrollbar snap-x">
          {VEHICLES.map((v) => {
            const isUnlocked = progress.unlockedVehicles.includes(v.id);
            const isSelected = progress.selectedVehicleId === v.id;
            const isPreviewed = previewId === v.id;

            return (
              <button
                key={v.id}
                onClick={() => setPreviewId(v.id)}
                className={`flex-none w-24 h-24 rounded-xl border p-2 flex flex-col items-center justify-center gap-1 transition snap-center relative ${isPreviewed ? 'border-amber-400 bg-amber-400/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
              >
                <VehicleIcon id={v.id} className="w-10 h-10 mb-1" />
                <span className="text-[10px] font-bold text-center leading-tight truncate w-full">{v.name}</span>
                {isSelected && <Check className="absolute top-1.5 right-1.5 h-3 w-3 text-amber-500" />}
                {!isUnlocked && <Lock className="absolute top-1.5 right-1.5 h-3 w-3 text-slate-500" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-2">
        <button type="button" className={`${PRIMARY_BTN} w-full`} onClick={onNext}>
          Select Location <ArrowLeft className="h-4 w-4 rotate-180" />
        </button>
      </div>
    </OverlayShell>
  );
}

export function SummitMaps({
  progress,
  onSelect,
  onUnlock,
  onStart,
  onBack,
}: {
  progress: SummitProgress;
  onSelect: (id: string) => void;
  onUnlock: (id: string, cost: number) => void;
  onStart: () => void;
  onBack: () => void;
}) {
  const [previewId, setPreviewId] = useState(progress.selectedMapId);
  
  // Update preview when selection changes externally
  useEffect(() => {
    setPreviewId(progress.selectedMapId);
  }, [progress.selectedMapId]);

  const activeMap = MAPS.find((m) => m.id === previewId) || MAPS[0];
  const unlocked = progress.unlockedMaps.includes(activeMap.id);
  const selected = progress.selectedMapId === activeMap.id;

  return (
    <OverlayShell>
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <button onClick={onBack} className="text-slate-400 hover:text-white transition">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="font-display text-2xl font-black text-white flex items-center gap-2">
          <Map className="h-5 w-5 text-amber-400" /> Locations
        </h2>
        <div className="text-sm font-bold text-amber-400">{progress.coins} Coins</div>
      </div>

      {/* Preview Area */}
      <div className="mt-4 flex flex-col gap-3">
        <div className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex justify-between items-start">
            <div className="flex gap-4">
              <MapIcon type={activeMap.id as 'meadows'} className="w-16 h-12" />
              <div>
                <h3 className="font-display text-2xl font-black text-white">
                  {activeMap.name}
                </h3>
                <p className="text-sm text-slate-300 mt-1">{activeMap.description}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <span className="bg-white/10 text-white text-[10px] uppercase font-bold px-2 py-1 rounded">
                {activeMap.environment}
              </span>
            </div>
          </div>

          <div className="mt-2 text-xs text-amber-400 font-bold">
            Difficulty Multiplier: {activeMap.difficultyMultiplier}x
          </div>

          <div className="mt-4">
            {unlocked ? (
              <button
                className={`w-full py-2.5 rounded-lg text-sm font-bold uppercase transition ${selected ? 'bg-amber-500 text-slate-950' : 'bg-white/10 text-white hover:bg-white/20'}`}
                onClick={() => onSelect(activeMap.id)}
              >
                {selected ? 'Equipped' : 'Travel Here'}
              </button>
            ) : (
              <button
                className={`w-full py-2.5 rounded-lg text-sm font-bold uppercase transition flex items-center justify-center gap-2 ${progress.coins >= activeMap.unlockCost ? 'bg-amber-500 text-slate-950 hover:bg-amber-400' : 'bg-white/5 text-slate-500 cursor-not-allowed'}`}
                onClick={() => onUnlock(activeMap.id, activeMap.unlockCost)}
                disabled={progress.coins < activeMap.unlockCost}
              >
                <Lock className="h-4 w-4" /> Unlock for {activeMap.unlockCost} Coins
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Horizontal Selection List */}
      <div className="mt-4 -mx-1">
        <div className="flex gap-2 overflow-x-auto pb-4 px-1 custom-scrollbar snap-x">
          {MAPS.map((m) => {
            const isUnlocked = progress.unlockedMaps.includes(m.id);
            const isSelected = progress.selectedMapId === m.id;
            const isPreviewed = previewId === m.id;

            return (
              <button
                key={m.id}
                onClick={() => setPreviewId(m.id)}
                className={`flex-none w-28 h-24 rounded-xl border p-2 flex flex-col items-center justify-center gap-1 transition snap-center relative ${isPreviewed ? 'border-amber-400 bg-amber-400/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
              >
                <MapIcon type={m.id as 'meadows'} className="w-12 h-8 opacity-80" />
                <span className="text-xs font-bold text-center leading-tight truncate w-full mt-1">{m.name}</span>
                <span className="text-[10px] text-slate-400 uppercase">{m.environment}</span>
                {isSelected && <Check className="absolute top-1.5 right-1.5 h-3 w-3 text-amber-500" />}
                {!isUnlocked && <Lock className="absolute top-1.5 right-1.5 h-3 w-3 text-slate-500" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-2">
        <button type="button" className={`${PRIMARY_BTN} w-full`} onClick={onStart}>
          <Play className="h-4 w-4" /> Start Run
        </button>
      </div>
    </OverlayShell>
  );
}

export function SummitLeaderboard({
  mapId,
  onBack,
}: {
  mapId: string;
  onBack: () => void;
}) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    summitLeaderboardRepository.getEntries(mapId).then((data) => {
      setEntries(data);
      setLoading(false);
    });
  }, [mapId]);
  
  const mapDef = MAPS.find(m => m.id === mapId) || MAPS[0];

  return (
    <OverlayShell>
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <button onClick={onBack} className="text-slate-400 hover:text-white transition">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="font-display text-2xl font-black text-white flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-400" /> Leaderboard
        </h2>
        <div className="w-5" />
      </div>
      
      <div className="mt-4 text-center">
        <span className="text-sm font-bold text-slate-300 bg-white/5 px-3 py-1 rounded-full">
          {mapDef.name}
        </span>
      </div>
      
      <div className="mt-6 flex flex-col gap-2 max-h-[50vh] overflow-y-auto pr-1 custom-scrollbar">
        {loading ? (
          <div className="text-center text-slate-400 py-8 text-sm">Loading scores...</div>
        ) : entries.length === 0 ? (
          <div className="text-center text-slate-400 py-8 text-sm">No runs recorded yet. Be the first!</div>
        ) : (
          entries.map((entry, idx) => (
            <div key={entry.id} className="flex items-center justify-between rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
              <div className="flex items-center gap-3">
                <span className="font-display text-lg font-black text-slate-500 w-6 text-right">
                  #{idx + 1}
                </span>
                <span className="font-bold text-white">{entry.playerName}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-mono font-black text-amber-400">{entry.score.toLocaleString()}</span>
                <span className="text-[10px] uppercase tracking-wider text-slate-400">{entry.distance}m</span>
              </div>
            </div>
          ))
        )}
      </div>
    </OverlayShell>
  );
}
