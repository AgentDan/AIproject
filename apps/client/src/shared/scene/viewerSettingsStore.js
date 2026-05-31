import { create } from 'zustand';
import {
  cloneDefaultPanelLab,
  deepMerge,
  normalizePanelLabToEmbedded,
} from '@repo/panelLabSchema';

function patchTopSection(set, key, partial) {
  set((s) => ({
    panelLab: normalizePanelLabToEmbedded(
      deepMerge(s.panelLab, {
        [key]: deepMerge(s.panelLab[key], partial),
      }),
    ),
  }));
}

/** Scene settings: extras.panelLab, version 1 (environment, lighting, ground, renderer, postprocessing, camera, controls). */
export const useViewerSettingsStore = create((set) => ({
  panelLab: cloneDefaultPanelLab(),

  setPanelLab: (panelLab) =>
    set(() => ({
      panelLab: normalizePanelLabToEmbedded(panelLab),
    })),

  patchEnvironment: (partial) => patchTopSection(set, 'environment', partial),
  patchLighting: (partial) => patchTopSection(set, 'lighting', partial),
  patchGround: (partial) => patchTopSection(set, 'ground', partial),
  patchRenderer: (partial) => patchTopSection(set, 'renderer', partial),
  patchPostprocessing: (partial) => patchTopSection(set, 'postprocessing', partial),
  patchCamera: (partial) => patchTopSection(set, 'camera', partial),
  patchControls: (partial) => patchTopSection(set, 'controls', partial),
  patchAnnotations: (partial) => patchTopSection(set, 'annotations', partial),

  resetToDefaults: () => set(() => ({ panelLab: cloneDefaultPanelLab() })),

  hydrateFromPanelLab: (raw) =>
    set(() => ({
      panelLab: normalizePanelLabToEmbedded(raw),
    })),
}));
