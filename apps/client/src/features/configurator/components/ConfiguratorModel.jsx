import { useMemo, useEffect, useLayoutEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useGLTF } from '@react-three/drei';
import { buildConfiguration } from '../application/buildConfiguration.js';
import { updateConfiguration } from '../application/updateConfiguration.js';
import { useConfigurator } from '../hooks/useConfigurator.js';
import { useViewerSettingsStore } from '../../../shared/scene/viewerSettingsStore.js';
import { deriveGroupOptions } from '../domain/groupOptions.js';
import { resolveModelUrl } from '../domain/resolveModelUrl.js';
import { tagAiObjectIds } from '../domain/aiSceneBridge.js';

export function ConfiguratorModel({ modelKey, requestId }) {
  const {
    setSceneDataForRequest,
    modelRequestId,
    selection,
  } = useConfigurator();

  const modelUrl = resolveModelUrl(modelKey);
  const gltf = useGLTF(modelUrl);
  const { scene } = gltf;

  const hydrateFromPanelLab = useViewerSettingsStore((s) => s.hydrateFromPanelLab);
  const resetViewerToDefaults = useViewerSettingsStore((s) => s.resetToDefaults);

  // important:
  // `useGLTF` caches and may reuse the same `scene` instance across switches.
  // If we reuse the same object reference, R3F can keep an old attachment/visibility state.
  // Cloning guarantees that each switch renders a fresh object in the scene graph.
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.userData.configuratorRoot = true;
    return clone;
  }, [scene]);

  const meshShadowsOn = useViewerSettingsStore(
    useShallow((s) => {
      const pl = s.panelLab;
      const shadowsEnabled = !!pl.lighting?.shadows?.enabled;
      const directionalCasts = !!pl.lighting?.directional?.enabled && pl.lighting?.directional?.castShadow !== false;
      const directionalExtraCasts = Array.isArray(pl.lighting?.directionalLights)
        ? pl.lighting.directionalLights.some((l) => l && l.enabled !== false && l.castShadow !== false)
        : false;
      const pointCasts = Array.isArray(pl.lighting?.pointLights)
        ? pl.lighting.pointLights.some((l) => l && l.enabled !== false && l.castShadow !== false)
        : false;
      const spotCasts = Array.isArray(pl.lighting?.spotLights)
        ? pl.lighting.spotLights.some((l) => l && l.enabled !== false && l.castShadow !== false)
        : false;
      return (
        !!pl.renderer?.shadowMap?.enabled &&
        shadowsEnabled &&
        (directionalCasts || directionalExtraCasts || pointCasts || spotCasts)
      );
    }),
  );

  // Apply embedded panelLab before paint so mesh shadow flags (useEffect below) see the hydrated store.
  useLayoutEffect(() => {
    if (modelRequestId !== requestId) return;

    resetViewerToDefaults();

    const extrasPanelLab =
      gltf?.parser?.json?.extras?.panelLab ?? gltf?.userData?.gltf?.extras?.panelLab;

    if (extrasPanelLab && typeof extrasPanelLab === 'object') {
      hydrateFromPanelLab(extrasPanelLab);
    }
  }, [gltf, hydrateFromPanelLab, modelKey, modelRequestId, resetViewerToDefaults, requestId]);

  useLayoutEffect(() => {
    clonedScene.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = meshShadowsOn;
        obj.receiveShadow = meshShadowsOn;
      }
    });
  }, [clonedScene, meshShadowsOn]);

  const { sceneData: built } = useMemo(() => buildConfiguration(clonedScene), [clonedScene]);
  const localGroupOptions = useMemo(() => deriveGroupOptions(built.groups), [built]);

  useEffect(() => {
    // Write sceneData only for the current load request.
    setSceneDataForRequest(requestId, built);
  }, [built, requestId, modelRequestId, setSceneDataForRequest]);

  useEffect(() => {
    // Apply visibility from local `built` to avoid desync between the rendered scene and store sceneData.
    if (modelRequestId !== requestId) return;
    updateConfiguration(selection, localGroupOptions, built);
    tagAiObjectIds(clonedScene, built, selection);
  }, [selection, localGroupOptions, built, modelRequestId, requestId, clonedScene]);

  return <primitive object={clonedScene} />;
}
