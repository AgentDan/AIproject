export function applyTransformStep(targetObject, step) {
  const translation = step.parameters?.translation || { x: 0, y: 0, z: 0 };
  const currentPosition = targetObject.transform?.position || { x: 0, y: 0, z: 0 };

  targetObject.transform = {
    ...(targetObject.transform || {}),
    position: {
      x: currentPosition.x + (translation.x || 0),
      y: currentPosition.y + (translation.y || 0),
      z: currentPosition.z + (translation.z || 0)
    }
  };

  return {
    type: 'transform_applied',
    objectId: targetObject.objectId,
    translation,
    position: targetObject.transform.position
  };
}
