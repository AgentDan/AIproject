import { useMemo } from 'react';
import { useConfiguratorStore } from '../store/configuratorStore.js';
import { useSceneStore } from '../../../shared/scene/sceneStore.js';
import { deriveGroupOptions } from '../domain/groupOptions.js';

/**
 * Exposes configurator state. groupOptions are derived from sceneData.
 */
export function useConfigurator() {
  const sceneData = useSceneStore((s) => s.sceneData);
  const setSceneData = useSceneStore((s) => s.setSceneData);
  const setSceneDataForRequest = useSceneStore((s) => s.setSceneDataForRequest);
  const modelRequestId = useSceneStore((s) => s.modelRequestId);
  const setModelRequestId = useSceneStore((s) => s.setModelRequestId);
  const selection = useConfiguratorStore((s) => s.selection);
  const setSelection = useConfiguratorStore((s) => s.setSelection);
  const resetSelection = useConfiguratorStore((s) => s.resetSelection);

  const groupOptions = useMemo(
    () => (sceneData ? deriveGroupOptions(sceneData.groups) : {}),
    [sceneData],
  );

  return {
    sceneData,
    setSceneData,
    setSceneDataForRequest,
    modelRequestId,
    setModelRequestId,
    selection,
    setSelection,
    resetSelection,
    groupOptions,
  };
}
