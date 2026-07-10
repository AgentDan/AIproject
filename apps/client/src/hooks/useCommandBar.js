import { useCallback, useEffect, useRef, useState } from 'react';
import { useSpeechCommand } from './useSpeechCommand.js';

function isTypingTarget(target) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
    return true;
  }
  return target.isContentEditable;
}

/**
 * Shared command bar interaction (Assistant + Configurator): expand/collapse, voice, outside click.
 */
export function useCommandBar({ onSubmit, disabled = false, keyboardBlocked = false } = {}) {
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
  const showCommandFieldRef = useRef(false);
  const commandRef = useRef(command);
  const handleRoundButtonRef = useRef(/** @type {(() => void) | null} */ (null));
  isListeningRef.current = isListening;
  isSubmittingRef.current = isSubmitting;
  commandRef.current = command;

  const showCommandField =
    !canUseSpeech ||
    commandBarExpanded ||
    isListening ||
    (isSubmitting && inputType === 'voice');
  showCommandFieldRef.current = showCommandField;

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
  handleRoundButtonRef.current = handleRoundButton;

  useEffect(() => {
    if (disabled || keyboardBlocked) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.defaultPrevented || event.repeat) {
        return;
      }

      const input = textInputRef.current;
      const target = event.target;
      const typingElsewhere = isTypingTarget(target) && target !== input;

      if (event.key === ' ') {
        if (typingElsewhere || target === input || isSubmittingRef.current) {
          return;
        }

        if (canUseSpeech && !showCommandFieldRef.current) {
          event.preventDefault();
          handleRoundButtonRef.current?.();
          return;
        }

        if (!canUseSpeech && input) {
          event.preventDefault();
          input.focus();
        }
        return;
      }

      if (event.key === 'Escape') {
        if (!canUseSpeech || isSubmittingRef.current || !showCommandFieldRef.current) {
          return;
        }
        if (commandRef.current.trim()) {
          return;
        }

        if (isListeningRef.current) {
          stopListening();
        }
        setCommandBarExpanded(false);
        input?.blur();
        event.preventDefault();
        return;
      }

      if (event.key !== 'Enter') {
        return;
      }

      if (typingElsewhere || target === input || isSubmittingRef.current || !showCommandFieldRef.current) {
        return;
      }

      event.preventDefault();
      handleRoundButtonRef.current?.();
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [canUseSpeech, disabled, keyboardBlocked, stopListening]);

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
