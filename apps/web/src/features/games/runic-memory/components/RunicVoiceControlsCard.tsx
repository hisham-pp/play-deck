'use client';

import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import React, { useState } from 'react';
import { runicSpeech } from '../services/runic-speech.service';

interface RunicVoiceControlsCardProps {
  isVoiceCommandsSupported: boolean;
  isListening: boolean;
  lastCommand: string | null;
  onToggleVoiceCommands: () => void;
}

export function RunicVoiceControlsCard({
  isVoiceCommandsSupported,
  isListening,
  lastCommand,
  onToggleVoiceCommands,
}: RunicVoiceControlsCardProps) {
  const [announcerOn, setAnnouncerOn] = useState(() => runicSpeech.isAnnouncerEnabled());

  const handleToggleAnnouncer = () => {
    const next = !announcerOn;
    runicSpeech.setAnnouncerEnabled(next);
    setAnnouncerOn(next);
  };

  return (
    <div className="p-4 rounded-xl bg-surface-overlay border border-surface-border flex flex-col gap-3">
      <div className="flex items-center justify-between pb-2 border-b border-surface-border/60">
        <div className="flex items-center gap-2">
          <Mic className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-deck-300">
            Voice & Audio Controls
          </span>
        </div>
        {isListening && (
          <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold animate-pulse">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Listening
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {/* Announcer Chant Toggle */}
        <button
          type="button"
          onClick={handleToggleAnnouncer}
          className={`flex items-center justify-between p-2.5 rounded-lg border text-xs transition-colors ${
            announcerOn
              ? 'bg-purple-950/30 border-purple-500/40 text-purple-300'
              : 'bg-surface-base border-surface-border text-deck-400 hover:text-deck-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {announcerOn ? (
              <Volume2 className="w-4 h-4 text-purple-400" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
            <div className="flex flex-col text-left">
              <span className="font-semibold">Rune Chant Whisperer</span>
              <span className="text-[10px] text-deck-500">
                Speaks rune names and sacred lore upon flip
              </span>
            </div>
          </div>
          <span className="font-mono text-[10px] font-bold uppercase">
            {announcerOn ? 'ON' : 'OFF'}
          </span>
        </button>

        {/* Hands-Free Voice Commands */}
        {isVoiceCommandsSupported ? (
          <button
            type="button"
            onClick={onToggleVoiceCommands}
            className={`flex items-center justify-between p-2.5 rounded-lg border text-xs transition-colors ${
              isListening
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300 shadow-sm shadow-emerald-500/10'
                : 'bg-surface-base border-surface-border text-deck-400 hover:text-deck-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {isListening ? (
                <Mic className="w-4 h-4 text-emerald-400 animate-pulse" />
              ) : (
                <MicOff className="w-4 h-4" />
              )}
              <div className="flex flex-col text-left">
                <span className="font-semibold">Hands-Free Voice Play</span>
                <span className="text-[10px] text-deck-500">
                  Call out &ldquo;Rune 4&rdquo; or &ldquo;Card 12&rdquo; to flip
                </span>
              </div>
            </div>
            <span className="font-mono text-[10px] font-bold uppercase">
              {isListening ? 'ACTIVE' : 'OFF'}
            </span>
          </button>
        ) : (
          <div className="p-2 rounded-lg bg-surface-base border border-surface-border text-[11px] text-deck-500 text-center">
            Microphone speech recognition not supported in this browser
          </div>
        )}

        {lastCommand && (
          <div className="px-2.5 py-1.5 rounded-md bg-surface-base border border-surface-border text-[11px] text-deck-300 font-mono flex items-center justify-between">
            <span className="text-deck-500">Heard:</span>
            <span className="text-amber-400 font-bold">{lastCommand}</span>
          </div>
        )}
      </div>
    </div>
  );
}
