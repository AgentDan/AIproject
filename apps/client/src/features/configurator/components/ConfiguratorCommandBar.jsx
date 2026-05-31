import { useState } from 'react';
import { postCommand } from '../../../api/client.js';
import { getAuthHeaders } from '../../../api/authFetch.js';
import { useSpeechCommand } from '../../../hooks/useSpeechCommand.js';
import { useSceneStore } from '../../../shared/scene/sceneStore.js';
import { useConfiguratorStore } from '../store/configuratorStore.js';
import { useAiSceneStore } from '../store/aiSceneStore.js';
import { useViewerSettingsStore } from '../../../shared/scene/viewerSettingsStore.js';

export function ConfiguratorCommandBar({ modelKey }) {
  const [status, setStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selection = useConfiguratorStore((s) => s.selection);
  const panelLab = useViewerSettingsStore((s) => s.panelLab);
  const sceneData = useSceneStore((s) => s.sceneData);

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

  async function sendCommandText(commandText, nextInputType = inputType) {
    const trimmed = commandText.trim();
    if (!trimmed || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    try {
      const clientState = useAiSceneStore.getState().buildClientState({
        modelKey,
        selection,
        panelLab,
        sceneData
      });

      const { apiResponse, payload } = await postCommand({
        command: trimmed,
        inputType: nextInputType,
        clientState,
        extraHeaders: getAuthHeaders()
      });

      if (!apiResponse.ok) {
        throw new Error(payload.message || 'Command failed');
      }

      const objects = payload?.sceneResult?.previewUpdate?.objects;
      if (Array.isArray(objects) && objects.length > 0) {
        useAiSceneStore.getState().queueServerObjects(objects);
      }

      setStatus({
        type: 'success',
        message: payload.explanation || 'Команда применена к 3D-сцене.'
      });
      setCommand('');
    } catch (err) {
      setStatus({
        type: 'error',
        message: err instanceof Error ? err.message : String(err)
      });
    } finally {
      setIsSubmitting(false);
      if (isListening) {
        stopListening();
      }
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    sendCommandText(command, 'text');
  }

  function handleMicClick() {
    if (isSubmitting) return;
    if (isListening) {
      stopListening();
      return;
    }
    if (command.trim()) {
      sendCommandText(command, inputType);
      return;
    }
    startListening();
  }

  if (!modelKey) {
    return null;
  }

  return (
    <div className="absolute bottom-4 left-1/2 z-30 w-[min(40rem,calc(100%-2rem))] -translate-x-1/2 pointer-events-auto">
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-white/15 bg-slate-950/75 p-3 backdrop-blur-md shadow-lg shadow-black/40"
      >
        <label className="sr-only" htmlFor="configurator-ai-command">
          AI command
        </label>
        <div className="flex gap-2">
          <span
            className={`mt-2.5 h-2.5 w-2.5 shrink-0 rounded-full ${
              isListening ? 'animate-pulse bg-emerald-400' : 'bg-white/30'
            }`}
          />
          <input
            id="configurator-ai-command"
            value={command}
            onChange={(e) => {
              setInputType('text');
              setCommand(e.target.value);
            }}
            placeholder='Команда: "move left", "red color"…'
            className="min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
          />
          {canUseSpeech ? (
            <button
              type="button"
              onClick={handleMicClick}
              disabled={isSubmitting}
              aria-label={isListening ? 'Stop voice input' : 'Voice command'}
              className="shrink-0 rounded-xl border border-white/10 bg-slate-800 px-3 py-2 text-sm text-slate-100 hover:bg-slate-700 disabled:opacity-60"
            >
              {isListening ? 'Stop' : 'Mic'}
            </button>
          ) : null}
          <button
            type="submit"
            disabled={isSubmitting}
            className="shrink-0 rounded-xl bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500 disabled:opacity-60"
          >
            {isSubmitting ? '…' : 'Send'}
          </button>
        </div>
        {status ? (
          <p className={`mt-2 text-xs ${status.type === 'success' ? 'text-emerald-300' : 'text-red-300'}`}>
            {status.message}
          </p>
        ) : null}
      </form>
    </div>
  );
}
