import { Router } from 'express';
import { listModels } from './models-service.js';

export const modelsRouter = Router();

modelsRouter.get('/', async (req, res) => {
  try {
    const ownerUserIdRaw = req.query?.ownerUserId;
    const ownerUserId =
      typeof ownerUserIdRaw === 'string' && ownerUserIdRaw.trim()
        ? ownerUserIdRaw.trim()
        : null;
    const { models } = await listModels(ownerUserId ? { ownerUserId } : undefined);
    return res.json({ models });
  } catch (err) {
    console.error('GET /api/models error:', err);
    return res.status(500).json({ message: 'Failed to list models' });
  }
});
