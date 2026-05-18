import { useEffect, useRef, useState } from 'react';

const configuredApi = import.meta.env.VITE_API_URL?.trim?.() ?? '';
/** Prod без env → относительный URL (тот же домен/https за nginx). Dev → API на localhost:3001. */
const apiBaseUrl =
  configuredApi !== ''
    ? configuredApi
    : import.meta.env.DEV
      ? 'http://localhost:3001'
      : '';

/** @param {{ intents?: unknown[] }} props */
function HelpIntentListInsideNotice({ intents = [] }) {
  if (!Array.isArray(intents) || intents.length === 0) {
    return <p className="mt-2 text-xs text-white/55">No intent entries returned.</p>;
  }

  return (
    <ul className="space-y-2 pr-1">
      {intents.map((raw, idx) => {
        const entry = raw && typeof raw === 'object' ? raw : {};
        const typeLabel = typeof entry.type === 'string' ? entry.type : `intent-${idx}`;

        return (
          <li key={`${typeLabel}-${idx}`}>
            <div className="rounded-xl border border-white/12 bg-black/35 px-3 py-2">
              <span className="font-mono text-[13px] font-semibold text-emerald-200/95">{typeLabel}</span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

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
      if (!serverNoticeRef.current || serverNoticeRef.current.contains(/** @type {Node | null} */ (event.target))) {
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
      const apiResponse = await fetch(`${apiBaseUrl}/api/commands`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          command: trimmedCommand,
          inputType: nextInputType,
          clientState: {
            source: 'apps/client',
            previewMode: 'fullscreen-mvp'
          }
        })
      });
      const payload = await apiResponse.json();

      if (!apiResponse.ok) {
        throw new Error(payload.message || 'Command request failed.');
      }

      setResponse(payload);
      setServerNotice({
        type: 'success',
        responseType: payload.responseType,
        message:
          payload.responseType === 'help'
            ? (payload.message && String(payload.message).trim().length > 0
                ? String(payload.message).trim()
                : 'Supported intents.')
            : payload.explanation || 'The server processed the command.',
        intent:
          payload.responseType === 'help'
            ? undefined
            : payload.aiServices?.actionPlan?.intent,
        resultStatus:
          payload.responseType === 'help'
            ? payload.responseType
            : payload.sceneResult?.status,
        helpIntents: payload.responseType === 'help'
          ? (payload.help?.intents ?? [])
          : undefined
      });
      commandDelivered = true;
    } catch (requestError) {
      setResponse(null);
      setError(requestError.message);
      setServerNotice({
        type: 'error',
        title: 'Server response error',
        message: requestError.message
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
        message: 'This browser does not expose speech recognition. Type your command in the field below.'
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
  const previewX = (previewObject?.transform?.position?.x || 0) * 90;
  const previewY = -(previewObject?.transform?.position?.y || 0) * 90;
  const previewColor = previewObject?.material?.color;

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <section className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_center,_rgba(34,211,238,0.22),_rgba(15,23,42,0.26)_34%,_rgba(2,6,23,1)_78%)]">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="relative h-[min(70vw,620px)] w-[min(70vw,620px)]">
          <div className="absolute inset-x-12 bottom-20 h-24 rounded-[50%] bg-cyan-400/10 blur-2xl" />
          <div
            className="absolute left-[25%] top-[22%] h-[34%] w-[34%] rotate-12 rounded-[2rem] border border-cyan-200/45 bg-cyan-300/15 shadow-2xl shadow-cyan-500/25 transition-transform duration-500"
            style={{
              backgroundColor: previewColor || undefined,
              transform: `translate3d(${previewX}px, ${previewY}px, 0) rotate(12deg)`
            }}
          />
          <div className="absolute right-[20%] top-[34%] h-[27%] w-[27%] -rotate-6 rounded-[1.5rem] border border-violet-200/40 bg-violet-300/15 shadow-2xl shadow-violet-500/20" />
          <div className="absolute bottom-[22%] left-1/2 h-[18%] w-[58%] -translate-x-1/2 rounded-[1.25rem] border border-emerald-200/30 bg-emerald-300/10" />
        </div>
      </section>

      {serverNotice ? (
        <div
          ref={serverNoticeRef}
          className={`fixed left-1/2 top-[24%] z-50 flex w-[min(88vw,640px)] -translate-x-1/2 flex-col rounded-[2rem] border border-white/15 bg-white/15 px-8 py-6 text-sm text-white shadow-2xl shadow-black/40 backdrop-blur-2xl ${
            serverNotice.responseType === 'help' ? 'max-h-[min(78vh,560px)]' : ''
          }`}
        >
          <div
            className={`flex items-start gap-4 ${
              serverNotice.responseType === 'help' ? 'min-h-0 flex-1' : ''
            }`}
          >
            <span
              className={`mt-1.5 shrink-0 h-3.5 w-3.5 rounded-full shadow-lg ${
                serverNotice.type === 'error' ? 'bg-red-300' : 'bg-emerald-300'
              }`}
            />
            <div className={`flex min-h-0 flex-1 flex-col ${serverNotice.responseType === 'help' ? 'gap-0' : ''}`}>
              <p className="shrink-0 text-xs font-semibold uppercase tracking-[0.35em] text-white/45">
                AI Response
              </p>
              <p className="mt-3 shrink-0 whitespace-pre-wrap leading-6 text-white/90">
                {serverNotice.message}
              </p>
              {serverNotice.responseType === 'help' ?
                <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1 pt-1">
                  <HelpIntentListInsideNotice intents={serverNotice.helpIntents} />
                </div>
              : null}
              {serverNotice.responseType === 'help' ?
                <div className="mt-4 flex shrink-0 flex-wrap gap-3 border-t border-white/10 pt-4">
                  <div className="rounded-full bg-white/10 px-4 py-2">
                    <p className="text-xs font-semibold text-white/75">help</p>
                  </div>
                </div>
              : (serverNotice.intent || serverNotice.resultStatus) ?
                <div className="mt-4 flex shrink-0 flex-wrap gap-3">
                  {serverNotice.intent ?
                    <div className="rounded-full bg-white/10 px-4 py-2">
                      <p className="text-xs font-semibold text-white/75">{serverNotice.intent}</p>
                    </div>
                  : null}
                  {serverNotice.resultStatus ?
                    <div className="rounded-full bg-white/10 px-4 py-2">
                      <p className="text-xs font-semibold text-white/75">{serverNotice.resultStatus}</p>
                    </div>
                  : null}
                </div>
              : null}
            </div>
          </div>
        </div>
      ) : null}

      <div
        ref={commandBarRef}
        className={`fixed bottom-7 left-1/2 z-40 flex max-w-[min(92vw,520px)] -translate-x-1/2 items-center rounded-full border border-white/15 bg-black/35 shadow-2xl shadow-black/30 backdrop-blur-2xl transition-[padding,width] duration-300 ease-out focus-within:border-white/30 ${
          showCommandField ? 'w-[min(92vw,520px)] gap-3 px-4 py-2.5' : 'w-auto gap-0 px-2 py-2'
        }`}
      >
        {showCommandField ? (
          <>
            <span
              className={`ml-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                isListening ? 'animate-pulse bg-emerald-400/90' : 'bg-white/35'
              }`}
            />
            <input
              ref={textInputRef}
              aria-label={
                isListening ? 'Voice and keyboard command — speech fills this field as you talk' : 'Type command'
              }
              value={command}
              onChange={(event) => {
                setInputType('text');
                setCommand(event.target.value);
              }}
              onKeyDown={(event) => {
                if (event.key !== 'Enter') {
                  return;
                }
                event.preventDefault();
                handleRoundCommandButton();
              }}
              className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/35"
              placeholder="Type command"
            />
          </>
        ) : null}
        <button
          type="button"
          aria-label={
            isListening
              ? 'Stop recording'
              : command.trim()
                ? 'Send command'
                : canUseSpeech
                  ? 'Open command line and start voice'
                  : 'Send command'
          }
          aria-expanded={showCommandField}
          title={
            canUseSpeech
              ? isListening
                ? 'Stop recording'
                : command.trim()
                  ? 'Send this command'
                  : 'Speak — opens the command line'
              : 'Send command'
          }
          className={`grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full border text-sm font-black tracking-tight transition ${
            isListening
              ? 'border-white/50 bg-white/65 text-slate-950'
              : command.trim()
                ? 'border-emerald-400/55 bg-emerald-500/25 text-emerald-100 shadow-lg shadow-emerald-500/20 hover:border-emerald-300/70 hover:bg-emerald-500/35'
                : 'border-white/15 bg-white/10 text-white/80 hover:bg-white/20'
          } disabled:cursor-not-allowed disabled:opacity-60`}
          disabled={isSubmitting || (!canUseSpeech && !command.trim())}
          onClick={handleRoundCommandButton}
        >
          <span className="grid h-6 w-6 place-items-center rounded-full bg-white/80 text-slate-900">
            {isListening ? '...' : '●'}
          </span>
        </button>
      </div>

      {error ? (
        <p className="fixed left-6 top-6 z-40 max-w-sm rounded-2xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200 backdrop-blur-xl">
          {error}
        </p>
      ) : null}

    </main>
  );
}
