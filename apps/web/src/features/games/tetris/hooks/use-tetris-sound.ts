'use client';

import { useCallback, useEffect, useRef } from 'react';
import { usePreferencesStore } from '@/stores/preferences.store';
import type { TetrisSfxEvent } from '../types/tetris.types';

const WAVE_SINE: OscillatorType = 'sine';
const WAVE_SQUARE: OscillatorType = 'square';
const WAVE_SAWTOOTH: OscillatorType = 'sawtooth';
const WAVE_TRIANGLE: OscillatorType = 'triangle';

interface Tone {
  freq: number;
  duration: number;
  type?: OscillatorType;
  gain?: number;
  delay?: number;
}

const SFX_TONES: Record<TetrisSfxEvent, Tone[]> = {
  move: [{ freq: 220, duration: 0.03, type: WAVE_SQUARE, gain: 0.05 }],
  rotate: [{ freq: 340, duration: 0.045, type: WAVE_SQUARE, gain: 0.06 }],
  'soft-drop': [{ freq: 160, duration: 0.03, type: WAVE_SQUARE, gain: 0.05 }],
  'hard-drop': [
    { freq: 140, duration: 0.05, type: WAVE_SAWTOOTH, gain: 0.12 },
    { freq: 70, duration: 0.09, type: WAVE_SAWTOOTH, gain: 0.14, delay: 0.03 },
  ],
  lock: [{ freq: 180, duration: 0.06, type: WAVE_TRIANGLE, gain: 0.08 }],
  hold: [
    { freq: 300, duration: 0.05, type: WAVE_SINE, gain: 0.07 },
    { freq: 420, duration: 0.06, type: WAVE_SINE, gain: 0.07, delay: 0.05 },
  ],
  'clear-single': [{ freq: 520, duration: 0.09, type: WAVE_SINE, gain: 0.12 }],
  'clear-double': [
    { freq: 520, duration: 0.08, type: WAVE_SINE, gain: 0.12 },
    { freq: 660, duration: 0.09, type: WAVE_SINE, gain: 0.12, delay: 0.07 },
  ],
  'clear-triple': [
    { freq: 520, duration: 0.07, type: WAVE_SINE, gain: 0.12 },
    { freq: 660, duration: 0.07, type: WAVE_SINE, gain: 0.12, delay: 0.06 },
    { freq: 780, duration: 0.09, type: WAVE_SINE, gain: 0.12, delay: 0.12 },
  ],
  'clear-tetris': [
    { freq: 520, duration: 0.08, type: WAVE_SINE, gain: 0.14 },
    { freq: 660, duration: 0.08, type: WAVE_SINE, gain: 0.14, delay: 0.07 },
    { freq: 780, duration: 0.08, type: WAVE_SINE, gain: 0.14, delay: 0.14 },
    { freq: 1040, duration: 0.16, type: WAVE_SINE, gain: 0.16, delay: 0.21 },
  ],
  'level-up': [
    { freq: 440, duration: 0.07, type: WAVE_TRIANGLE, gain: 0.1 },
    { freq: 660, duration: 0.07, type: WAVE_TRIANGLE, gain: 0.1, delay: 0.07 },
    { freq: 880, duration: 0.14, type: WAVE_TRIANGLE, gain: 0.12, delay: 0.14 },
  ],
  pause: [{ freq: 240, duration: 0.08, type: WAVE_SINE, gain: 0.08 }],
  start: [{ freq: 440, duration: 0.06, type: WAVE_SINE, gain: 0.08 }],
  'game-over': [
    { freq: 320, duration: 0.12, type: WAVE_SAWTOOTH, gain: 0.12 },
    { freq: 220, duration: 0.14, type: WAVE_SAWTOOTH, gain: 0.12, delay: 0.12 },
    { freq: 120, duration: 0.24, type: WAVE_SAWTOOTH, gain: 0.14, delay: 0.26 },
  ],
};

export function useTetrisSound() {
  const soundEnabled = usePreferencesStore((state) => state.soundEnabled);
  const contextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      contextRef.current?.close().catch(() => {});
      contextRef.current = null;
    };
  }, []);

  const getContext = useCallback((): AudioContext | null => {
    if (typeof window === 'undefined') return null;
    const AudioCtor = window.AudioContext;
    if (!AudioCtor) return null;

    if (!contextRef.current) {
      contextRef.current = new AudioCtor();
    }
    if (contextRef.current.state === 'suspended') {
      contextRef.current.resume().catch(() => {});
    }
    return contextRef.current;
  }, []);

  const playTone = useCallback((ctx: AudioContext, tone: Tone) => {
    const startTime = ctx.currentTime + (tone.delay ?? 0);
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = tone.type ?? WAVE_SINE;
    oscillator.frequency.setValueAtTime(tone.freq, startTime);

    const peakGain = tone.gain ?? 0.1;
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(peakGain, startTime + 0.008);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + tone.duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.start(startTime);
    oscillator.stop(startTime + tone.duration + 0.02);
  }, []);

  const play = useCallback(
    (event: TetrisSfxEvent) => {
      if (!soundEnabled) return;
      const ctx = getContext();
      if (!ctx) return;

      for (const tone of SFX_TONES[event]) {
        playTone(ctx, tone);
      }
    },
    [soundEnabled, getContext, playTone],
  );

  return { play };
}
