import { resolveApiUrl } from '../../../api/client.js';

/**
 * Resolve a model key from the URL or models API to a fetchable URL.
 * S3/R2 keys (from Mongo) → stream API; `local:Box.gltf` → `/gltf/` static.
 *
 * @param {string} modelKey
 * @returns {string | null}
 */
export function resolveModelUrl(modelKey) {
  const key = String(modelKey || '').trim();
  if (!key) {
    return null;
  }
  if (key.startsWith('/')) {
    return resolveApiUrl(key);
  }
  if (/^local:/i.test(key)) {
    const name = key.slice(6);
    return resolveApiUrl(`/gltf/${encodeURIComponent(name)}`);
  }
  // Same as mvp3dcursor: model keys from /api/models are S3 object keys
  return resolveApiUrl(`/api/s3/model/${encodeURIComponent(key)}`);
}
