import { useCallback, useEffect, useRef, useState } from 'react';
import { postCommand } from '../../../api/client.js';
import { getAuthHeaders } from '../../../api/authFetch.js';
import { useSceneStore } from '../../../shared/scene/sceneStore.js';
import { useConfiguratorStore } from '../store/configuratorStore.js';
import { useAiSceneStore } from '../store/aiSceneStore.js';
import { useViewerSettingsStore } from '../../../shared/scene/viewerSettingsStore.js';
import CommandBar from '../../../widgets/CommandBar.jsx';
import ResultViewer from '../../../widgets/ResultViewer.jsx';
import { buildServerNoticeFromPayload } from '../../../shared/commandResponseNotice.js';

export function ConfiguratorCommandBar({ modelKey }) {
  const [serverNotice, setServerNotice] = useState(null);
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

  const selection = useConfiguratorStore((s) => s.selection);
  const panelLab = useViewerSettingsStore((s) => s.panelLab);
  const sceneData = useSceneStore((s) => s.sceneData);

  const handleSubmit = useCallback(
    async ({ command, inputType }) => {
      if (!command) {
        setServerNotice({
          type: 'error',
          title: 'No command detected',
          message:
            'Use the round button or Enter: when empty, speak; when there is text, send.'
        });
        return false;
      }

      try {
        const clientState = useAiSceneStore.getState().buildClientState({
          modelKey,
          selection,
          panelLab,
          sceneData,
          mode: 'panel-lab'
        });

        const { apiResponse, payload } = await postCommand({
          command,
          inputType,
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

        const panelLabUpdate = payload?.sceneResult?.previewUpdate?.panelLab;
        if (panelLabUpdate) {
          useViewerSettingsStore.getState().hydrateFromPanelLab(panelLabUpdate);
        }

        if (payload?.responseType === 'help' || payload?.data?.kind === 'unknown') {
          setServerNotice(buildServerNoticeFromPayload(payload));
          return true;
        }

        setServerNotice({
          type: 'success',
          message: payload.explanation || payload.message || 'Команда применена к 3D-сцене.'
        });
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setServerNotice({
          type: 'error',
          title: 'Command error',
          message
        });
        return false;
      }
    },
    [modelKey, panelLab, sceneData, selection]
  );

  if (!modelKey) {
    return null;
  }

  return (
    <>
      <ResultViewer serverNotice={serverNotice} serverNoticeRef={serverNoticeRef} />
      <CommandBar
        inputId="configurator-command-input"
        placeholder="Type command"
        onSubmit={handleSubmit}
      />
    </>
  );
}
