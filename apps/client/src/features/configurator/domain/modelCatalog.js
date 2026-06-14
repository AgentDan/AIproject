/**
 * Stable model key for URL `modelKey` and API clientState (matches models panel).
 * @param {{ source?: string, localPath?: string, id?: string, s3Key?: string }} model
 */
export function modelListKey(model) {
  if (model?.source === 'local-gltf') {
    const localPath = String(model?.localPath || model?.id || '');
    const name = localPath.includes('/')
      ? localPath.slice(localPath.lastIndexOf('/') + 1)
      : localPath.replace(/^local:/i, '');
    if (name) {
      return `local:${name}`;
    }
  }
  if (model?.s3Key) {
    return String(model.s3Key);
  }
  return '';
}

/**
 * Voice-command catalog sent with each configurator command request.
 * @param {object[]} models
 * @returns {{ index: number, modelKey: string, title: string }[]}
 */
export function buildProjectCatalog(models) {
  if (!Array.isArray(models)) {
    return [];
  }

  /** @type {{ index: number, modelKey: string, title: string }[]} */
  const catalog = [];

  models.forEach((model, index) => {
    const modelKey = modelListKey(model);
    if (!modelKey) {
      return;
    }
    const titleRaw = (model?.title || '').toString().trim();
    catalog.push({
      index,
      modelKey,
      title: titleRaw || modelKey
    });
  });

  return catalog;
}
