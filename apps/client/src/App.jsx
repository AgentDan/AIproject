import { useEffect, useState } from 'react';

const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function App() {
  const [command, setCommand] = useState('');
  const [inputType, setInputType] = useState('text');
  const [response, setResponse] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverNotice, setServerNotice] = useState(null);

  useEffect(() => {
    if (!serverNotice) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setServerNotice(null);
    }, 5200);

    return () => window.clearTimeout(timeoutId);
  }, [serverNotice]);

  async function sendCommand(nextInputType = inputType) {
    const trimmedCommand = command.trim();

    if (!trimmedCommand) {
      setError('Enter a text command or provide a voice command transcript.');
      setResponse(null);
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
            previewMode: 'mvp'
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
    }
  }

  const actionPlan = response?.aiServices?.actionPlan;
  const sceneResult = response?.sceneResult;
  const previewObject = sceneResult?.previewUpdate?.objects?.[0];
  const sceneDiffCount = sceneResult?.sceneDiff?.length || 0;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {serverNotice ? (
        <div className="fixed right-6 top-1/2 z-50 w-[min(92vw,380px)] -translate-y-1/2 rounded-3xl border border-white/15 bg-slate-950/75 p-5 text-sm text-slate-100 shadow-2xl shadow-cyan-950/40 backdrop-blur-xl">
          <div className="flex items-start gap-3">
            <span
              className={`mt-1 h-3 w-3 rounded-full ${
                serverNotice.type === 'error' ? 'bg-red-300' : 'bg-emerald-300'
              }`}
            />
            <div>
              <p className="font-semibold text-white">{serverNotice.title}</p>
              <p className="mt-2 leading-6 text-slate-300">{serverNotice.message}</p>
              {serverNotice.intent || serverNotice.resultStatus ? (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {serverNotice.intent ? (
                    <div className="rounded-2xl bg-white/10 p-3">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Intent</p>
                      <p className="mt-1 font-semibold text-cyan-200">{serverNotice.intent}</p>
                    </div>
                  ) : null}
                  {serverNotice.resultStatus ? (
                    <div className="rounded-2xl bg-white/10 p-3">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Result</p>
                      <p className="mt-1 font-semibold text-emerald-200">{serverNotice.resultStatus}</p>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-6 py-8 lg:px-8">
        <header className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-cyan-950/30">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
              AI Product Scene Platform
            </p>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-5xl">
              Voice and text control for 3D product scenes.
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
              For now, the MVP client contains only two parts: a command input
              for text or voice and a 3D preview area for the product scene.
            </p>
          </div>
        </header>

        <div className="grid flex-1 gap-6 lg:grid-cols-[380px_1fr]">
          <aside className="flex flex-col">
            <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
                Command Input
              </p>
              <label className="mt-5 block text-sm font-medium text-slate-300" htmlFor="command">
                Voice or text command
              </label>
              <textarea
                id="command"
                value={command}
                onChange={(event) => setCommand(event.target.value)}
                className="mt-2 min-h-32 w-full resize-none rounded-2xl border border-white/10 bg-slate-900 p-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300"
                placeholder="Move the selected chair 50 cm to the left..."
              />
              <div className="mt-4 flex gap-3">
                <button
                  className="flex-1 rounded-full bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isSubmitting}
                  onClick={() => sendCommand('text')}
                  type="button"
                >
                  {isSubmitting && inputType === 'text' ? 'Sending...' : 'Send Text'}
                </button>
                <button
                  className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isSubmitting}
                  onClick={() => sendCommand('voice')}
                  type="button"
                >
                  {isSubmitting && inputType === 'voice' ? 'Sending...' : 'Speak'}
                </button>
              </div>
              {error ? (
                <p className="mt-4 rounded-2xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">
                  {error}
                </p>
              ) : null}
              {response ? (
                <div className="mt-4 rounded-2xl border border-cyan-300/20 bg-slate-900/80 p-4 text-sm text-slate-300">
                  <p className="font-semibold text-cyan-200">Last response</p>
                  <p className="mt-2">{response.explanation}</p>
                </div>
              ) : null}
            </section>
          </aside>

          <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-2xl shadow-slate-950/40">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
                  3D Preview
                </p>
                <h2 className="mt-2 text-2xl font-bold text-white">Product Scene Workspace</h2>
              </div>
            </div>

            <div className="mt-6 grid min-h-[560px] gap-6 rounded-3xl border border-cyan-300/20 bg-[radial-gradient(circle_at_center,_rgba(34,211,238,0.18),_rgba(15,23,42,0.2)_35%,_rgba(2,6,23,1)_75%)] p-6 xl:grid-cols-[1fr_360px]">
              <div className="relative h-72 w-72">
                <div className="absolute inset-x-4 bottom-8 h-16 rounded-[50%] bg-cyan-400/10 blur-xl" />
                <div
                  className="absolute left-12 top-16 h-40 w-40 rotate-12 rounded-3xl border border-cyan-200/40 bg-cyan-300/15 shadow-2xl shadow-cyan-500/20 transition-transform duration-500"
                  style={{
                    transform: `translate3d(${(previewObject?.transform?.position?.x || 0) * 80}px, ${-(previewObject?.transform?.position?.y || 0) * 80}px, 0) rotate(12deg)`
                  }}
                />
                <div className="absolute right-10 top-24 h-32 w-32 -rotate-6 rounded-2xl border border-violet-200/40 bg-violet-300/15 shadow-2xl shadow-violet-500/20" />
                <div className="absolute bottom-14 left-1/2 h-24 w-56 -translate-x-1/2 rounded-2xl border border-emerald-200/30 bg-emerald-300/10" />
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
                  Pipeline Response
                </p>
                {response ? (
                  <div className="mt-4 space-y-4 text-sm">
                    <div>
                      <p className="text-slate-500">Status</p>
                      <p className="font-semibold text-emerald-300">{response.status}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Action Plan</p>
                      <p className="font-semibold text-white">{actionPlan?.intent}</p>
                      <p className="mt-1 text-slate-400">
                        {actionPlan?.steps?.[0]?.type} {'->'} {actionPlan?.steps?.[0]?.target?.objectId}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Scene Result</p>
                      <p className="font-semibold text-white">{sceneResult?.status}</p>
                      <p className="mt-1 text-slate-400">
                        Diff items: {sceneDiffCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Validation</p>
                      <p className="font-semibold text-white">
                        {sceneResult?.validation?.valid ? 'valid' : 'invalid'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-slate-400">
                    Send a voice or text command to run the full backend pipeline.
                  </p>
                )}
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
