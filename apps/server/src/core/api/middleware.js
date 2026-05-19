import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CLIENT_RESPONSE_STATUS } from '@ai-product-scene-platform/contracts';
import { isProduction, corsAllowOrigin } from '../../config/runtime.js';
import { sendJson } from '../../lib/send-json.js';

const __dirnameMw = path.dirname(fileURLToPath(import.meta.url));

export function wrapAsync(fn) {
  return function asyncRoute(req, res, next) {
    Promise.resolve(fn(req, res)).catch(next);
  };
}

export function corsMiddleware(req, res, next) {
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
}

/** Абсолютный путь к `apps/client/dist` или `CLIENT_DIST_PATH`. */
export function resolveClientDistPath() {
  const raw = process.env.CLIENT_DIST_PATH?.trim();
  if (raw) {
    return path.isAbsolute(raw)
      ? path.normalize(raw)
      : path.normalize(path.resolve(process.cwd(), raw));
  }
  return path.resolve(
    __dirnameMw,
    '..',
    '..',
    '..',
    '..',
    '..',
    'apps',
    'client',
    'dist'
  );
}

export function warnProductionClientDistMissing() {
  const dist = resolveClientDistPath();
  const indexHtml = path.join(dist, 'index.html');
  if (!fs.existsSync(indexHtml)) {
    console.warn(
      `[production] Клиент не собран или путь неверён: не найден ${indexHtml}. Выполните «npm run build» в монорепо или задайте CLIENT_DIST_PATH.`
    );
  }
}

export function notFoundApiHandler(req, res) {
  sendJson(res, 404, {
    status: CLIENT_RESPONSE_STATUS.ERROR,
    message: 'Route not found.',
    errors: [`${req.method} ${req.originalUrl} is not supported.`]
  });
}

export function globalErrorHandler(err, req, res, next) {
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
}
