import { ACTION_TYPES, createActionPlan, createActionStep } from '@ai-product-scene-platform/contracts';

export function createFallbackActionPlan(sceneContext, errors = []) {
  const requestId = sceneContext.commandContext.requestId;

  return createActionPlan({
    planId: `fallback-plan-${requestId}`,
    requestId,
    sceneId: sceneContext.sceneId,
    intent: ACTION_TYPES.SHOW_BOUNDING_BOXES,
    confidence: 0.25,
    steps: [
      createActionStep({
        stepId: `fallback-step-${requestId}-1`,
        type: ACTION_TYPES.SHOW_BOUNDING_BOXES,
        target: { objectId: sceneContext.objects[0]?.objectId || 'preview-product' },
        parameters: { visible: true },
        reason: 'Fallback plan created because primary Action Plan validation failed.'
      })
    ],
    assumptions: [
      'Fallback plan is safe and does not mutate object transforms or materials.',
      ...errors
    ]
  });
}
