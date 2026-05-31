import { create } from 'zustand';
import { CONFIGURATOR_ROOT_OBJECT_ID, buildConfiguratorClientState } from '../domain/aiSceneBridge.js';

const defaultRootState = {
  transform: {
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 }
  },
  material: { color: 'cyan' }
};

export const useAiSceneStore = create((set, get) => ({
  /** @type {object[] | null} */
  pendingServerObjects: null,
  /** @type {Record<string, { transform: object, material: object }>} */
  localObjectStates: {
    [CONFIGURATOR_ROOT_OBJECT_ID]: defaultRootState
  },

  resetLocalState: () =>
    set({
      localObjectStates: { [CONFIGURATOR_ROOT_OBJECT_ID]: defaultRootState },
      pendingServerObjects: null
    }),

  queueServerObjects: (objects) => set({ pendingServerObjects: objects }),

  consumePending: () => {
    const pending = get().pendingServerObjects;
    set({ pendingServerObjects: null });
    return pending;
  },

  patchLocalFromServer: (objects) => {
    if (!Array.isArray(objects) || objects.length === 0) {
      return;
    }
    set((state) => {
      const next = { ...state.localObjectStates };
      for (const obj of objects) {
        if (!obj?.objectId) continue;
        next[obj.objectId] = {
          transform: obj.transform || next[obj.objectId]?.transform || defaultRootState.transform,
          material: obj.material || next[obj.objectId]?.material || defaultRootState.material
        };
      }
      return { localObjectStates: next };
    });
  },

  buildClientState: ({ modelKey, selection, panelLab, sceneData }) =>
    buildConfiguratorClientState({
      modelKey,
      selection,
      panelLab,
      sceneData,
      localObjectStates: get().localObjectStates
    })
}));
