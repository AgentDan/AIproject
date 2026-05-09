import { validateActionPlan } from '@ai-product-scene-platform/contracts';

export function validateGeneratedActionPlan(actionPlan, sceneUnderstanding) {
  const errors = validateActionPlan(actionPlan);

  if (!sceneUnderstanding.targetObject) {
    errors.push('Action Plan requires a target object from Scene Understanding.');
  }

  if (sceneUnderstanding.targetObject?.movable === false) {
    errors.push('Target object is not movable for the current MVP action plan.');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
