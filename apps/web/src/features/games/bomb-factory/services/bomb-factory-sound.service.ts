import { playSound } from '@/lib/audio/sound-synth';

/** Shop-floor audio for Bomb Factory, on the shared PlayDeck synth. */
export class BombFactorySoundService {
  public playSelect(): void {
    playSound('ui-click');
  }

  public playSeated(): void {
    playSound('rivet-lock');
  }

  public playFault(): void {
    playSound('fault-buzz');
  }

  public playCleared(): void {
    playSound('victory');
  }

  public playFailed(): void {
    playSound('klaxon');
  }
}

export const bombFactorySound = new BombFactorySoundService();
