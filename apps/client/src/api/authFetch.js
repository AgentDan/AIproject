import { resolveApiUrl } from './client.js';
import { useAuthStore } from '../features/auth/store/authStore.js';

/**
 * @param {Record<string, string>} [extra]
 * @returns {Record<string, string>}
 */
export function getAuthHeaders(extra = {}) {
  const token = useAuthStore.getState().token;
  const headers = { ...extra };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

/**
 * fetch without Authorization (login, public register).
 * @param {string} url
 * @param {RequestInit} [options]
 */
export function publicFetch(url, options = {}) {
  return fetch(resolveApiUrl(url), options);
}

/**
 * fetch with Authorization header when token is stored.
 * @param {string} url
 * @param {RequestInit} [options]
 */
export function authFetch(url, options = {}) {
  const headers = getAuthHeaders(
    options.headers && typeof options.headers === 'object' && !Array.isArray(options.headers)
      ? /** @type {Record<string, string>} */ (options.headers)
      : {}
  );
  return fetch(resolveApiUrl(url), { ...options, headers });
}
