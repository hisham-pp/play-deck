'use client';

import { HelpCircle, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import React, { useState } from 'react';
import { Button, Modal } from '@playdeck/ui';
import { SharedBrainSoundService } from '../services/shared-brain-sound.service';

interface SharedBrainToolbarProps {
  runStatus: 'idle' | 'running' | 'completed' | 'failed';
  onStart: () => void;
  onReset: () => void;
  onLeaveOrLobby?: () => void;
}

export function SharedBrainToolbar({
  runStatus,
  onStart,
  onReset,
  onLeaveOrLobby,
}: SharedBrainToolbarProps) {
  const [muted, setMuted] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const toggleSound = () => {
    const next = !muted;
    setMuted(next);
    SharedBrainSoundService.setMuted(next);
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-deck-border bg-deck-900/60 p-2.5">
        <div className="flex items-center gap-2">
          {runStatus !== 'running' ? (
            <Button variant="arcade" size="sm" onClick={onStart}>
              <Play className="mr-1.5 h-4 w-4" /> Start Run
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={onReset}>
              <RotateCcw className="mr-1.5 h-4 w-4" /> Restart
            </Button>
          )}

          {onLeaveOrLobby && (
            <Button variant="ghost" size="sm" onClick={onLeaveOrLobby}>
              Lobby
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={toggleSound} title="Toggle Audio">
            {muted ? (
              <VolumeX className="h-4 w-4 text-rose-400" />
            ) : (
              <Volume2 className="h-4 w-4 text-emerald-400" />
            )}
          </Button>

          <Button variant="ghost" size="sm" onClick={() => setShowHelp(true)} title="Game Controls">
            <HelpCircle className="h-4 w-4 text-deck-400" />
          </Button>
        </div>
      </div>

      <Modal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        title="How to Play: Shared Brain"
        size="md"
      >
        <div className="space-y-4 text-sm text-deck-200">
          <p>
            Two minds share one avatar. Victory requires synchronized coordination across the neural
            gap!
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-sky-500/20 bg-sky-500/5 p-3">
              <div className="font-bold text-sky-400">🧭 Navigator Controls</div>
              <ul className="mt-1 space-y-1 text-xs text-deck-300">
                <li>
                  • <strong>A / Left Arrow:</strong> Run Left
                </li>
                <li>
                  • <strong>D / Right Arrow:</strong> Run Right
                </li>
                <li>• Controls horizontal steering & momentum!</li>
              </ul>
            </div>

            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
              <div className="font-bold text-amber-400">🕹️ Motor Controls</div>
              <ul className="mt-1 space-y-1 text-xs text-deck-300">
                <li>
                  • <strong>Space / W / Up:</strong> Jump
                </li>
                <li>
                  • <strong>E / S / Down:</strong> Pull Levers & Switches
                </li>
                <li>• Controls jump height, timing & mechanism interactions!</li>
              </ul>
            </div>
          </div>

          <div className="rounded-lg border border-deck-border bg-deck-800/60 p-3 text-xs text-deck-400">
            <strong className="text-deck-200">Tip:</strong> In Solo mode, you can control both
            hemispheres simultaneously, or partner up with our adaptive AI Buddy Bot!
          </div>
        </div>
      </Modal>
    </>
  );
}
