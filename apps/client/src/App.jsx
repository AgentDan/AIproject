import { useEffect, useRef, useState } from 'react';
import { postCommand } from './api/client.js';
import CommandInput from './components/CommandInput.jsx';
import Preview3D from './components/Preview3D.jsx';
import ResultViewer from './components/ResultViewer.jsx';

function getSpeechRecognitionCtor() {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

export default function App() {
  const [command, setCommand] = useState('');
  const [inputType, setInputType] = useState('voice');
  const [response, setResponse] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [serverNotice, setServerNotice] = useState(null);
  const [commandBarExpanded, setCommandBarExpanded] = useState(false);
  const recognitionRef = useRef(null);
  const textInputRef = useRef(null);
  const commandBarRef = useRef(null);
  const serverNoticeRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const isListeningRef = useRef(isListening);
  const isSubmittingRef = useRef(isSubmitting);
  isListeningRef.current = isListening;
  isSubmittingRef.current = isSubmitting;

  const canUseSpeech = !!getSpeechRecognitionCtor();
  const showCommandField =
    !canUseSpeech ||
    commandBarExpanded ||
    isListening ||
    (isSubmitting && inputType === 'voice');

  useEffect(() => {
    if (!showCommandField) {
      return undefined;
    }
    const id = window.requestAnimationFrame(() => {
      textInputRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(id);
  }, [showCommandField]);

  useEffect(() => {
    if (!canUseSpeech) {
      return undefined;
    }

    function handlePointerDown(event) {
      const root = commandBarRef.current;
      if (!root?.contains(event.target)) {
        if (isSubmittingRef.current) {
          return;
        }
        if (isListeningRef.current) {
          recognitionRef.current?.stop();
          recognitionRef.current = null;
          setIsListening(false);
        }
        setCommandBarExpanded(false);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [canUseSpeech]);

  useEffect(() => {
    if (!serverNotice) {
      return undefined;
    }

    function handlePointerDown(/** @type {PointerEvent} */ event) {
      if (
        !serverNoticeRef.current ||
        serverNoticeRef.current.contains(/** @type {Node | null} */ (event.target))
      ) {
        return;
      }
      setServerNotice(null);
    }

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [serverNotice]);

  async function sendCommandText(commandText, nextInputType = inputType) {
    const trimmedCommand = commandText.trim();

    if (!trimmedCommand) {
      setError('Enter a text command or provide a voice command transcript.');
      setResponse(null);
      setServerNotice({
        type: 'error',
        title: 'No command detected',
        message: canUseSpeech
          ? 'Use the round button or Enter: when empty, speak; when there is text, send.'
          : 'Type a command, then press Enter or the round send button.'
      });
      return;
    }

    setInputType(nextInputType);
    setError('');
    setIsSubmitting(true);

    let commandDelivered = false;

    try {
      const { apiResponse, payload } = await postCommand({
        command: trimmedCommand,
        inputType: nextInputType,
        clientState: {
          source: 'apps/client',
          previewMode: 'fullscreen-mvp'
        }
      });

      if (!apiResponse.ok) {
        const details =
          Array.isArray(payload.errors) && payload.errors.length > 0
            ? ` — ${payload.errors.join('; ')}`
            : '';
        throw new Error(
          `${payload.message || 'Command request failed.'}${details}`
        );
      }

      setResponse(payload);
      setServerNotice({
        type: 'success',
        responseType: payload.responseType,
        message:
          payload.responseType === 'help'
            ? payload.message && String(payload.message).trim().length > 0
              ? String(payload.message).trim()
              : 'Supported intents.'
            : payload.explanation || 'The server processed the command.',
        intent:
          payload.responseType === 'help' ? undefined : payload.aiServices?.actionPlan?.intent,
        resultStatus:
          payload.responseType === 'help' ? payload.responseType : payload.sceneResult?.status,
        helpIntents:
          payload.responseType === 'help' ? (payload.help?.intents ?? []) : undefined
      });
      commandDelivered = true;
    } catch (requestError) {
      const raw =
        requestError instanceof Error ? requestError.message : String(requestError);
      const looksLikeNetwork = raw === 'Failed to fetch' || /network/i.test(raw);
      const message = looksLikeNetwork
        ? 'Network error: cannot reach API. Production builds use same-origin /api unless VITE_API_URL is set.'
        : raw;
      setResponse(null);
      setError(message);
      setServerNotice({
        type: 'error',
        title: 'Server response error',
        message
      });
    } finally {
      setIsSubmitting(false);
      setIsListening(false);
      if (canUseSpeech && commandDelivered) {
        setCommandBarExpanded(false);
        setCommand('');
      }
    }
  }

  function startVoiceCommand() {
    const SpeechRecognition = getSpeechRecognitionCtor();

    if (!SpeechRecognition) {
      setServerNotice({
        type: 'error',
        title: 'Voice input unavailable',
        message:
          'This browser does not expose speech recognition. Type your command in the field below.'
      });
      return;
    }

    setCommandBarExpanded(true);

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setInputType('voice');
      setError('');
      setIsListening(true);
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      setServerNotice({
        type: 'error',
        title: 'Voice command error',
        message: event.error || 'Speech recognition failed.'
      });
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

    recognition.start();
  }

  function stopVoiceCommand() {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
  }

  function handleRoundCommandButton() {
    if (isSubmitting) {
      return;
    }

    if (!canUseSpeech) {
      sendCommandText(command, 'text');
      return;
    }

    if (isListening) {
      stopVoiceCommand();
      return;
    }

    if (command.trim()) {
      sendCommandText(command, inputType);
      return;
    }

    startVoiceCommand();
  }

  const sceneResult = response?.sceneResult;
  const previewObject = sceneResult?.previewUpdate?.objects?.[0];
  const previewColor = previewObject?.material?.color;

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <Preview3D previewObject={previewObject} previewColor={previewColor} />

      <ResultViewer serverNotice={serverNotice} serverNoticeRef={serverNoticeRef} />

      <CommandInput
        command={command}
        setCommand={setCommand}
        setInputType={setInputType}
        isListening={isListening}
        isSubmitting={isSubmitting}
        canUseSpeech={canUseSpeech}
        showCommandField={showCommandField}
        commandBarRef={commandBarRef}
        textInputRef={textInputRef}
        onRoundButton={handleRoundCommandButton}
      />

      {error ? (
        <p className="fixed left-6 top-6 z-40 max-w-sm rounded-2xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200 backdrop-blur-xl">
          {error}
        </p>
      ) : null}
    </main>
  );
}
