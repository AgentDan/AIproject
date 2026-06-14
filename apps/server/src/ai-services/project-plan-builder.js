import { ACTION_TYPES, createActionStep } from '@ai-product-scene-platform/contracts';

/**
 * Resolve project / model selection from utterance + client project catalog.
 * @param {string} utterance
 * @param {{ index?: number, modelKey?: string, title?: string }[]} projects
 * @returns {{ index: number, modelKey: string, title: string } | null}
 */
export function inferProjectSelection(utterance = '', projects = []) {  if (!Array.isArray(projects) || projects.length === 0) {
    return null;
  }

  const normalized = String(utterance).toLowerCase().trim();

  const byTitle = [...projects]
    .filter((entry) => {
      const title = String(entry?.title || '').trim().toLowerCase();
      return title.length > 1 && normalized.includes(title);
    })
    .sort((a, b) => String(b.title).length - String(a.title).length);

  if (byTitle[0]?.modelKey) {
    return {
      index: Number(byTitle[0].index),
      modelKey: String(byTitle[0].modelKey),
      title: String(byTitle[0].title || byTitle[0].modelKey)
    };
  }

  const indexMatch = normalized.match(/(?:project|model|проект)\s*(\d+)/i);
  if (indexMatch) {
    const spoken = Number(indexMatch[1]);
    const idx =
      spoken >= 1 && spoken <= projects.length ? spoken - 1 : spoken;
    const entry = projects[idx];
    if (entry?.modelKey) {
      return {
        index: idx,
        modelKey: String(entry.modelKey),
        title: String(entry.title || entry.modelKey)
      };
    }
  }

  const nums = utterance.match(/\d+/g)?.map(Number) ?? [];
  if (nums.length >= 1) {
    const idx = nums[0];
    const entry = projects[idx];
    if (entry?.modelKey) {
      return {
        index: idx,
        modelKey: String(entry.modelKey),
        title: String(entry.title || entry.modelKey)
      };
    }
  }

  return null;
}

/**
 * @param {{ requestId: string, utterance: string, projects?: object[] }} args
 */
export function buildProjectStep({ requestId, utterance, projects }) {
  const resolved = inferProjectSelection(utterance, projects);
  if (!resolved) {
    return null;
  }

  return createActionStep({
    stepId: `step-${requestId}-1`,
    type: ACTION_TYPES.SELECT_PROJECT,
    target: { objectId: 'configurator-project' },
    parameters: {
      projectIndex: resolved.index,
      modelKey: resolved.modelKey,
      title: resolved.title
    },
    reason: `Select project "${resolved.title}" (${resolved.modelKey}).`
  });
}
