import {
  ACTION_TYPES,
  createActionPlan,
  createActionStep
} from '@ai-product-scene-platform/contracts';

function createPlanId(requestId) {
  return `plan-${requestId}`;
}

function createStepId(requestId, index) {
  return `step-${requestId}-${index}`;
}

function inferDirection(command) {
  const normalizedCommand = command.toLowerCase();

  if (normalizedCommand.includes('right')) return { x: 0.5, y: 0, z: 0 };
  if (normalizedCommand.includes('left')) return { x: -0.5, y: 0, z: 0 };
  if (normalizedCommand.includes('up')) return { x: 0, y: 0.5, z: 0 };
  if (normalizedCommand.includes('down')) return { x: 0, y: -0.5, z: 0 };
  if (normalizedCommand.includes('forward')) return { x: 0, y: 0, z: -0.5 };
  if (normalizedCommand.includes('back')) return { x: 0, y: 0, z: 0.5 };

  return { x: -0.5, y: 0, z: 0 };
}

function inferColor(command) {
  const normalizedCommand = command.toLowerCase();
  const colors = ['red', 'blue', 'green', 'black', 'white', 'yellow', 'cyan', 'purple'];
  return colors.find((color) => normalizedCommand.includes(color)) || 'cyan';
}

function createStepForIntent({ requestId, intent, command, targetObject }) {
  const target = {
    objectId: targetObject?.objectId || 'preview-product'
  };

  if (intent === ACTION_TYPES.MOVE_OBJECT) {
    return createActionStep({
      stepId: createStepId(requestId, 1),
      type: ACTION_TYPES.MOVE_OBJECT,
      target,
      parameters: {
        translation: inferDirection(command),
        unit: 'meters'
      },
      reason: 'Move command detected from voice/text input.'
    });
  }

  if (intent === ACTION_TYPES.CHANGE_OBJECT_COLOR) {
    return createActionStep({
      stepId: createStepId(requestId, 1),
      type: ACTION_TYPES.CHANGE_OBJECT_COLOR,
      target,
      parameters: {
        color: inferColor(command)
      },
      reason: 'Color change command detected from voice/text input.'
    });
  }

  if (intent === ACTION_TYPES.SHOW_BOUNDING_BOXES) {
    return createActionStep({
      stepId: createStepId(requestId, 1),
      type: ACTION_TYPES.SHOW_BOUNDING_BOXES,
      target,
      parameters: {
        visible: true
      },
      reason: 'Bounding box command detected from voice/text input.'
    });
  }

  if (intent === ACTION_TYPES.MEASURE_MESH_DISTANCE) {
    return createActionStep({
      stepId: createStepId(requestId, 1),
      type: ACTION_TYPES.MEASURE_MESH_DISTANCE,
      target,
      parameters: {
        mode: 'nearest-mesh-distance'
      },
      reason: 'Measurement command detected from voice/text input.'
    });
  }

  return createActionStep({
    stepId: createStepId(requestId, 1),
    type: ACTION_TYPES.DOWNLOAD_UPDATED_SCENE,
    target,
    parameters: {
      format: 'glb'
    },
    reason: 'Download/export command detected from voice/text input.'
  });
}

export function generateActionPlan(sceneContext, intentResult, sceneUnderstanding) {
  const command = sceneContext.commandContext.command || '';
  const requestId = sceneContext.commandContext.requestId;
  const step = createStepForIntent({
    requestId,
    intent: intentResult.intent,
    command,
    targetObject: sceneUnderstanding.targetObject
  });

  return createActionPlan({
    planId: createPlanId(requestId),
    requestId,
    sceneId: sceneContext.sceneId,
    intent: intentResult.intent,
    confidence: intentResult.confidence,
    steps: [step],
    assumptions: [
      'MVP AI pipeline uses deterministic rule-based planning until OpenAI integration is connected.',
      'Scene modules will execute and validate this Action Plan in a later roadmap step.'
    ]
  });
}
