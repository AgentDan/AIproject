import jwt from 'jsonwebtoken';
import { isProduction } from '../config/runtime.js';

const DEFAULT_EXPIRES_IN = '7d';

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET?.trim();
  if (secret) {
    return secret;
  }
  if (!isProduction) {
    return 'dev-insecure-jwt-secret';
  }
  return null;
}

export function isJwtConfigured() {
  return Boolean(getJwtSecret());
}

/**
 * @param {{ id: string, nickname: string, role: string }} user
 * @returns {string}
 */
export function signAccessToken(user) {
  const secret = getJwtSecret();
  if (!secret) {
    const err = new Error('JWT_SECRET is not configured');
    err.status = 503;
    throw err;
  }

  return jwt.sign(
    {
      nickname: user.nickname,
      role: user.role
    },
    secret,
    {
      subject: user.id,
      expiresIn: process.env.JWT_EXPIRES_IN?.trim() || DEFAULT_EXPIRES_IN
    }
  );
}

/**
 * @param {string} token
 * @returns {{ sub: string, nickname: string, role: string }}
 */
export function verifyAccessToken(token) {
  const secret = getJwtSecret();
  if (!secret) {
    const err = new Error('JWT_SECRET is not configured');
    err.status = 503;
    throw err;
  }

  const payload = jwt.verify(token, secret);
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid token payload');
  }

  const sub = typeof payload.sub === 'string' ? payload.sub : '';
  const nickname = typeof payload.nickname === 'string' ? payload.nickname : '';
  const role = typeof payload.role === 'string' ? payload.role : '';

  if (!sub || !nickname || !role) {
    throw new Error('Invalid token payload');
  }

  return { sub, nickname, role };
}
