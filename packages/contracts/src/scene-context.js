export function createSceneContext({
  sceneId,
  sessionId,
  sourceUri,
  objects = [],
  hierarchy = [],
  materials = [],
  metadata = {},
  commandContext = {},
  createdAt = new Date().toISOString()
} = {}) {
  return {
    sceneId,
    sessionId,
    sourceUri,
    objects,
    hierarchy,
    materials,
    metadata,
    commandContext,
    createdAt
  };
}

export function validateSceneContext(context) {
  const errors = [];

  if (!context || typeof context !== 'object') {
    return ['Scene Context must be an object.'];
  }

  if (!context.sceneId) errors.push('Scene Context requires sceneId.');
  if (!context.sessionId) errors.push('Scene Context requires sessionId.');
  if (!Array.isArray(context.objects)) errors.push('Scene Context objects must be an array.');
  if (!Array.isArray(context.hierarchy)) errors.push('Scene Context hierarchy must be an array.');
  if (!Array.isArray(context.materials)) errors.push('Scene Context materials must be an array.');

  return errors;
}
