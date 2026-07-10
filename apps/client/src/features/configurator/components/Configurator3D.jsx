import { Canvas } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useConfigurator } from '../hooks/useConfigurator.js';
import { ConfiguratorScene } from './ConfiguratorScene.jsx';
import { VariantsPanel } from './VariantsPanel.jsx';
import { PanelLabPanel } from './PanelLabPanel.jsx';
import { ConfiguratorModelsPanel } from './ConfiguratorModelsPanel.jsx';
import { ConfiguratorCommandBar } from './ConfiguratorCommandBar.jsx';
import { useViewerSettingsStore } from '../../../shared/scene/viewerSettingsStore.js';
import { useAiSceneStore } from '../store/aiSceneStore.js';
import { DEFAULT_PANEL_LAB } from '@repo/panelLabSchema';
import { getModelKeyFromLocationSearch } from '../domain/modelKeyFromSearch.js';

const DEF_CAM = DEFAULT_PANEL_LAB.camera;

export function Configurator3D() {
  const { sceneData, setSceneData, resetSelection, modelRequestId, setModelRequestId } = useConfigurator();
  const location = useLocation();
  const modelKey = useMemo(() => getModelKeyFromLocationSearch(location.search), [location.search]);
  const hasModelKey = !!modelKey.trim();
  const isLoading = hasModelKey && sceneData == null;
  const camPx = useViewerSettingsStore((s) => s.panelLab.camera.position[0]);
  const camPy = useViewerSettingsStore((s) => s.panelLab.camera.position[1]);
  const camPz = useViewerSettingsStore((s) => s.panelLab.camera.position[2]);
  const cameraFov = useViewerSettingsStore((s) => s.panelLab.camera.fov);
  const cameraNear = useViewerSettingsStore((s) => s.panelLab.camera.near);
  const cameraFar = useViewerSettingsStore((s) => s.panelLab.camera.far);
  /** Match R3F Canvas `shadows` prop to Panel Lab type so init + soft PCF match saved settings. */
  const canvasShadows = useViewerSettingsStore((s) => {
    const sm = s.panelLab.renderer?.shadowMap;
    if (!sm?.enabled) return false;
    const map = {
      BasicShadowMap: 'basic',
      PCFShadowMap: 'percentage',
      PCFSoftShadowMap: 'soft',
      VSMShadowMap: 'variance',
    };
    return map[sm.type] ?? 'variance';
  });
  const rendererAntialias = useViewerSettingsStore((s) => !!s.panelLab.renderer.antialias);
  const resetToDefaults = useViewerSettingsStore((s) => s.resetToDefaults);

  const canvasCamera = useMemo(
    () => ({
      position: [camPx, camPy, camPz],
      fov: cameraFov,
      near: cameraNear,
      far: cameraFar,
    }),
    [camPx, camPy, camPz, cameraFov, cameraNear, cameraFar],
  );

  const glProps = useMemo(
    () => ({ antialias: rendererAntialias, alpha: true }),
    [rendererAntialias],
  );

  const requestIdRef = useRef(0);
  useLayoutEffect(() => {
    // Enter switching mode: hide the old model until the new one builds sceneData.
    requestIdRef.current += 1;
    const nextId = requestIdRef.current;

    setModelRequestId(nextId);
    setSceneData(null);
    resetSelection();

    // Reset viewer settings so background/environment do not carry over from the previous model.
    resetToDefaults();
    useAiSceneStore.getState().resetLocalState();
  }, [modelKey, resetSelection, setModelRequestId, setSceneData, resetToDefaults]);

  return (
    <div className="relative h-full w-full min-h-0 flex bg-slate-900">
      {isLoading && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-100 text-base z-30 pointer-events-none">
          Loading model…
        </div>
      )}
      <div className="configurator-canvas relative flex-1 min-w-0 min-h-0 h-full">
        <Canvas className="!h-full !w-full" shadows={canvasShadows} camera={canvasCamera} gl={glProps}>
          {hasModelKey ? <ConfiguratorScene modelKey={modelKey} requestId={modelRequestId} /> : null}
        </Canvas>
        <ConfiguratorModelsPanel />
        <PanelLabPanel />
        <VariantsPanel />
        <ConfiguratorCommandBar modelKey={modelKey} />
      </div>
    </div>
  );
}
