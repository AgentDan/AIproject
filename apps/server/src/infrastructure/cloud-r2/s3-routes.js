import { Router } from 'express';
import { authenticate, requireRole } from '../auth/auth-middleware.js';
import {
  downloadHandler,
  listObjectsHandler,
  removeHandler,
  streamHandler,
  upload,
  uploadHandler
} from './s3-controller.js';

export const s3Router = Router();

s3Router.get('/objects', authenticate({ required: true }), requireRole('administrator'), listObjectsHandler);
s3Router.post('/upload', authenticate({ required: true }), upload.single('file'), uploadHandler);
s3Router.get('/download/:key', downloadHandler);
s3Router.get('/model/:key', streamHandler);
s3Router.delete('/object/:key', authenticate({ required: true }), requireRole('administrator'), removeHandler);
s3Router.get('/:bucket', authenticate({ required: true }), requireRole('administrator'), listObjectsHandler);
