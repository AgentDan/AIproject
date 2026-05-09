import http from 'node:http';
import {
  CLIENT_RESPONSE_STATUS,
  COMMAND_INPUT_TYPES,
  createClientRequest,
  createClientResponse,
  validateClientRequest
} from '@ai-product-scene-platform/contracts';
import {
  getStorageStatus,
  recordCommandRequest
} from './storage/local-storage.js';
import { buildSceneContext } from './core/scene-context-builder.js';

const port = process.env.PORT || 3001;

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Content-Type': 'application/json'
  });
  response.end(JSON.stringify(payload));
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';

    request.on('data', (chunk) => {
      body += chunk;
    });

    request.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error('Request body must be valid JSON.'));
      }
    });

    request.on('error', reject);
  });
}

async function handleCommandRequest(request, response) {
  let body;

  try {
    body = await readJsonBody(request);
  } catch (error) {
    sendJson(response, 400, {
      status: CLIENT_RESPONSE_STATUS.ERROR,
      message: error.message,
      errors: [error.message]
    });
    return;
  }

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
    sendJson(response, 400, {
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
    sendJson(response, 500, {
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

  const { sceneContext, validationErrors: sceneContextErrors } =
    await buildSceneContext(clientRequest);

  if (sceneContextErrors.length > 0) {
    sendJson(response, 500, {
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

  sendJson(response, 202, {
    ...createClientResponse({
      requestId: clientRequest.requestId,
      sessionId: clientRequest.sessionId,
      sceneId: clientRequest.sceneId,
      message: 'Command request accepted.',
      explanation: 'The API layer received and stored the voice/text command, then built a Scene Context for future AI processing.'
    }),
    clientRequest,
    storage,
    sceneContext
  });
}

const server = http.createServer(async (request, response) => {
  const { method, url } = request;

  if (method === 'OPTIONS') {
    sendJson(response, 204, {});
    return;
  }

  if (method === 'GET' && url === '/health') {
    sendJson(response, 200, {
      status: 'ok',
      service: 'ai-product-scene-platform-server'
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
    await handleCommandRequest(request, response);
    return;
  }

  sendJson(response, 404, {
    status: CLIENT_RESPONSE_STATUS.ERROR,
    message: 'Route not found.',
    errors: [`${method} ${url} is not supported.`]
  });
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
