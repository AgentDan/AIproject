/**
 * Единый JSON-ответ для API (CORS выставляет middleware в приложении Express).
 */

export function sendJson(res, statusCode, payload) {
  res.status(statusCode).type('application/json').json(payload);
}
