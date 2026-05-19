import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import {
  CLIENT_RESPONSE_STATUS,
  CLIENT_RESPONSE_TYPE,
  COMMAND_INPUT_TYPES,
  createClientRequest,
  createClientResponse,
  validateClientRequest
} from '@ai-product-scene-platform/contracts';
import { sendJson } from '../../lib/send-json.js';
import {
  getStorageStatus,
  recordCommandRequest
} from '../../storage/local-storage.js';
import { processRequest } from '../orchestrator.js';
import { buildSceneContext } from '../scene-context-builder.js';
import { runAiServicesPipeline } from '../../ai-services/pipeline.js';
import { executeWorkflow } from '../../workflow-engine/index.js';
import { buildAcceptedCommandPayload } from '../output-builder.js';
import {
  isProduction,
  runtimeLabel
} from '../../config/runtime.js';
import {
  wrapAsync,
  notFoundApiHandler,
  resolveClientDistPath
} from './middleware.js';

const __dirnameRoutes = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.join(__dirnameRoutes, '..', '..', '..');
const gltfDir = path.join(serverRoot, 'gltf');

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** POST /api/commands */
async function handlePostCommands(req, res) {
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
        errors: [error instanceof Error ? error.message : String(error)]
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

  const workflowResult = await executeWorkflow(
    sceneContext,
    aiServices.actionPlan
  );

  if (
    workflowResult.validationErrors.length > 0 ||
    !workflowResult.sceneResult.validation.valid
  ) {
    sendJson(res, 500, {
      ...createClientResponse({
        requestId: clientRequest.requestId,
        sessionId: clientRequest.sessionId,
        sceneId: clientRequest.sceneId,
        status: CLIENT_RESPONSE_STATUS.ERROR,
        message: 'Ошибка валидации конвейера модулей сцены.',
        sceneResult: workflowResult.sceneResult,
        errors: [
          ...workflowResult.validationErrors,
          ...workflowResult.sceneResult.validation.errors
        ]
      }),
      clientRequest,
      storage,
      sceneContext,
      aiServices,
      sceneModules: workflowResult
    });
    return;
  }

  sendJson(
    res,
    202,
    buildAcceptedCommandPayload({
      clientRequest,
      storage,
      sceneContext,
      aiServices,
      sceneModules: workflowResult
    })
  );
}

/**
 * Регистрирует HTTP-маршруты и статику (API Layer).
 * @param {import('express').Express} app
 */
export function mountRoutes(app) {
  app.use('/gltf', express.static(gltfDir));

  app.get('/health', (req, res) => {
    sendJson(res, 200, {
      status: 'ok',
      service: 'ai-product-scene-platform-server',
      env: runtimeLabel()
    });
  });

  app.get('/api', (req, res) => {
    sendJson(res, 200, {
      name: 'AI Product Scene Platform API',
      version: '0.1.0',
      endpoints: [
        'GET /health',
        'GET /api',
        'GET /api/storage/status',
        'POST /api/commands'
      ]
    });
  });

  app.get(
    '/api/storage/status',
    wrapAsync(async (req, res) => {
      sendJson(res, 200, await getStorageStatus());
    })
  );

  app.post(
    '/api/commands',
    wrapAsync(async (req, res) => {
      await handlePostCommands(req, res);
    })
  );

  app.use('/api', notFoundApiHandler);

  const clientDistPath = resolveClientDistPath();

  if (isProduction) {
    app.use(
      express.static(clientDistPath, {
        setHeaders: (res, filePath) => {
          if (path.extname(filePath).toLowerCase() === '.html') {
            res.setHeader('Cache-Control', 'no-cache');
          }
        }
      })
    );

    const spaIndexPath = path.join(clientDistPath, 'index.html');
    const spaFallback = (req, res) => {
      res.sendFile(spaIndexPath, (err) => {
        if (err) {
          res
            .status(503)
            .type('text/plain')
            .send(
              'Client bundle not found. Run "npm run build" or set CLIENT_DIST_PATH to apps/client/dist.'
            );
        }
      });
    };

    app.get('*', spaFallback);
    app.head('*', spaFallback);
  } else {
    app.get('*', (req, res) =>
      res.type('text/plain').send('Dev: API only — client runs on Vite.')
    );
  }

  app.use((req, res) => {
    sendJson(res, 404, {
      status: CLIENT_RESPONSE_STATUS.ERROR,
      message: 'Route not found.',
      errors: [`${req.method} ${req.originalUrl} is not supported.`]
    });
  });
}
