import { useCallback, useEffect, useState } from 'react';
import { runicSpeech } from '../services/runic-speech.service';

interface UseRunicVoiceCommandsProps {
  totalCards: number;
  isEnabled: boolean;
  onFlipCard: (index: number) => void;
  onReset: () => void;
}

export function useRunicVoiceCommands({
  totalCards,
  isEnabled,
  onFlipCard,
  onReset,
}: UseRunicVoiceCommandsProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported] = useState(() => runicSpeech.isSpeechRecognitionSupported());
  const [lastCommand, setLastCommand] = useState<string | null>(null);

  const toggleListening = useCallback(() => {
    if (!isSupported) return;

    if (isListening) {
      runicSpeech.stopVoiceCommands();
      setIsListening(false);
    } else {
      const started = runicSpeech.startVoiceCommands(totalCards, (cmd) => {
        if (cmd.type === 'flip' && typeof cmd.cardIndex === 'number') {
          setLastCommand(`Flip Rune #${cmd.cardIndex + 1}`);
          onFlipCard(cmd.cardIndex);
        } else if (cmd.type === 'reset') {
          setLastCommand('Reset Round');
          onReset();
        }
      });
      setIsListening(started);
    }
  }, [isSupported, isListening, totalCards, onFlipCard, onReset]);

  useEffect(() => {
    if (!isEnabled && isListening) {
      runicSpeech.stopVoiceCommands();
      setIsListening(false);
    }
  }, [isEnabled, isListening]);

  useEffect(() => {
    return () => {
      runicSpeech.stopVoiceCommands();
    };
  }, []);

  return {
    isSupported,
    isListening,
    lastCommand,
    toggleListening,
  };
}
