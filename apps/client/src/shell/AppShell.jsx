import { useCallback, useEffect, useRef, useState } from 'react';
import { getApiBaseUrl, postCommand } from '../api/client.js';
import { getAuthHeaders } from '../api/authFetch.js';
import CommandBar from '../widgets/CommandBar.jsx';
import Preview3D from '../widgets/Preview3D.jsx';
import ResultViewer from '../widgets/ResultViewer.jsx';
import { buildServerNoticeFromPayload } from '../shared/commandResponseNotice.js';

export default function AppShell() {
  const [response, setResponse] = useState(null);
  const [error, setError] = useState('');
  const [serverNotice, setServerNotice] = useState(null);
  const [showRedCircle, setShowRedCircle] = useState(false);
  const serverNoticeRef = useRef(/** @type {HTMLDivElement | null} */ (null));

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

  const handleSubmit = useCallback(async ({ command, inputType }) => {
    if (!command) {
      setError('Enter a text command or provide a voice command transcript.');
      setResponse(null);
      setServerNotice({
        type: 'error',
        title: 'No command detected',
        message:
          'Use the round button or Enter: when empty, speak; when there is text, send.'
      });
      return false;
    }

    setError('');

    try {
      const { apiResponse, payload } = await postCommand({
        command,
        inputType,
        clientState: {
          source: 'apps/client',
          domain: 'assistant',
          mode: 'assistant',
          previewMode: 'fullscreen-mvp'
        },
        extraHeaders: getAuthHeaders()
      });

      if (!apiResponse.ok) {
        const details =
          Array.isArray(payload.errors) && payload.errors.length > 0
            ? ` — ${payload.errors.join('; ')}`
            : '';
        throw new Error(`${payload.message || 'Command request failed.'}${details}`);
      }

      setResponse(payload);
      setServerNotice(buildServerNoticeFromPayload(payload));
      const overlay = payload?.sceneResult?.previewUpdate?.assistantOverlay;
      if (overlay && typeof overlay.redCircle === 'boolean') {
        setShowRedCircle(overlay.redCircle);
      }
      return true;
    } catch (requestError) {
      const raw =
        requestError instanceof Error ? requestError.message : String(requestError);
      const looksLikeNetwork = raw === 'Failed to fetch' || /network/i.test(raw);
      const message = looksLikeNetwork
        ? `Не удалось связаться с API (${getApiBaseUrl()}). Запустите «npm run dev» и проверьте, что сервер слушает порт 3001. Для другого хоста задайте VITE_API_URL.`
        : raw;
      setResponse(null);
      setError(message);
      setServerNotice({
        type: 'error',
        title: 'Server response error',
        message
      });
      return false;
    }
  }, []);

  const sceneResult = response?.sceneResult;
  const previewObject = sceneResult?.previewUpdate?.objects?.[0];
  const previewColor = previewObject?.material?.color;

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <Preview3D
        previewObject={previewObject}
        previewColor={previewColor}
        showRedCircle={showRedCircle}
      />

      <ResultViewer serverNotice={serverNotice} serverNoticeRef={serverNoticeRef} />

      <CommandBar
        inputId="assistant-command-input"
        placeholder="Type command"
        onSubmit={handleSubmit}
      />

      {error ? (
        <p className="fixed left-6 top-6 z-40 max-w-sm rounded-2xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200 backdrop-blur-xl">
          {error}
        </p>
      ) : null}
    </main>
  );
}
