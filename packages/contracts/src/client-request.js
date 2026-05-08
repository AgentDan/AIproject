export const COMMAND_INPUT_TYPES = Object.freeze({
  TEXT: 'text',
  VOICE: 'voice'
});

export function createClientRequest({
  requestId,
  sessionId,
  sceneId,
  inputType = COMMAND_INPUT_TYPES.TEXT,
  command,
  clientState = {},
  createdAt = new Date().toISOString()
} = {}) {
  return {
    requestId,
    sessionId,
    sceneId,
    inputType,
    command,
    clientState,
    createdAt
  };
}

export function validateClientRequest(request) {
  const errors = [];

  if (!request || typeof request !== 'object') {
    return ['Client Request must be an object.'];
  }

  if (!request.requestId) errors.push('Client Request requires requestId.');
  if (!request.sessionId) errors.push('Client Request requires sessionId.');
  if (!request.sceneId) errors.push('Client Request requires sceneId.');
  if (!request.command || typeof request.command !== 'string') {
    errors.push('Client Request requires a text command.');
  }
  if (!Object.values(COMMAND_INPUT_TYPES).includes(request.inputType)) {
    errors.push('Client Request inputType must be text or voice.');
  }

  return errors;
}
