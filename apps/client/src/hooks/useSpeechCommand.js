import { useCallback, useEffect, useRef, useState } from 'react';

function getSpeechRecognitionCtor() {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

/**
 * Browser speech-to-text for command bars (Assistant + Configurator).
 */
export function useSpeechCommand() {
  const [command, setCommand] = useState('');
  const [inputType, setInputType] = useState('text');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const canUseSpeech = !!getSpeechRecognitionCtor();

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition = getSpeechRecognitionCtor();
    if (!SpeechRecognition) {
      return false;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setInputType('voice');
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let line = '';
      for (let i = 0; i < event.results.length; i += 1) {
        line += event.results[i][0]?.transcript || '';
      }
      setInputType('voice');
      setCommand(line);
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      setIsListening(false);
    };

    recognition.onerror = () => {
      recognitionRef.current = null;
      setIsListening(false);
    };

    recognition.start();
    return true;
  }, []);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  return {
    command,
    setCommand,
    inputType,
    setInputType,
    isListening,
    canUseSpeech,
    startListening,
    stopListening
  };
}
