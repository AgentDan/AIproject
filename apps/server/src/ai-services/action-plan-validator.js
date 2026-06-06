import { ACTION_TYPES, validateActionPlan } from '@ai-product-scene-platform/contracts';
import {
  cloneDefaultPanelLab,
  deepMerge,
  isValidPanelLabShape,
  normalizePanelLabToEmbedded
} from '@ai-product-scene-platform/panel-lab-schema';

function validatePanelLabStep(step, errors) {
  const patch = step?.parameters?.patch;
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) {
    errors.push('UPDATE_PANEL_LAB requires parameters.patch object');
    return;
  }
  const merged = normalizePanelLabToEmbedded(deepMerge(cloneDefaultPanelLab(), patch));
  if (!isValidPanelLabShape(merged)) {
    errors.push('UPDATE_PANEL_LAB patch does not merge into a valid panelLab shape');
  }
}

export function validateGeneratedActionPlan(actionPlan, sceneUnderstanding) {
  const errors = validateActionPlan(actionPlan);

  for (const step of actionPlan.steps || []) {
    if (step.type === ACTION_TYPES.UPDATE_PANEL_LAB) {
      validatePanelLabStep(step, errors);
    }
  }

  const hasSceneSteps = (actionPlan.steps || []).some(
    (step) => step.type !== ACTION_TYPES.UPDATE_PANEL_LAB
  );

  if (hasSceneSteps) {
    if (!sceneUnderstanding.targetObject) {
      errors.push('Action Plan requires a target object from Scene Understanding.');
    }

    if (sceneUnderstanding.targetObject?.movable === false) {
      errors.push('Target object is not movable for the current MVP action plan.');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
