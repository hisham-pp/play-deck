import { playSound } from '@/lib/audio/sound-synth';

/**
 * Sound adapter for Runic Memory using the common PlayDeck sound system (`@/lib/audio/sound-synth`).
 */
export class RunicSoundService {
  public playCardFlip(): void {
    playSound('rune-flip');
  }

  public playRuneReveal(): void {
    playSound('rune-reveal');
  }

  public playMatch(): void {
    playSound('rune-match');
  }

  public playMismatch(): void {
    playSound('rune-mismatch');
  }

  public playVictory(): void {
    playSound('victory');
  }
}

export const runicSound = new RunicSoundService();
