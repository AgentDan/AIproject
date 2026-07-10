import { createWriteStream } from 'node:fs';
import { access, readFile, writeFile } from 'node:fs/promises';
import { pipeline } from 'node:stream/promises';
import { toCleanEmbeddedPanelLab } from '@ai-product-scene-platform/panel-lab-schema';
import {
  getDefaultBucket,
  getObject,
  isS3Configured,
  uploadObject
} from '../cloud-r2/s3-service.js';
import { deleteLabTempFile, getLabTempFilePath } from './lab-temp.js';

function labUserId(req) {
  return req.user?.id || 'admin';
}

function s3NotConfigured(res) {
  return res.status(503).json({
    error: 'S3/R2 not configured. Set BUCKET_NAME, S3_ENDPOINT, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY in .env'
  });
}

export async function openFromS3(req, res) {
  if (!isS3Configured()) {
    return s3NotConfigured(res);
  }
  const bucket = getDefaultBucket();
  const key = String(req.body?.key || '').trim();
  if (!key) {
    return res.status(400).json({ error: 'Missing S3 key' });
  }

  try {
    const userId = labUserId(req);
    const tempPath = await getLabTempFilePath({ userId, key });
    const { body, contentType } = await getObject(bucket, key);
    await pipeline(body, createWriteStream(tempPath));
    return res.json({
      key,
      contentType: contentType || null,
      prepared: true
    });
  } catch (err) {
    console.error('Lab openFromS3 error:', err);
    return res.status(500).json({
      error: err instanceof Error ? err.message : 'Failed to prepare Lab file from S3'
    });
  }
}

export async function saveToS3(req, res) {
  if (!isS3Configured()) {
    return s3NotConfigured(res);
  }
  const bucket = getDefaultBucket();
  const key = String(req.body?.key || '').trim();
  if (!key) {
    return res.status(400).json({ error: 'Missing S3 key' });
  }

  const panelLabInput = req.body?.panelLab ?? null;

  try {
    const userId = labUserId(req);
    const tempPath = await getLabTempFilePath({ userId, key });
    await access(tempPath);

    const isGltfJson = key.toLowerCase().endsWith('.gltf');
    if (panelLabInput && isGltfJson) {
      const raw = await readFile(tempPath, 'utf8');
      try {
        const json = JSON.parse(raw);
        if (json && typeof json === 'object') {
          json.extras = json.extras || {};
          json.extras.panelLab = toCleanEmbeddedPanelLab(panelLabInput);
          await writeFile(tempPath, JSON.stringify(json), 'utf8');
        }
      } catch (e) {
        console.warn('[Lab] Failed to patch .gltf panelLab:', e);
      }
    }

    const { createReadStream } = await import('node:fs');
    await uploadObject(bucket, key, createReadStream(tempPath), 'model/gltf+json');
    return res.json({ key, saved: true });
  } catch (err) {
    console.error('Lab saveToS3 error:', err);
    return res.status(500).json({
      error: err instanceof Error ? err.message : 'Failed to save Lab file back to S3'
    });
  }
}

export async function closeLab(req, res) {
  const key = String(req.body?.key || '').trim();
  if (!key) {
    return res.status(400).json({ error: 'Missing S3 key' });
  }
  try {
    await deleteLabTempFile({ userId: labUserId(req), key });
    return res.json({ key, closed: true });
  } catch (err) {
    console.error('Lab close error:', err);
    return res.status(500).json({
      error: err instanceof Error ? err.message : 'Failed to close Lab session'
    });
  }
}
