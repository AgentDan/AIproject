import http from 'node:http';
import { CLIENT_RESPONSE_STATUS } from '@ai-product-scene-platform/contracts';
import { runtimeLabel } from './config/runtime.js';
import { sendJson } from './http/http-util.js';
import { getStorageStatus } from './storage/local-storage.js';
import { handlePostCommands } from './handlers/commands-handler.js';

export function createApp() {
  return http.createServer(async (request, response) => {
    const { method, url } = request;

    if (method === 'OPTIONS') {
      sendJson(response, 204, {});
      return;
    }

    if (method === 'GET' && url === '/health') {
      sendJson(response, 200, {
        status: 'ok',
        service: 'ai-product-scene-platform-server',
        env: runtimeLabel()
      });
      return;
    }

    if (method === 'GET' && url === '/api') {
      sendJson(response, 200, {
        name: 'AI Product Scene Platform API',
        version: '0.1.0',
        endpoints: [
          'GET /health',
          'GET /api',
          'GET /api/storage/status',
          'POST /api/commands'
        ]
      });
      return;
    }

    if (method === 'GET' && url === '/api/storage/status') {
      sendJson(response, 200, await getStorageStatus());
      return;
    }

    if (method === 'POST' && url === '/api/commands') {
      await handlePostCommands(request, response);
      return;
    }

    sendJson(response, 404, {
      status: CLIENT_RESPONSE_STATUS.ERROR,
      message: 'Route not found.',
      errors: [`${method} ${url} is not supported.`]
    });
  });
}
