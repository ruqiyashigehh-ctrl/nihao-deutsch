import { useCallback, useMemo } from 'react';

interface UseTTSResult {
  supported: boolean;
  speak: (text: string) => void;
}

export function useTTS(): UseTTSResult {
  const supported = useMemo(() => {
    return typeof window !== 'undefined' && typeof window.speechSynthesis !== 'undefined';
  }, []);

  const speak = useCallback((text: string) => {
    if (!supported) return;
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'de-DE';
      window.speechSynthesis.speak(utterance);
    } catch {
      // 静默降级，不抛出异常
    }
  }, [supported]);

  return { supported, speak };
}