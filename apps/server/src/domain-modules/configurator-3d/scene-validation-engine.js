export function validateSceneState(sceneGraph) {
  const errors = [];

  if (!sceneGraph.sceneId) {
    errors.push('Scene graph requires sceneId.');
  }

  if (!Array.isArray(sceneGraph.objects)) {
    errors.push('Scene graph objects must be an array.');
  }

  for (const object of sceneGraph.objects || []) {
    if (!object.objectId) {
      errors.push('Every scene object requires objectId.');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
