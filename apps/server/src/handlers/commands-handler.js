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
        message: 'Ошибка валидации запроса клиента.',
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
        message: 'Не удалось сохранить команду.',
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
        message: 'Ошибка валидации контекста сцены.',
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
        message: 'Ошибка валидации конвейера AI-сервисов.',
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
        message: 'Ошибка валидации конвейера модулей сцены.',
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
      message: 'Команда принята.',
      explanation:
        'Запрос принят: команда сохранена, построен контекст сцены, сформирован проверенный план действий и выполнены модули сцены.',
      sceneResult: sceneModules.sceneResult
    }),
    clientRequest,
    storage,
    sceneContext,
    aiServices,
    sceneModules
  });
}
