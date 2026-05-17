/**
 * Режим процесса: стандартный флаг Node — NODE_ENV.
 * - production — боевой процесс (узкий CORS при заданном CORS_ORIGIN).
 * - иначе — development (удобная локальная разработка).
 *
 * Чтобы переменные из `.env` попали в процесс, в начале `index.js` вызывается dotenv,
 * затем подключаются остальные модули. Иначе задайте окружение в systemd/PM2 и т.д.
 */

export const nodeEnv = process.env.NODE_ENV ?? 'development';
export const isProduction = nodeEnv === 'production';
export const isDevelopment = !isProduction;

/** Значение для логов и /health */
export function runtimeLabel() {
  return isProduction ? 'production' : 'development';
}

/** Access-Control-Allow-Origin: в dev всегда *; в prod — CORS_ORIGIN или снова *. */
export function corsAllowOrigin() {
  if (!isProduction) return '*';
  const origin = process.env.CORS_ORIGIN?.trim();
  return origin || '*';
}
