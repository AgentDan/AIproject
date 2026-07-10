/**
 * HTTP-клиент к Platform API (клиент не знает про AI / Scene Modules — только контракт запроса).
 */
import { useAuthStore } from '../features/auth/store/authStore.js';

export function resolveApiUrl(path) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  const base = getApiBaseUrl();
  return base ? `${base}${path}` : path;
}

export function getApiBaseUrl() {
  const rawEnvApi = import.meta.env.VITE_API_URL;
  const configuredApi = typeof rawEnvApi === 'string' ? rawEnvApi.trim() : '';
  if (configuredApi !== '') {
    return configuredApi;
  }
  if (import.meta.env.DEV) {
    // Тот же хост, что у Vite (localhost или 192.168.x.x из --host), порт API — 3001
    if (typeof window !== 'undefined' && window.location.hostname) {
      return `http://${window.location.hostname}:3001`;
    }
    return 'http://localhost:3001';
  }
  return '';
}

/**
 * @param {{
 *   command: string,
 *   inputType: string,
 *   clientState?: Record<string, unknown>,
 *   extraHeaders?: Record<string, string>
 * }} body
 */
async function fetchCommand(apiBaseUrl, body, extraHeaders = {}) {
  const apiResponse = await fetch(`${apiBaseUrl}/api/commands`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
    body: JSON.stringify(body)
  });

  let payload;
  try {
    payload = await apiResponse.json();
  } catch {
    throw new Error(
      `Bad response (${apiResponse.status}). Expected JSON from /api/commands.`
    );
  }

  return { apiResponse, payload };
}

export async function postCommand({ command, inputType, clientState, extraHeaders = {} }) {
  const apiBaseUrl = getApiBaseUrl();
  const body = { command, inputType, clientState };
  let result = await fetchCommand(apiBaseUrl, body, extraHeaders);

  const staleToken =
    result.apiResponse.status === 401 &&
    typeof result.payload?.message === 'string' &&
    /invalid or expired token/i.test(result.payload.message);

  if (staleToken && extraHeaders.Authorization) {
    useAuthStore.getState().logout();
    const { Authorization: _drop, ...withoutAuth } = extraHeaders;
    result = await fetchCommand(apiBaseUrl, body, withoutAuth);
  }

  return result;
}
