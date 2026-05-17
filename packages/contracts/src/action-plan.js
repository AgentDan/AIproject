import { ACTION_TYPES } from '@ai-product-scene-platform/ai';

export { ACTION_TYPES };

export function createActionStep({
  stepId,
  type,
  target = {},
  parameters = {},
  reason = ''
} = {}) {
  return {
    stepId,
    type,
    target,
    parameters,
    reason
  };
}

export function createActionPlan({
  planId,
  requestId,
  sceneId,
  intent,
  confidence = 0,
  steps = [],
  assumptions = [],
  createdAt = new Date().toISOString()
} = {}) {
  return {
    planId,
    requestId,
    sceneId,
    intent,
    confidence,
    steps,
    assumptions,
    createdAt
  };
}

export function validateActionPlan(plan) {
  const errors = [];

  if (!plan || typeof plan !== 'object') {
    return ['Action Plan must be an object.'];
  }

  if (!plan.planId) errors.push('Action Plan requires planId.');
  if (!plan.requestId) errors.push('Action Plan requires requestId.');
  if (!plan.sceneId) errors.push('Action Plan requires sceneId.');
  if (!plan.intent) errors.push('Action Plan requires intent.');
  if (!Array.isArray(plan.steps)) errors.push('Action Plan steps must be an array.');

  for (const [index, step] of (plan.steps || []).entries()) {
    if (!step.stepId) errors.push(`Action Plan step ${index} requires stepId.`);
    if (!Object.values(ACTION_TYPES).includes(step.type)) {
      errors.push(`Action Plan step ${index} has unsupported action type.`);
    }
  }

  return errors;
}
