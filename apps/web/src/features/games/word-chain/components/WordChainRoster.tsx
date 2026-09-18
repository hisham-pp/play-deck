'use client';

import { Plus, Users, X } from 'lucide-react';
import React from 'react';
import { Button, IconButton, Input } from '@playdeck/ui';
import { cn } from '@/lib/utils';
import {
  MAX_PLAYERS,
  MIN_PLAYERS,
  MODE_SOLO,
  MODE_TEAM,
  TEAM_A,
  TEAM_B,
} from '../engine/word-chain-constants';
import { TEAM_LABELS } from '../engine/word-chain-state';
import type { WordChainMode, WordChainSetupPlayer, WordChainTeam } from '../types/word-chain.types';

export interface WordChainRosterProps {
  mode: WordChainMode;
  players: WordChainSetupPlayer[];
  onChange: (players: WordChainSetupPlayer[]) => void;
}

const TEAM_CHIP =
  'px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors';

function TeamToggle({
  team,
  onSelect,
}: {
  team: WordChainTeam;
  onSelect: (team: WordChainTeam) => void;
}) {
  return (
    <div className="flex gap-1" role="group" aria-label="Team">
      {([TEAM_A, TEAM_B] as const).map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={team === option}
          onClick={() => onSelect(option)}
          className={cn(
            TEAM_CHIP,
            team === option
              ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/50'
              : 'border border-surface-border text-deck-500 hover:text-deck-800 dark:hover:text-deck-200',
          )}
        >
          {TEAM_LABELS[option].replace('Team ', '')}
        </button>
      ))}
    </div>
  );
}

/** Solo mode plays with exactly one seat, so the roster collapses to a single name. */
export function WordChainRoster({ mode, players, onChange }: WordChainRosterProps) {
  const isSolo = mode === MODE_SOLO;
  const isTeam = mode === MODE_TEAM;
  const visible = isSolo ? players.slice(0, 1) : players;

  const rename = (index: number, name: string) => {
    onChange(players.map((player, i) => (i === index ? { ...player, name } : player)));
  };

  const setTeam = (index: number, team: WordChainTeam) => {
    onChange(players.map((player, i) => (i === index ? { ...player, team } : player)));
  };

  const addPlayer = () => {
    const team =
      players.filter((p) => p.team === TEAM_A).length > players.length / 2 ? TEAM_B : TEAM_A;
    onChange([...players, { name: `Player ${players.length + 1}`, team }]);
  };

  const removePlayer = (index: number) => onChange(players.filter((_, i) => i !== index));

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-deck-500 font-display">
          {isSolo ? 'Player' : 'Players'}
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-deck-500">
          <Users className="w-3.5 h-3.5" />
          {visible.length}
          {!isSolo && ` / ${MAX_PLAYERS}`}
        </span>
      </div>

      <ul className="flex flex-col gap-2">
        {visible.map((player, index) => (
          <li key={index} className="flex items-center gap-2">
            <Input
              value={player.name}
              maxLength={16}
              aria-label={`Name for player ${index + 1}`}
              onChange={(event) => rename(index, event.target.value)}
            />
            {isTeam && <TeamToggle team={player.team} onSelect={(team) => setTeam(index, team)} />}
            {!isSolo && visible.length > MIN_PLAYERS && (
              <IconButton
                variant="ghost"
                size="sm"
                aria-label={`Remove ${player.name || `player ${index + 1}`}`}
                onClick={() => removePlayer(index)}
              >
                <X className="w-4 h-4" />
              </IconButton>
            )}
          </li>
        ))}
      </ul>

      {!isSolo && visible.length < MAX_PLAYERS && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addPlayer}
          className="self-start"
        >
          <Plus className="w-4 h-4" />
          Add player
        </Button>
      )}
    </div>
  );
}
