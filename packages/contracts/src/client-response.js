import { validateHelpResponse } from './help-response.js';

export const CLIENT_RESPONSE_STATUS = Object.freeze({
  OK: 'ok',
  ERROR: 'error'
});

export const CLIENT_RESPONSE_TYPE = Object.freeze({
  SCENE: 'scene',
  HELP: 'help'
});

export function createClientResponse({
  requestId,
  sessionId,
  sceneId,
  status = CLIENT_RESPONSE_STATUS.OK,
  responseType = CLIENT_RESPONSE_TYPE.SCENE,
  message = '',
  explanation = '',
  sceneResult = null,
  downloadUrl = null,
  errors = [],
  help = null,
  createdAt = new Date().toISOString()
} = {}) {
  return {
    requestId,
    sessionId,
    sceneId,
    status,
    responseType,
    message,
    explanation,
    sceneResult,
    downloadUrl,
    errors,
    help,
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
  if (!Object.values(CLIENT_RESPONSE_TYPE).includes(response.responseType)) {
    errors.push('Client Response has unsupported responseType.');
  }
  if (!Array.isArray(response.errors)) errors.push('Client Response errors must be an array.');

  if (response.responseType === CLIENT_RESPONSE_TYPE.HELP) {
    errors.push(...validateHelpResponse(response.help));
  }

  return errors;
}
