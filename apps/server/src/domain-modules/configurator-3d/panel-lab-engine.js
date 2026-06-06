import {
  deepMerge,
  normalizePanelLabToEmbedded,
  cloneDefaultPanelLab
} from '@ai-product-scene-platform/panel-lab-schema';

function changedPaths(before, after, prefix = '', acc = []) {
  for (const k of Object.keys(after || {})) {
    const p = prefix ? `${prefix}.${k}` : k;
    const a = after[k];
    const b = before ? before[k] : undefined;
    if (a && typeof a === 'object' && !Array.isArray(a)) changedPaths(b, a, p, acc);
    else if (JSON.stringify(a) !== JSON.stringify(b)) acc.push({ path: p, before: b, after: a });
  }
  return acc;
}

function resolvePanelLab(sceneContext) {
  return (
    sceneContext.panelLab ||
    sceneContext.metadata?.configurator?.panelLab ||
    cloneDefaultPanelLab()
  );
}

/** Apply all UPDATE_PANEL_LAB steps on top of the current panelLab in one pass. */
export function applyPanelLabSteps(sceneContext, steps) {
  const current = normalizePanelLabToEmbedded(resolvePanelLab(sceneContext));
  let working = current;
  for (const step of steps) {
    const patch = step?.parameters?.patch;
    if (patch && typeof patch === 'object') working = deepMerge(working, patch);
  }
  const next = normalizePanelLabToEmbedded(working);
  return {
    panelLab: next,
    diff: changedPaths(current, next),
    previewUpdate: { panelLab: next }
  };
}
