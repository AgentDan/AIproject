import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { CLIENT_RESPONSE_STATUS } from '@ai-product-scene-platform/contracts';
import { corsAllowOrigin } from '../../infrastructure/config/runtime.js';
import { sendJson } from '../../infrastructure/lib/send-json.js';

export { authenticate, requireRole } from '../../infrastructure/auth/auth-middleware.js';

const __dirnameMw = path.dirname(fileURLToPath(import.meta.url));

function readPositiveInt(raw, fallback) {
  const n = Number.parseInt(String(raw ?? ''), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/** Лимит на /api/auth (register, login). */
export const authRateLimit = rateLimit({
  windowMs: readPositiveInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
  max: readPositiveInt(process.env.AUTH_RATE_LIMIT_MAX, 30),
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many auth requests. Try again later.' }
});

/** Общий лимит на /api/*. */
export const apiRateLimit = rateLimit({
  windowMs: readPositiveInt(process.env.API_RATE_LIMIT_WINDOW_MS, 60 * 1000),
  max: readPositiveInt(process.env.API_RATE_LIMIT_MAX, 200),
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Try again later.' }
});

export function wrapAsync(fn) {
  return function asyncRoute(req, res, next) {
    Promise.resolve(fn(req, res)).catch(next);
  };
}

export const corsMiddleware = cors((req, callback) => {
  const configured = corsAllowOrigin();
  callback(null, {
    origin: configured === '*' ? '*' : configured,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  });
});

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
