import { create } from 'zustand';

/**
 * Shared 3D scene data store.
 *
 * SceneData is shared between Configurator and Panel Lab.
 *
 * @typedef {import('../../features/configurator/application/buildConfiguration.js').SceneData} SceneData
 */

export const useSceneStore = create((set) => ({
  /** @type {SceneData | null} */
  sceneData: null,
  /**
   * Id of the latest model load request in the configurator (stale responses ignored).
   * @type {number}
   */
  modelRequestId: 0,
  /** @param {SceneData | null} data */
  setSceneData: (data) => set({ sceneData: data }),
  /** @param {number} id */
  setModelRequestId: (id) => set({ modelRequestId: id }),
  /**
   * Set sceneData only when `id` matches the latest model request.
   * @param {number} id
   * @param {SceneData | null} data
   */
  setSceneDataForRequest: (id, data) =>
    set((state) => (state.modelRequestId === id ? { sceneData: data } : {})),
}));

