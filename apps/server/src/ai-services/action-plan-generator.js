import {
  ACTION_TYPES,
  createActionPlan,
  createActionStep
} from '@ai-product-scene-platform/contracts';
import { getIntentEntry, isIntentAllowedForScope } from '@ai-product-scene-platform/ai';
import { cloneDefaultPanelLab } from '@ai-product-scene-platform/panel-lab-schema';
import { buildKnobStep } from './knob-plan-builder.js';
import { buildProjectStep } from './project-plan-builder.js';

function resolveProjects(sceneContext) {
  return (
    sceneContext.commandContext?.clientState?.projects ||
    sceneContext.metadata?.configurator?.projects ||
    []
  );
}

function createPlanId(requestId) {
  return `plan-${requestId}`;
}

function createStepId(requestId, index) {
  return `step-${requestId}-${index}`;
}

function resolvePanelLab(sceneContext) {
  return (
    sceneContext.panelLab ||
    sceneContext.metadata?.configurator?.panelLab ||
    cloneDefaultPanelLab()
  );
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

  if (intent === ACTION_TYPES.SELECT_VARIANT) {
    const nums = command.match(/\d+/g)?.map(Number) ?? [];
    const groupId = nums[0] ?? 0;
    const variantIndex = nums[1] ?? 0;
    return createActionStep({
      stepId: createStepId(requestId, 1),
      type: ACTION_TYPES.SELECT_VARIANT,
      target: { objectId: `group-${groupId}` },
      parameters: { groupId, variantIndex },
      reason: `Select variant ${variantIndex} in group ${groupId}.`,
    });
  }

  if (intent === ACTION_TYPES.BUBBLE) {
    return createActionStep({
      stepId: createStepId(requestId, 1),
      type: ACTION_TYPES.BUBBLE,
      target: { objectId: 'assistant-overlay' },
      parameters: { redCircle: true },
      reason: 'Assistant overlay: show centered red circle.'
    });
  }

  if (intent === ACTION_TYPES.CLEAR_BUBBLE) {
    return createActionStep({
      stepId: createStepId(requestId, 1),
      type: ACTION_TYPES.CLEAR_BUBBLE,
      target: { objectId: 'assistant-overlay' },
      parameters: { redCircle: false },
      reason: 'Assistant overlay: remove centered red circle.'
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
  const entry = getIntentEntry(intentResult.intent);
  const scope = sceneContext.commandContext?.clientState?.mode;

  if (entry && !isIntentAllowedForScope(entry, scope)) {
    return null;
  }

  let step;
  if (entry?.kind === 'knob') {
    const panelLab = resolvePanelLab(sceneContext);
    step = buildKnobStep({ requestId, entry, utterance: command, panelLab });
    if (!step) return null;
  } else if (intentResult.intent === ACTION_TYPES.SELECT_PROJECT) {
    step = buildProjectStep({
      requestId,
      utterance: command,
      projects: resolveProjects(sceneContext)
    });
    if (!step) return null;
  } else {
    step = createStepForIntent({
      requestId,
      intent: intentResult.intent,
      command,
      targetObject: sceneUnderstanding.targetObject
    });
  }

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
