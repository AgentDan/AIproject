import { useEffect, useRef, useState } from 'react';

const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function App() {
  const [command, setCommand] = useState('');
  const [inputType, setInputType] = useState('voice');
  const [response, setResponse] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isTextOpen, setIsTextOpen] = useState(false);
  const [serverNotice, setServerNotice] = useState(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!serverNotice) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setServerNotice(null);
    }, 5200);

    return () => window.clearTimeout(timeoutId);
  }, [serverNotice]);

  async function sendCommandText(commandText, nextInputType = inputType) {
    const trimmedCommand = commandText.trim();

    if (!trimmedCommand) {
      setError('Enter a text command or provide a voice command transcript.');
      setResponse(null);
      setServerNotice({
        type: 'error',
        title: 'No command detected',
        message: 'Please speak a command or open text input and type one.'
      });
      return;
    }

    setInputType(nextInputType);
    setError('');
    setIsSubmitting(true);

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
        title: payload.message || 'Command accepted',
        message: payload.explanation || 'The server processed the command.',
        intent: payload.aiServices?.actionPlan?.intent,
        resultStatus: payload.sceneResult?.status
      });
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
    }
  }

  function startVoiceCommand() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsTextOpen(true);
      setServerNotice({
        type: 'error',
        title: 'Voice input unavailable',
        message: 'This browser does not expose speech recognition. Use the text input instead.'
      });
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
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
      const transcript = event.results?.[0]?.[0]?.transcript || '';
      setCommand(transcript);
      sendCommandText(transcript, 'voice');
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
        <div className="fixed left-1/2 top-[24%] z-50 w-[min(88vw,640px)] -translate-x-1/2 rounded-[2rem] border border-white/15 bg-white/25 px-8 py-6 text-sm text-white shadow-2xl shadow-black/40 backdrop-blur-2xl">
          <div className="flex items-start gap-4">
            <span
              className={`mt-1.5 h-3.5 w-3.5 rounded-full shadow-lg ${
                serverNotice.type === 'error' ? 'bg-red-300' : 'bg-emerald-300'
              }`}
            />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/45">
                AI Response
              </p>
              <p className="mt-3 leading-6 text-white/90">{serverNotice.message}</p>
              {serverNotice.intent || serverNotice.resultStatus ? (
                <div className="mt-4 flex flex-wrap gap-3">
                  {serverNotice.intent ? (
                    <div className="rounded-full bg-white/10 px-4 py-2">
                      <p className="text-xs font-semibold text-white/75">{serverNotice.intent}</p>
                    </div>
                  ) : null}
                  {serverNotice.resultStatus ? (
                    <div className="rounded-full bg-white/10 px-4 py-2">
                      <p className="text-xs font-semibold text-white/75">{serverNotice.resultStatus}</p>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {isTextOpen ? (
        <div className="fixed bottom-[8.5rem] left-1/2 z-40 w-[min(86vw,520px)] -translate-x-1/2 rounded-[1.75rem] border border-white/15 bg-black/45 p-3 shadow-2xl shadow-black/40 backdrop-blur-2xl">
          <textarea
            aria-label="Text command"
            value={command}
            onChange={(event) => setCommand(event.target.value)}
            className="min-h-24 w-full resize-none rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-white/30"
            placeholder="Type command only if voice is not enough..."
          />
          <div className="mt-3 flex items-center justify-between gap-3">
            <button
              className="cursor-pointer rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-white/60 transition hover:border-white/30 hover:text-white"
              onClick={() => setIsTextOpen(false)}
              type="button"
            >
              Close
            </button>
            <button
              className="cursor-pointer rounded-full bg-white/85 px-5 py-2 text-xs font-bold text-slate-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
              onClick={() => sendCommandText(command, 'text')}
              type="button"
            >
              {isSubmitting && inputType === 'text' ? 'Sending...' : 'Send text'}
            </button>
          </div>
        </div>
      ) : null}

      <div className="fixed bottom-8 left-1/2 z-40 flex -translate-x-1/2 flex-col items-center gap-4">
        <button
          aria-label="Open text command input"
          className="flex w-[min(82vw,420px)] cursor-pointer items-center gap-3 rounded-full border border-white/15 bg-black/35 px-6 py-4 text-left text-sm text-white/35 shadow-2xl shadow-black/30 backdrop-blur-2xl transition hover:border-white/25 hover:bg-white/10 hover:text-white/70"
          onClick={() => setIsTextOpen((value) => !value)}
          type="button"
        >
          <span className="h-2.5 w-2.5 rounded-full bg-white/35" />
          <span>{command || 'Type command if needed...'}</span>
        </button>
        <button
          aria-label="Start voice command"
          className={`grid h-20 w-20 cursor-pointer place-items-center rounded-full border text-sm font-black tracking-tight shadow-2xl shadow-black/40 backdrop-blur-2xl transition ${
            isListening
              ? 'border-white/50 bg-white/65 text-slate-950'
              : 'border-white/15 bg-white/10 text-white/80 hover:bg-white/20'
          } disabled:cursor-not-allowed disabled:opacity-60`}
          disabled={isSubmitting}
          onClick={isListening ? stopVoiceCommand : startVoiceCommand}
          type="button"
        >
          <span className="grid h-11 w-11 place-items-center rounded-full bg-white/80 text-slate-900">
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
