export function applyMaterialStep(targetObject, step) {
  const color = step.parameters?.color || 'cyan';

  targetObject.material = {
    ...(targetObject.material || {}),
    color
  };

  return {
    type: 'material_applied',
    objectId: targetObject.objectId,
    color
  };
}
