import { useCallback, useEffect, useRef, useState } from 'react';
import { useSpeechCommand } from './useSpeechCommand.js';

/**
 * Shared command bar interaction (Assistant + Configurator): expand/collapse, voice, outside click.
 */
export function useCommandBar({ onSubmit, disabled = false } = {}) {
  const {
    command,
    setCommand,
    inputType,
    setInputType,
    isListening,
    canUseSpeech,
    startListening,
    stopListening
  } = useSpeechCommand();

  const [commandBarExpanded, setCommandBarExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const commandBarRef = useRef(null);
  const textInputRef = useRef(null);
  const isListeningRef = useRef(isListening);
  const isSubmittingRef = useRef(isSubmitting);
  isListeningRef.current = isListening;
  isSubmittingRef.current = isSubmitting;

  const showCommandField =
    !canUseSpeech ||
    commandBarExpanded ||
    isListening ||
    (isSubmitting && inputType === 'voice');

  useEffect(() => {
    if (!showCommandField || disabled) {
      return undefined;
    }
    const id = window.requestAnimationFrame(() => {
      textInputRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(id);
  }, [disabled, showCommandField]);

  useEffect(() => {
    if (!canUseSpeech || disabled) {
      return undefined;
    }

    function handlePointerDown(event) {
      const root = commandBarRef.current;
      if (!root?.contains(event.target)) {
        if (isSubmittingRef.current) {
          return;
        }
        if (isListeningRef.current) {
          stopListening();
        }
        setCommandBarExpanded(false);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [canUseSpeech, disabled, stopListening]);

  const sendCommandText = useCallback(
    async (commandText, nextInputType = inputType) => {
      if (isSubmitting || disabled || !onSubmit) {
        return false;
      }

      const trimmed = commandText.trim();
      setInputType(nextInputType);
      setIsSubmitting(true);

      let delivered = false;
      try {
        delivered = await onSubmit({ command: trimmed, inputType: nextInputType });
      } finally {
        setIsSubmitting(false);
        stopListening();
        if (canUseSpeech && delivered) {
          setCommandBarExpanded(false);
          setCommand('');
        }
      }
      return delivered;
    },
    [canUseSpeech, disabled, inputType, isSubmitting, onSubmit, setCommand, setInputType, stopListening]
  );

  const handleRoundButton = useCallback(() => {
    if (isSubmitting || disabled) {
      return;
    }

    if (!canUseSpeech) {
      void sendCommandText(command, 'text');
      return;
    }

    if (isListening) {
      stopListening();
      return;
    }

    if (command.trim()) {
      void sendCommandText(command, inputType);
      return;
    }

    setCommandBarExpanded(true);
    startListening();
  }, [
    canUseSpeech,
    command,
    disabled,
    inputType,
    isListening,
    isSubmitting,
    sendCommandText,
    startListening,
    stopListening
  ]);

  return {
    command,
    setCommand,
    setInputType,
    isListening,
    isSubmitting,
    canUseSpeech,
    showCommandField,
    commandBarRef,
    textInputRef,
    handleRoundButton
  };
}
