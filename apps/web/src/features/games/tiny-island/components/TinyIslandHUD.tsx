'use client';

import { Hammer, Hand, Move, Pickaxe, Shield, Sparkles, Sword, Users, Wind } from 'lucide-react';
import React from 'react';
import { Badge, Button, Card } from '@playdeck/ui';
import { CRAFTING_RECIPES, type IslandGameState } from '../engine/tiny-island-types';
import type { CanvasInteractionMode } from './TinyIslandCanvas';

interface TinyIslandHUDProps {
  gameState: IslandGameState;
  localSeatIndex: number | null;
  interactionMode: CanvasInteractionMode;
  setInteractionMode: (mode: CanvasInteractionMode) => void;
  onGather: () => void;
  onCraftRaft: () => void;
  onCraftSpear: () => void;
  onPass: () => void;
}

export function TinyIslandHUD({
  gameState,
  localSeatIndex,
  interactionMode,
  setInteractionMode,
  onGather,
  onCraftRaft,
  onCraftSpear,
  onPass,
}: TinyIslandHUDProps) {
  const activePlayer = gameState.players.find(
    (p) => p.seatIndex === gameState.currentTurnSeatIndex,
  );
  const isLocalTurn =
    activePlayer &&
    (localSeatIndex === null || activePlayer.seatIndex === localSeatIndex) &&
    !activePlayer.isBot;

  const currentTile = activePlayer ? gameState.tiles[activePlayer.y][activePlayer.x] : null;

  const canBuildBridge =
    activePlayer && activePlayer.inventory.wood >= CRAFTING_RECIPES.bridge.wood;
  const canBuildBarrier =
    activePlayer && activePlayer.inventory.stone >= CRAFTING_RECIPES.barrier.stone;
  const canCraftRaft =
    activePlayer &&
    !activePlayer.tools.hasRaft &&
    activePlayer.inventory.wood >= CRAFTING_RECIPES.raft.wood &&
    activePlayer.inventory.food >= CRAFTING_RECIPES.raft.food;
  const canCraftSpear =
    activePlayer &&
    !activePlayer.tools.hasSpear &&
    activePlayer.inventory.wood >= CRAFTING_RECIPES.spear.wood &&
    activePlayer.inventory.stone >= CRAFTING_RECIPES.spear.stone;

  const livingPlayers = gameState.players.filter((p) => p.isAlive);

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Top Status Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 rounded-xl border border-surface-border bg-surface-raised">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold text-amber-400 text-sm">
            <span>Round {gameState.round}</span>
            <span className="text-deck-500">•</span>
            <span className="capitalize font-semibold text-xs tracking-wide">
              {gameState.mood.replace('_', ' ')}
            </span>
          </div>

          <Badge variant="outline" className="text-xs">
            <Users className="w-3 h-3 mr-1" />
            {livingPlayers.length}/{gameState.players.length} Survivors
          </Badge>
        </div>

        {activePlayer && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-deck-400">Turn:</span>
            <span
              className="px-2 py-0.5 rounded-full text-xs font-bold text-white flex items-center gap-1.5 shadow-sm"
              style={{ backgroundColor: activePlayer.color }}
            >
              <span>{activePlayer.avatar}</span>
              <span>{activePlayer.displayName}</span>
            </span>

            {/* Action Points Pips */}
            <div className="flex items-center gap-1 ml-2">
              {Array.from({ length: gameState.maxAp }).map((_, idx) => (
                <span
                  key={idx}
                  className={`w-3 h-3 rounded-full transition-all ${
                    idx < activePlayer.ap
                      ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)] scale-110'
                      : 'bg-surface-border opacity-40'
                  }`}
                  title={`${activePlayer.ap} AP remaining`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Active Player Action Controls (Available only when it's player's turn) */}
      {isLocalTurn && activePlayer && (
        <Card className="border-amber-500/30 bg-surface-overlay/80 backdrop-blur-sm">
          <div className="p-3 flex flex-wrap items-center justify-between gap-3">
            {/* Inventory Quick Glance */}
            <div className="flex items-center gap-3 text-xs font-medium text-deck-300">
              <span className="text-deck-400">Inventory:</span>
              <span className="inline-flex items-center gap-1">
                🪵 {activePlayer.inventory.wood}
              </span>
              <span className="inline-flex items-center gap-1">
                🪨 {activePlayer.inventory.stone}
              </span>
              <span className="inline-flex items-center gap-1">
                🥥 {activePlayer.inventory.food}
              </span>
              {activePlayer.tools.hasRaft && (
                <span className="text-sky-400 font-bold">⛵ Raft Ready</span>
              )}
              {activePlayer.tools.hasSpear && (
                <span className="text-rose-400 font-bold">🗡️ Spear Ready</span>
              )}
            </div>

            {/* Tactical Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant={interactionMode === 'move' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setInteractionMode(interactionMode === 'move' ? 'select' : 'move')}
                className="gap-1 text-xs"
              >
                <Move className="w-3.5 h-3.5" />
                <span>Move (1 AP)</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={onGather}
                className="gap-1 text-xs hover:border-emerald-500/50 hover:text-emerald-400"
              >
                <Pickaxe className="w-3.5 h-3.5" />
                <span>
                  Gather {currentTile?.resource ? `(${currentTile.resource})` : '(Scavenge)'}
                </span>
              </Button>

              <Button
                variant={interactionMode === 'build_bridge' ? 'primary' : 'outline'}
                size="sm"
                disabled={!canBuildBridge}
                onClick={() =>
                  setInteractionMode(interactionMode === 'build_bridge' ? 'select' : 'build_bridge')
                }
                className="gap-1 text-xs"
                title="Build bridge on adjacent water (Costs 2 Wood)"
              >
                <Hammer className="w-3.5 h-3.5" />
                <span>Bridge (2🪵)</span>
              </Button>

              <Button
                variant={interactionMode === 'build_barrier' ? 'primary' : 'outline'}
                size="sm"
                disabled={!canBuildBarrier}
                onClick={() =>
                  setInteractionMode(
                    interactionMode === 'build_barrier' ? 'select' : 'build_barrier',
                  )
                }
                className="gap-1 text-xs"
                title="Erect stone wall on adjacent tile (Costs 2 Stone)"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Barrier (2🪨)</span>
              </Button>

              {canCraftRaft && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCraftRaft}
                  className="gap-1 text-xs text-sky-300 border-sky-500/40"
                  title="Emergency Raft protects you once from sinking or drowning"
                >
                  <Wind className="w-3.5 h-3.5" />
                  <span>Raft (2🪵 1🥥)</span>
                </Button>
              )}

              {canCraftSpear && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCraftSpear}
                  className="gap-1 text-xs text-rose-300 border-rose-500/40"
                  title="Spear extends push distance to 2 tiles"
                >
                  <Sword className="w-3.5 h-3.5" />
                  <span>Spear (1🪵 1🪨)</span>
                </Button>
              )}

              <Button
                variant={interactionMode === 'push' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setInteractionMode(interactionMode === 'push' ? 'select' : 'push')}
                className="gap-1 text-xs hover:border-rose-500/50 hover:text-rose-400"
              >
                <Hand className="w-3.5 h-3.5" />
                <span>Push Opponent</span>
              </Button>

              <Button
                variant={interactionMode === 'steal' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setInteractionMode(interactionMode === 'steal' ? 'select' : 'steal')}
                className="gap-1 text-xs hover:border-purple-500/50 hover:text-purple-400"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Steal</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={onPass}
                className="text-xs text-deck-400 hover:text-white"
              >
                Pass / End Turn
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Opponent Thinking Notice */}
      {!isLocalTurn && activePlayer && (
        <div className="flex items-center justify-center gap-2 p-2.5 rounded-lg border border-surface-border bg-surface-raised text-xs text-deck-400">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span>
            {activePlayer.displayName} ({activePlayer.avatar}) is planning their survival moves...
          </span>
        </div>
      )}

      {/* Survivor Roster Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
        {gameState.players.map((p) => {
          const isTurn = p.seatIndex === gameState.currentTurnSeatIndex && p.isAlive;
          return (
            <div
              key={p.id}
              className={`p-2 rounded-lg border transition-all text-xs flex flex-col gap-1 ${
                !p.isAlive
                  ? 'border-surface-border bg-surface-sunken/40 opacity-40'
                  : isTurn
                    ? 'border-amber-500 bg-surface-raised shadow-md'
                    : 'border-surface-border bg-surface-raised'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="text-base">{p.avatar}</span>
                  <span className="font-semibold text-deck-200 truncate">{p.displayName}</span>
                </div>
                {p.isBot && (
                  <span className="text-[10px] uppercase font-mono px-1 rounded bg-surface-sunken text-deck-500">
                    BOT
                  </span>
                )}
              </div>

              {p.isAlive ? (
                <div className="flex items-center justify-between text-[11px] text-deck-400 mt-1 font-mono">
                  <span>🪵 {p.inventory.wood}</span>
                  <span>🪨 {p.inventory.stone}</span>
                  <span>🥥 {p.inventory.food}</span>
                </div>
              ) : (
                <span className="text-[11px] text-rose-400 font-medium">
                  {p.eliminatedCause === 'pushed' ? 'Pushed overboard' : 'Drowned'}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Mini Event Log */}
      {gameState.eventLogs.length > 0 && (
        <div className="p-2.5 rounded-xl border border-surface-border bg-surface-sunken/60 text-xs font-mono max-h-24 overflow-y-auto space-y-1">
          {gameState.eventLogs.slice(0, 4).map((log) => (
            <div
              key={log.id}
              className={`text-xs ${
                log.type === 'elimination'
                  ? 'text-rose-400 font-bold'
                  : log.type === 'shrink'
                    ? 'text-amber-400'
                    : 'text-deck-400'
              }`}
            >
              <span className="text-deck-600 mr-2">[R{log.round}]</span>
              {log.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
