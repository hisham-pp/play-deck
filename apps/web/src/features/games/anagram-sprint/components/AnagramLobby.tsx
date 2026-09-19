'use client';

import { Play, Users } from 'lucide-react';
import React, { useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@playdeck/ui';
import {
  DEFAULT_RULES,
  MAX_SEATS,
  MIN_SEATS,
  MODE_BLITZ,
  MODE_SOLO,
  MODE_SURVIVAL,
  roundsForMode,
} from '../engine/anagram-constants';
import type { AnagramMode, AnagramRules } from '../types/anagram-sprint.types';
import { AnagramRulesPicker } from './AnagramRulesPicker';

export interface AnagramLobbyProps {
  onStartSolo: (rules: AnagramRules) => void;
  onOpenRoom: () => void;
}

/** Solo formats. Team needs two sides, and classic needs a field to race. */
const SOLO_MODES: AnagramMode[] = [MODE_SOLO, MODE_SURVIVAL, MODE_BLITZ];

export function AnagramLobby({ onStartSolo, onOpenRoom }: AnagramLobbyProps) {
  const [rules, setRules] = useState<AnagramRules>({
    ...DEFAULT_RULES,
    totalRounds: roundsForMode(MODE_SOLO),
  });

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      <Card className="border-amber-500/20">
        <CardHeader>
          <CardTitle className="font-display text-xl font-black text-deck-950 dark:text-white">
            🔤 Anagram Sprint
          </CardTitle>
          <p className="mt-1 text-xs text-deck-500">
            Unscramble the word before anyone else. Fastest correct answer scores most.
          </p>
        </CardHeader>

        <CardContent className="space-y-5">
          <AnagramRulesPicker rules={rules} modes={SOLO_MODES} onChange={setRules} />

          <div className="flex flex-wrap items-center gap-2 border-t border-surface-border pt-4">
            <Button variant="arcade" size="lg" onClick={() => onStartSolo(rules)}>
              <Play className="mr-1.5 h-4 w-4" /> Play solo
            </Button>
            <Button variant="outline" size="lg" onClick={onOpenRoom}>
              <Users className="mr-1.5 h-4 w-4" /> Race friends online
            </Button>
          </div>

          <p className="text-[11px] text-deck-500">
            Online rooms seat {MIN_SEATS}–{MAX_SEATS} players with voice chat. Everyone gets the
            same letters at the same moment.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
