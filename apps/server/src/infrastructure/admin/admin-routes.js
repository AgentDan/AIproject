import { Router } from 'express';
import { authenticate, requireRole } from '../auth/auth-middleware.js';
import { isAuthReady } from '../auth/auth-service.js';
import { isDevMemoryAuthEnabled, memoryListUsers } from '../auth/auth-memory-store.js';
import { User } from '../auth/user-model.js';
import { closeLab, openFromS3, saveToS3 } from './lab-controller.js';

export const adminRouter = Router();

function adminUsersUnavailable(_req, res) {
  return res.status(503).json({
    message: 'Admin users API is unavailable. Set MONGO_URI or run in development without it.'
  });
}

adminRouter.use('/users', (req, res, next) => {
  if (!isAuthReady()) {
    return adminUsersUnavailable(req, res);
  }
  next();
});

adminRouter.post('/lab/close', closeLab);

adminRouter.use(authenticate({ required: true }), requireRole('administrator'));

adminRouter.get('/users', async (_req, res) => {
  try {
    if (isDevMemoryAuthEnabled()) {
      return res.json({ users: memoryListUsers() });
    }
    const users = await User.find({}, { passwordHash: 0 }).sort({ createdAt: -1 }).lean();
    const mapped = (users || []).map((u) => ({
      id: u._id?.toString(),
      nickname: u.nickname,
      role: u.role,
      createdAt: u.createdAt,
      lastLoginAt: u.lastLoginAt || null
    }));
    return res.json({ users: mapped });
  } catch (err) {
    console.error('GET /api/admin/users error:', err);
    return res.status(500).json({ message: 'Failed to load users' });
  }
});

adminRouter.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: 'User id is required' });
    }

    let deleted = null;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(String(id));
    if (isObjectId) {
      deleted = await User.findByIdAndDelete(id);
    }
    if (!deleted) {
      deleted = await User.findOneAndDelete({ nickname: id });
    }
    if (!deleted) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json({ message: 'User deleted' });
  } catch (err) {
    console.error('DELETE /api/admin/users/:id error:', err);
    return res.status(500).json({ message: 'Failed to delete user' });
  }
});

adminRouter.post('/lab/from-s3', openFromS3);
adminRouter.post('/lab/save-to-s3', saveToS3);
