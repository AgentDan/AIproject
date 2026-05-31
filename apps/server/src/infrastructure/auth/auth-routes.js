import { Router } from 'express';
import { isProduction } from '../config/runtime.js';
import { isMongoReady } from '../db/connect-mongo.js';
import { authenticate } from './auth-middleware.js';
import { isJwtConfigured } from './jwt.js';
import { loginUser, registerUser } from './auth-service.js';

export const authRouter = Router();

function mongoUnavailable(_req, res) {
  return res.status(503).json({
    message: 'Auth requires MONGO_URI. See .env.example.'
  });
}

function jwtUnavailable(_req, res) {
  return res.status(503).json({
    message: 'JWT_SECRET is not configured. See .env.example.'
  });
}

function mapError(err, res, label) {
  const status = err.status || 500;
  const message =
    err.status || !isProduction
      ? err.message
      : 'Internal server error';
  if (status === 500) {
    console.error(`${label} error:`, err);
  }
  return res.status(status).json({ message });
}

authRouter.use((req, res, next) => {
  if (!isMongoReady()) {
    return mongoUnavailable(req, res);
  }
  next();
});

authRouter.use(authenticate({ required: false }));

authRouter.post('/register', async (req, res) => {
  try {
    const { nickname, password, role } = req.body || {};
    const assignedRole =
      req.user?.role === 'administrator' && role ? role : 'user';
    await registerUser({ nickname, password, role: assignedRole });
    return res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    return mapError(err, res, 'POST /api/auth/register');
  }
});

authRouter.post('/login', async (req, res) => {
  if (!isJwtConfigured()) {
    return jwtUnavailable(req, res);
  }
  try {
    const { user, token } = await loginUser(req.body || {});
    return res.status(200).json({
      message: 'Login successful',
      user,
      token
    });
  } catch (err) {
    return mapError(err, res, 'POST /api/auth/login');
  }
});
