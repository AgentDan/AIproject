import { verifyAccessToken } from './jwt.js';

function readBearerToken(req) {
  const header = req.headers.authorization;
  if (typeof header !== 'string') {
    return null;
  }
  const match = /^Bearer\s+(\S+)$/i.exec(header.trim());
  return match?.[1] || null;
}

/**
 * @param {{ required?: boolean, rejectInvalidToken?: boolean }} [options]
 * rejectInvalidToken: when true, invalid Bearer token → 401 (e.g. /api/commands).
 * When false, invalid token is ignored and req.user stays null (e.g. /api/auth/login).
 */
export function authenticate(options = {}) {
  // Эта строка извлекает опции "required" (обязательна ли авторизация) и "rejectInvalidToken" (отклонять ли запрос при недействительном токене)
  // По умолчанию required = false; rejectInvalidToken принимает значение required если не задан
  const { required = false, rejectInvalidToken = required } = options;

  return (req, res, next) => {
    const token = readBearerToken(req);
    if (!token) {
      if (required) {
        return res.status(401).json({ message: 'Authorization required' });
      }
      req.user = null;
      return next();
    }

    try {
      const payload = verifyAccessToken(token);
      req.user = {
        id: payload.sub,
        nickname: payload.nickname,
        role: payload.role
      };
      return next();
    } catch (err) {
      if (err?.status === 503) {
        return res.status(503).json({ message: err.message });
      }
      if (rejectInvalidToken) {
        return res.status(401).json({ message: 'Invalid or expired token' });
      }
      req.user = null;
      return next();
    }
  };
}

/**
 * @param {...string} roles
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authorization required' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    return next();
  };
}
