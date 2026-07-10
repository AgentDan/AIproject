import { ACTION_TYPES } from '@ai-product-scene-platform/contracts';

export function validateProductRules(step, targetObject) {
  const errors = [];

  if (!targetObject) {
    errors.push(`Target object ${step.target?.objectId || 'unknown'} was not found.`);
    return errors;
  }

  if (step.type === ACTION_TYPES.MOVE_OBJECT && targetObject.movable === false) {
    errors.push(`Target object ${targetObject.objectId} is not movable.`);
  }

  return errors;
}
