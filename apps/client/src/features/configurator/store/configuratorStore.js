import { create } from 'zustand';

/**
 * @typedef {import('../domain/types.js').Selection} Selection
 */

/**
 * Configurator UI state (variant selection only).
 *
 * `sceneData` lives in `useSceneStore` and is shared with Panel Lab.
 *
 * @type {import('zustand').Store<{
 *   selection: Selection,
 *   projects: { index: number, modelKey: string, title: string }[],
 *   setSelection: (v: Partial<Selection> | ((p: Selection) => Partial<Selection>)) => void,
 *   setProjects: (projects: { index: number, modelKey: string, title: string }[]) => void,
 * }>}
 */
export const useConfiguratorStore = create((set) => ({
  selection: {},
  projects: [],
  setSelection: (v) =>
    set((state) => ({
      selection: {
        ...state.selection,
        ...(typeof v === 'function' ? v(state.selection) : v),
      },
    })),
  setProjects: (projects) =>
    set({ projects: Array.isArray(projects) ? projects : [] }),
  resetSelection: () => set({ selection: {} }),
}));
