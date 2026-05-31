/**
 * Resolve a model key from the URL or models API to a fetchable URL.
 * Local dev: bare filenames load from `/gltf/`; S3 keys use the stream API.
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
    return key;
  }
  if (/^local:/i.test(key)) {
    return `/gltf/${key.slice(6)}`;
  }
  if (/\.(gltf|glb)$/i.test(key) && !key.includes('/')) {
    return `/gltf/${encodeURIComponent(key)}`;
  }
  return `/api/s3/model/${encodeURIComponent(key)}`;
}
