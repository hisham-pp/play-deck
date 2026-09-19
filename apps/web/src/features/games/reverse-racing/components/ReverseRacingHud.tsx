'use client';

import { BatteryCharging, Flag, Gauge, ShieldAlert, Timer } from 'lucide-react';
import React from 'react';
import { MAX_ENERGY } from '../engine/obstacle-system';
import { TRACK_LENGTH } from '../engine/vehicle-physics';
import type { RacingPlayer, SaboteurState, VehicleState } from '../types/reverse-racing.types';

interface ReverseRacingHudProps {
  localVehicle: VehicleState;
  targetVehicle?: VehicleState | null;
  targetPlayer: RacingPlayer | null;
  attackerPlayer: RacingPlayer | null;
  saboteur: SaboteurState;
  allPlayers?: RacingPlayer[];
  allVehicles: Record<string, VehicleState>;
  elapsedTimeMs: number;
}

export function ReverseRacingHud({
  localVehicle,
  targetPlayer,
  attackerPlayer,
  saboteur,
  allVehicles,
  elapsedTimeMs,
}: ReverseRacingHudProps) {
  const speedKmh = Math.round(localVehicle.speed * 3.6);
  const elapsedSec = (elapsedTimeMs / 1000).toFixed(1);
  const energyPct = Math.round((saboteur.energy / MAX_ENERGY) * 100);

  // Combine all vehicles for minimap progress
  const vehiclesList = [localVehicle, ...Object.values(allVehicles)];

  return (
    <div className="w-full space-y-3">
      {/* Top Bar: Speedometer, Distance Progress, Target & Energy */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* Racer Stats */}
        <div className="flex items-center justify-between rounded-lg border border-sky-500/20 bg-deck-800/80 p-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400">
              <Gauge className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-deck-400">
                Speed
              </div>
              <div className="font-mono text-xl font-bold text-sky-400">{speedKmh} km/h</div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs font-semibold uppercase tracking-wider text-deck-400">
              Distance
            </div>
            <div className="font-mono text-sm font-semibold text-deck-200">
              {Math.round(localVehicle.distance)}m / {TRACK_LENGTH}m
            </div>
          </div>
        </div>

        {/* Race Time & Attacker Warning */}
        <div className="flex items-center justify-between rounded-lg border border-deck-border bg-deck-800/80 p-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
              <Timer className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-deck-400">
                Time
              </div>
              <div className="font-mono text-xl font-bold text-amber-400">{elapsedSec}s</div>
            </div>
          </div>

          {attackerPlayer && (
            <div className="text-right">
              <div className="flex items-center justify-end gap-1 text-xs font-semibold text-rose-400">
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>Sabotaged by</span>
              </div>
              <div className="truncate text-xs font-bold text-deck-200">{attackerPlayer.name}</div>
            </div>
          )}
        </div>

        {/* Saboteur Energy & Target */}
        <div className="flex items-center justify-between rounded-lg border border-amber-500/20 bg-deck-800/80 p-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
              <BatteryCharging className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-deck-400">
                Energy ({energyPct}%)
              </div>
              <div className="mt-1 h-2.5 w-24 overflow-hidden rounded-full bg-deck-700">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-150"
                  style={{ width: `${energyPct}%` }}
                />
              </div>
            </div>
          </div>

          {targetPlayer && (
            <div className="text-right">
              <div className="text-xs font-semibold uppercase tracking-wider text-deck-400">
                Target
              </div>
              <div className="truncate text-xs font-bold text-amber-400">{targetPlayer.name}</div>
            </div>
          )}
        </div>
      </div>

      {/* Track Progress Minimap */}
      <div className="relative h-7 w-full overflow-hidden rounded-lg border border-deck-border bg-deck-900 px-3 py-1">
        <div className="absolute inset-y-0 left-0 flex items-center pl-2 text-xs font-bold text-deck-500">
          START
        </div>
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 text-xs font-bold text-deck-400">
          <Flag className="mr-1 h-3.5 w-3.5 text-amber-400" />
          FINISH
        </div>

        {/* Racer dots on track */}
        {vehiclesList.map((veh) => {
          const pct = Math.min(100, Math.max(0, (veh.distance / TRACK_LENGTH) * 100));
          const isLocal = veh.playerId === localVehicle.playerId;
          return (
            <div
              key={veh.playerId}
              className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-100 ${
                isLocal ? 'z-20 scale-125' : 'z-10'
              }`}
              style={{ left: `${4 + pct * 0.92}%` }}
              title={`${veh.playerName}: ${Math.round(veh.distance)}m`}
            >
              <div
                className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-bold shadow ${
                  isLocal ? 'border-white text-white' : 'border-deck-900 text-deck-200'
                }`}
                style={{ backgroundColor: veh.color }}
              >
                {veh.avatar || '🏎️'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
