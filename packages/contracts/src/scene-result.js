export const SCENE_RESULT_STATUS = Object.freeze({
  SUCCESS: 'success',
  PARTIAL_SUCCESS: 'partial_success',
  FAILED: 'failed'
});

export function createSceneResult({
  resultId,
  requestId,
  sceneId,
  status = SCENE_RESULT_STATUS.SUCCESS,
  updatedSceneUri = null,
  previewUpdate = null,
  sceneDiff = [],
  measurements = [],
  validation = { valid: true, errors: [] },
  createdAt = new Date().toISOString()
} = {}) {
  return {
    resultId,
    requestId,
    sceneId,
    status,
    updatedSceneUri,
    previewUpdate,
    sceneDiff,
    measurements,
    validation,
    createdAt
  };
}

export function validateSceneResult(result) {
  const errors = [];

  if (!result || typeof result !== 'object') {
    return ['Scene Result must be an object.'];
  }

  if (!result.resultId) errors.push('Scene Result requires resultId.');
  if (!result.requestId) errors.push('Scene Result requires requestId.');
  if (!result.sceneId) errors.push('Scene Result requires sceneId.');
  if (!Object.values(SCENE_RESULT_STATUS).includes(result.status)) {
    errors.push('Scene Result has unsupported status.');
  }
  if (!Array.isArray(result.sceneDiff)) errors.push('Scene Result sceneDiff must be an array.');

  return errors;
}
