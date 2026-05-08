export const CLIENT_RESPONSE_STATUS = Object.freeze({
  OK: 'ok',
  ERROR: 'error'
});

export function createClientResponse({
  requestId,
  sessionId,
  sceneId,
  status = CLIENT_RESPONSE_STATUS.OK,
  message = '',
  explanation = '',
  sceneResult = null,
  downloadUrl = null,
  errors = [],
  createdAt = new Date().toISOString()
} = {}) {
  return {
    requestId,
    sessionId,
    sceneId,
    status,
    message,
    explanation,
    sceneResult,
    downloadUrl,
    errors,
    createdAt
  };
}

export function validateClientResponse(response) {
  const errors = [];

  if (!response || typeof response !== 'object') {
    return ['Client Response must be an object.'];
  }

  if (!response.requestId) errors.push('Client Response requires requestId.');
  if (!response.sessionId) errors.push('Client Response requires sessionId.');
  if (!response.sceneId) errors.push('Client Response requires sceneId.');
  if (!Object.values(CLIENT_RESPONSE_STATUS).includes(response.status)) {
    errors.push('Client Response has unsupported status.');
  }
  if (!Array.isArray(response.errors)) errors.push('Client Response errors must be an array.');

  return errors;
}
