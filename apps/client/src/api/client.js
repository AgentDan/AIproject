/**
 * HTTP-клиент к Platform API (клиент не знает про AI / Scene Modules — только контракт запроса).
 */

export function getApiBaseUrl() {
  const rawEnvApi = import.meta.env.VITE_API_URL;
  const configuredApi = typeof rawEnvApi === 'string' ? rawEnvApi.trim() : '';
  if (configuredApi !== '') {
    return configuredApi;
  }
  return import.meta.env.DEV ? 'http://localhost:3001' : '';
}

/**
 * @param {{
 *   command: string,
 *   inputType: string,
 *   clientState?: Record<string, unknown>
 * }} body
 */
export async function postCommand(body) {
  const apiBaseUrl = getApiBaseUrl();
  const apiResponse = await fetch(`${apiBaseUrl}/api/commands`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
