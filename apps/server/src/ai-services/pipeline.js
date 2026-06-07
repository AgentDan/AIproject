import { ACTION_TYPES, getIntentEntry } from '@ai-product-scene-platform/ai';
import { buildPrompt } from './prompt-builder.js';
import { detectIntent } from './intent-detector.js';
import { retrieve } from './rag-retriever.js';
import { processSceneUnderstanding } from './scene-understanding-processor.js';
import { generateActionPlan } from './action-plan-generator.js';
import { validateGeneratedActionPlan } from './action-plan-validator.js';
import { parseAiResponse } from './ai-response-parser.js';
import { createFallbackActionPlan } from './ai-fallback-retry-handler.js';

function buildUnknownMeta() {
  return {
    kind: 'unknown',
    message: 'Command not recognized. Say "list commands".'
  };
}

function buildMetaPipelineResult(intent, meta, extras = {}) {
  return {
    prompt: null,
    intent,
    retrievedChunks: [],
    sceneUnderstanding: null,
    actionPlan: null,
    validation: { valid: true, errors: [] },
    usedFallback: false,
    provider: 'local-rule-based-mvp',
    meta,
    ...extras
  };
}

function resolveCommandScope(sceneContext) {
  return sceneContext.commandContext?.clientState?.mode;
}

export async function runAiServicesPipeline(sceneContext) {
  const scope = resolveCommandScope(sceneContext);
  const intent = detectIntent(sceneContext.commandContext.command, scope);
  const entry = getIntentEntry(intent.intent);

  if (intent.intent === ACTION_TYPES.UNKNOWN_COMMAND || entry?.kind === 'meta') {
    return buildMetaPipelineResult(intent, buildUnknownMeta());
  }

  const chunks = await retrieve(sceneContext.commandContext.command);
  const prompt = buildPrompt({ sceneContext, intent, chunks });
  const sceneUnderstanding = processSceneUnderstanding(sceneContext, intent);
  const generatedActionPlan = generateActionPlan(sceneContext, intent, sceneUnderstanding);

  if (!generatedActionPlan) {
    return buildMetaPipelineResult(intent, buildUnknownMeta(), {
      sceneUnderstanding,
      prompt,
      retrievedChunks: chunks
    });
  }

  const parsedResponse = parseAiResponse(generatedActionPlan);
  let validation = validateGeneratedActionPlan(parsedResponse.actionPlan, sceneUnderstanding);
  let actionPlan = parsedResponse.actionPlan;
  let usedFallback = false;

  if (!validation.valid) {
    usedFallback = true;
    actionPlan = createFallbackActionPlan(sceneContext, validation.errors);
    validation = validateGeneratedActionPlan(actionPlan, {
      ...sceneUnderstanding,
      targetObject: sceneUnderstanding.targetObject || sceneContext.objects[0]
    });
  }

  return {
    prompt,
    intent,
    retrievedChunks: chunks,
    sceneUnderstanding,
    actionPlan,
    validation,
    usedFallback,
    provider: 'local-rule-based-mvp'
  };
}
