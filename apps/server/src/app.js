import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { CLIENT_RESPONSE_STATUS } from '@ai-product-scene-platform/contracts';
import { resolveClientDistPath } from './config/client-dist.js';
import { corsAllowOrigin, isProduction, runtimeLabel } from './config/runtime.js';
import { sendJson } from './lib/send-json.js';
import { handlePostCommands } from './handlers/commands-handler.js';
import { getStorageStatus } from './storage/local-storage.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function wrapAsync(fn) {
  return function asyncRoute(req, res, next) {
    Promise.resolve(fn(req, res)).catch(next);
  };
}

export function createApp() {
  const app = express();

  app.disable('x-powered-by');

  // CORS for the client (Vite runs on another port in dev)
  app.use((req, res, next) => {
    const allowOrigin = isProduction ? corsAllowOrigin() : '*';
    res.setHeader('Access-Control-Allow-Origin', allowOrigin);
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, PATCH, DELETE, OPTIONS'
    );
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    );
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  app.use(express.json({ limit: '1mb' }));

  // Static GLTF models (apps/server/gltf/)
  app.use('/gltf', express.static(path.join(__dirname, '..', 'gltf')));

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

  app.use('/api', (req, res) => {
    sendJson(res, 404, {
      status: CLIENT_RESPONSE_STATUS.ERROR,
      message: 'Route not found.',
      errors: [`${req.method} ${req.originalUrl} is not supported.`]
    });
  });

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

    // Express 4: catch-all SPA (в эталоне Express 5: app.get('/{*splat}', …))
    app.get('*', spaFallback);
    app.head('*', spaFallback);
  } else {
    app.get('*', (req, res) => res.type('text/plain').send('Please set to production'));
  }

  app.use((req, res) => {
    sendJson(res, 404, {
      status: CLIENT_RESPONSE_STATUS.ERROR,
      message: 'Route not found.',
      errors: [`${req.method} ${req.originalUrl} is not supported.`]
    });
  });

  app.use((err, req, res, next) => {
    if (err.status === 400 && err.type === 'entity.parse.failed') {
      sendJson(res, 400, {
        status: CLIENT_RESPONSE_STATUS.ERROR,
        message: 'Request body must be valid JSON.',
        errors: ['Request body must be valid JSON.']
      });
      return;
    }

    if (res.headersSent) {
      next(err);
      return;
    }

    sendJson(res, 500, {
      status: CLIENT_RESPONSE_STATUS.ERROR,
      message: 'Internal Server Error.',
      errors: ['An unexpected error occurred.']
    });
  });

  return app;
}
