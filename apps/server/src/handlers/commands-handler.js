import {
  CLIENT_RESPONSE_STATUS,
  CLIENT_RESPONSE_TYPE,
  COMMAND_INPUT_TYPES,
  createClientRequest,
  createClientResponse,
  validateClientRequest
} from '@ai-product-scene-platform/contracts';
import { recordCommandRequest } from '../storage/local-storage.js';
import { processRequest } from '../core/orchestrator.js';
import { buildSceneContext } from '../core/scene-context-builder.js';
import { runAiServicesPipeline } from '../ai-services/pipeline.js';
import { executeSceneModulesPipeline } from '../scene-modules/pipeline.js';
import { sendJson } from '../lib/send-json.js';

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** POST /api/commands — полная обработка команды (валидируем, сохраняем, пайплайн). */
export async function handlePostCommands(req, res) {
  const body =
    req.body !== undefined && req.body !== null && typeof req.body === 'object'
      ? req.body
      : {};

  const clientRequest = createClientRequest({
    requestId: body.requestId || createId('request'),
    sessionId: body.sessionId || 'local-session',
    sceneId: body.sceneId || 'preview-scene',
    inputType: body.inputType || COMMAND_INPUT_TYPES.TEXT,
    command: body.command,
    clientState: body.clientState || {}
  });

  const validationErrors = validateClientRequest(clientRequest);

  if (validationErrors.length > 0) {
    sendJson(res, 400, {
      ...createClientResponse({
        requestId: clientRequest.requestId,
        sessionId: clientRequest.sessionId,
        sceneId: clientRequest.sceneId,
        status: CLIENT_RESPONSE_STATUS.ERROR,
        message: 'Client Request validation failed.',
        errors: validationErrors
      })
    });
    return;
  }

  let storage;

  try {
    storage = await recordCommandRequest(clientRequest);
  } catch (error) {
    sendJson(res, 500, {
      ...createClientResponse({
        requestId: clientRequest.requestId,
        sessionId: clientRequest.sessionId,
        sceneId: clientRequest.sceneId,
        status: CLIENT_RESPONSE_STATUS.ERROR,
        message: 'Command request could not be stored.',
        errors: [error.message]
      })
    });
    return;
  }

  const earlyOutcome = processRequest(clientRequest, storage);

  if (earlyOutcome.completed) {
    sendJson(res, earlyOutcome.statusCode, earlyOutcome.payload);
    return;
  }

  const { sceneContext, validationErrors: sceneContextErrors } =
    await buildSceneContext(clientRequest);

  if (sceneContextErrors.length > 0) {
    sendJson(res, 500, {
      ...createClientResponse({
        requestId: clientRequest.requestId,
        sessionId: clientRequest.sessionId,
        sceneId: clientRequest.sceneId,
        status: CLIENT_RESPONSE_STATUS.ERROR,
        message: 'Scene Context validation failed.',
        errors: sceneContextErrors
      }),
      clientRequest,
      storage
    });
    return;
  }

  const aiServices = await runAiServicesPipeline(sceneContext);

  if (!aiServices.validation.valid) {
    sendJson(res, 500, {
      ...createClientResponse({
        requestId: clientRequest.requestId,
        sessionId: clientRequest.sessionId,
        sceneId: clientRequest.sceneId,
        status: CLIENT_RESPONSE_STATUS.ERROR,
        message: 'AI Services pipeline validation failed.',
        errors: aiServices.validation.errors
      }),
      clientRequest,
      storage,
      sceneContext,
      aiServices
    });
    return;
  }

  const sceneModules = await executeSceneModulesPipeline(
    sceneContext,
    aiServices.actionPlan
  );

  if (
    sceneModules.validationErrors.length > 0 ||
    !sceneModules.sceneResult.validation.valid
  ) {
    sendJson(res, 500, {
      ...createClientResponse({
        requestId: clientRequest.requestId,
        sessionId: clientRequest.sessionId,
        sceneId: clientRequest.sceneId,
        status: CLIENT_RESPONSE_STATUS.ERROR,
        message: 'Scene Modules pipeline validation failed.',
        sceneResult: sceneModules.sceneResult,
        errors: [
          ...sceneModules.validationErrors,
          ...sceneModules.sceneResult.validation.errors
        ]
      }),
      clientRequest,
      storage,
      sceneContext,
      aiServices,
      sceneModules
    });
    return;
  }

  sendJson(res, 202, {
    ...createClientResponse({
      requestId: clientRequest.requestId,
      sessionId: clientRequest.sessionId,
      sceneId: clientRequest.sceneId,
      responseType: CLIENT_RESPONSE_TYPE.SCENE,
      message: 'Command request accepted.',
      explanation:
        'Hello world! The API layer received and stored the voice/text command, built a Scene Context, generated a validated Action Plan, and executed it through Scene Modules.',
      sceneResult: sceneModules.sceneResult
    }),
    clientRequest,
    storage,
    sceneContext,
    aiServices,
    sceneModules
  });
}
