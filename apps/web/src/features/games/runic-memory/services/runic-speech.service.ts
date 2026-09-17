import type { RuneDefinition } from '../types/runic-memory.types';

const WORD_TO_NUMBER: Record<string, number> = {
  one: 1,
  first: 1,
  two: 2,
  second: 2,
  three: 3,
  third: 3,
  four: 4,
  fourth: 4,
  five: 5,
  fifth: 5,
  six: 6,
  sixth: 6,
  seven: 7,
  seventh: 7,
  eight: 8,
  eighth: 8,
  nine: 9,
  ninth: 9,
  ten: 10,
  tenth: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
};

// Minimal SpeechRecognition typing
interface SpeechRecognitionEventLike {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: (event: SpeechRecognitionEventLike) => void;
  onerror: (event: unknown) => void;
  onend: () => void;
}

export class RunicSpeechService {
  private announcerEnabled: boolean = false;
  private voiceRecognitionEnabled: boolean = false;
  private recognitionInstance: SpeechRecognitionInstance | null = null;
  private onCommandCallback:
    ((command: { type: 'flip' | 'reset'; cardIndex?: number }) => void) | null = null;

  public setAnnouncerEnabled(enabled: boolean): void {
    this.announcerEnabled = enabled;
    if (!enabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  public isAnnouncerEnabled(): boolean {
    return this.announcerEnabled;
  }

  /**
   * Whisper or announce the sacred name and meaning of a rune.
   */
  public speakRune(rune: RuneDefinition): void {
    if (!this.announcerEnabled) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel();
      const text = `${rune.name}. ${rune.meaning.split('&')[0].trim()}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 0.9;
      utterance.volume = 0.8;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Voice synthesis is non-blocking
    }
  }

  /**
   * Announce special match events (combos, victory).
   */
  public speakEvent(phrase: string): void {
    if (!this.announcerEnabled) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(phrase);
      utterance.rate = 1.0;
      utterance.pitch = 1.05;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Voice synthesis error ignored
    }
  }

  /**
   * Check if speech recognition is available in the player's browser.
   */
  public isSpeechRecognitionSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return Boolean('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  }

  /**
   * Start listening for hands-free voice commands.
   */
  public startVoiceCommands(
    maxCards: number,
    onCommand: (command: { type: 'flip' | 'reset'; cardIndex?: number }) => void,
  ): boolean {
    if (!this.isSpeechRecognitionSupported()) return false;
    this.stopVoiceCommands();

    this.onCommandCallback = onCommand;
    this.voiceRecognitionEnabled = true;

    try {
      type WindowWithSpeech = Window & {
        SpeechRecognition?: new () => SpeechRecognitionInstance;
        webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
      };
      const win = window as unknown as WindowWithSpeech;
      const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;
      if (!SpeechRecognitionClass) return false;
      const recognition: SpeechRecognitionInstance = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: SpeechRecognitionEventLike) => {
        const lastResultIndex = Object.keys(event.results).length - 1;
        const transcript =
          event.results[lastResultIndex]?.[0]?.transcript?.trim().toLowerCase() || '';

        this.parseTranscript(transcript, maxCards);
      };

      recognition.onerror = () => {
        // Handle error gracefully
      };

      recognition.onend = () => {
        // Auto restart if still enabled
        if (this.voiceRecognitionEnabled) {
          try {
            recognition.start();
          } catch {
            // Restart failure ignored
          }
        }
      };

      recognition.start();
      this.recognitionInstance = recognition;
      return true;
    } catch {
      this.voiceRecognitionEnabled = false;
      return false;
    }
  }

  public stopVoiceCommands(): void {
    this.voiceRecognitionEnabled = false;
    if (this.recognitionInstance) {
      try {
        this.recognitionInstance.abort();
      } catch {
        // Abort error ignored
      }
      this.recognitionInstance = null;
    }
    this.onCommandCallback = null;
  }

  public isVoiceCommandsActive(): boolean {
    return this.voiceRecognitionEnabled;
  }

  private parseTranscript(transcript: string, maxCards: number): void {
    if (!this.onCommandCallback) return;

    if (
      transcript.includes('reset') ||
      transcript.includes('restart') ||
      transcript.includes('new game')
    ) {
      this.onCommandCallback({ type: 'reset' });
      return;
    }

    // Match patterns: "card 3", "rune 5", "flip 12", "number 8"
    const words = transcript.split(/\s+/);
    let cardNum: number | null = null;

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      if (/^\d+$/.test(word)) {
        cardNum = parseInt(word, 10);
        break;
      }
      if (WORD_TO_NUMBER[word]) {
        cardNum = WORD_TO_NUMBER[word];
        break;
      }
    }

    if (cardNum !== null && cardNum >= 1 && cardNum <= maxCards) {
      // 1-indexed to 0-indexed
      this.onCommandCallback({ type: 'flip', cardIndex: cardNum - 1 });
    }
  }
}

export const runicSpeech = new RunicSpeechService();
