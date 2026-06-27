import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import {
  CLIENT_RESPONSE_STATUS,
  COMMAND_INPUT_TYPES,
  createClientRequest,
  createClientResponse,
  validateClientRequest
} from '@ai-product-scene-platform/contracts';
import { sendJson } from '../../infrastructure/lib/send-json.js';
import { getStorageStatus } from '../../infrastructure/storage/local-storage.js';
import { orchestrateCommand } from '../orchestrator.js';
import { isProduction, runtimeLabel } from '../../infrastructure/config/runtime.js';
import { authRouter } from '../../infrastructure/auth/auth-routes.js';
import { adminRouter } from '../../infrastructure/admin/admin-routes.js';
import { modelsRouter } from '../../infrastructure/models/models-routes.js';
import { s3Router } from '../../infrastructure/cloud-r2/s3-routes.js';
import { authenticate } from '../../infrastructure/auth/auth-middleware.js';
import {
  wrapAsync,
  notFoundApiHandler,
  resolveClientDistPath,
  authRateLimit
} from './middleware.js';

const __dirnameRoutes = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.join(__dirnameRoutes, '..', '..', '..');
const gltfDir = path.join(serverRoot, 'gltf');

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** POST /api/commands — только HTTP; flow в orchestrator. */
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


  if (req.user) {
    clientRequest.clientState = {
      ...clientRequest.clientState,
      auth: { userId: req.user.id, role: req.user.role }
    };
  }

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

  const { statusCode, payload } = await orchestrateCommand(clientRequest);
  sendJson(res, statusCode, payload);
}

/**
 * API layer (схема): маршруты, CORS, JSON — без бизнес-flow.
 * @param {import('express').Express} app
 */
export function mountRoutes(app) {
  app.use('/gltf', express.static(gltfDir));

  app.use('/api/auth', authRateLimit, authRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/models', modelsRouter);
  app.use('/api/s3', s3Router);

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
        'POST /api/commands',
        'POST /api/auth/register',
        'POST /api/auth/login',
        'GET /api/models',
        'GET /api/admin/users',
        'POST /api/admin/lab/from-s3',
        'GET /api/s3/objects'
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
    authenticate({ required: false, rejectInvalidToken: true }),
    wrapAsync(async (req, res) => {
      console.log('handlePostCommands', req.body);
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
