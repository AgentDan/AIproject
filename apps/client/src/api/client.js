/**
 * HTTP-клиент к Platform API (клиент не знает про AI / Scene Modules — только контракт запроса).
 */

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
export async function postCommand({ command, inputType, clientState, extraHeaders = {} }) {
  const apiBaseUrl = getApiBaseUrl();
  const apiResponse = await fetch(`${apiBaseUrl}/api/commands`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
    body: JSON.stringify({ command, inputType, clientState })
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
