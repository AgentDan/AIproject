export const DEFAULT_CONFIGURATOR_MODEL_KEY = '';

/**
 * Model key from query string (`labKey` wins over `modelKey`).
 *
 * @param {string} search
 * @returns {string}
 */
export function getModelKeyFromLocationSearch(search) {
  const params = new URLSearchParams(search);
  const labKey = params.get('labKey');
  if (labKey && labKey.trim()) return labKey.trim();

  const modelKey = params.get('modelKey');
  if (modelKey && modelKey.trim()) return modelKey.trim();

  return DEFAULT_CONFIGURATOR_MODEL_KEY;
}
