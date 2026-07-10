import multer from 'multer';
import { User } from '../auth/user-model.js';
import { createModel, deleteModelByS3Key } from '../models/models-service.js';
import {
  deleteObject,
  getDefaultBucket,
  getDownloadUrl,
  getObject,
  isS3Configured,
  listObjects,
  uploadObject
} from './s3-service.js';

const upload = multer({ storage: multer.memoryStorage() });

function s3NotConfigured(res) {
  return res.status(503).json({
    error: 'S3/R2 not configured. See .env.example.'
  });
}

function bucketOrFail(res) {
  const bucket = getDefaultBucket();
  if (!bucket) {
    res.status(500).json({ error: 'Set BUCKET_NAME in .env' });
    return null;
  }
  return bucket;
}

export async function listObjectsHandler(req, res) {
  if (!isS3Configured()) {
    return s3NotConfigured(res);
  }
  const bucket = req.params.bucket || bucketOrFail(res);
  if (!bucket) {
    return;
  }
  try {
    const contents = await listObjects(bucket);
    return res.json({ objects: contents, count: contents.length });
  } catch (err) {
    console.error('S3 list error:', err);
    return res.status(500).json({
      error: err instanceof Error ? err.message : 'S3 list failed'
    });
  }
}

export async function uploadHandler(req, res) {
  if (!isS3Configured()) {
    return s3NotConfigured(res);
  }
  const bucket = bucketOrFail(res);
  if (!bucket) {
    return;
  }
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const key =
    (req.body?.key && String(req.body.key).trim()) || req.file.originalname;
  const ownerNickname =
    typeof req.body?.ownerNickname === 'string'
      ? req.body.ownerNickname.trim()
      : '';

  try {
    await uploadObject(bucket, key, req.file.buffer, req.file.mimetype);

    const lowerKey = String(key).toLowerCase();
    if (
      ownerNickname &&
      (lowerKey.endsWith('.gltf') || lowerKey.endsWith('.glb'))
    ) {
      try {
        const user = await User.findOne({ nickname: ownerNickname }).lean();
        if (user?._id) {
          await createModel({
            s3Key: key,
            ownerUserId: user._id,
            ownerNickname: user.nickname
          });
        }
      } catch (e) {
        console.error('Failed to link uploaded model to user:', e);
      }
    }

    return res.json({ key, size: req.file.size });
  } catch (err) {
    console.error('S3 upload error:', err);
    return res.status(500).json({
      error: err instanceof Error ? err.message : 'S3 upload failed'
    });
  }
}

export async function downloadHandler(req, res) {
  if (!isS3Configured()) {
    return s3NotConfigured(res);
  }
  const bucket = bucketOrFail(res);
  if (!bucket) {
    return;
  }
  const key = decodeURIComponent(req.params.key);
  try {
    const url = await getDownloadUrl(bucket, key, 3600);
    return res.json({ url });
  } catch (err) {
    console.error('S3 download error:', err);
    return res.status(500).json({
      error: err instanceof Error ? err.message : 'S3 download failed'
    });
  }
}

export async function streamHandler(req, res) {
  if (!isS3Configured()) {
    return s3NotConfigured(res);
  }
  const bucket = bucketOrFail(res);
  if (!bucket) {
    return;
  }
  const key = decodeURIComponent(req.params.key);
  try {
    const { body, contentType } = await getObject(bucket, key);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }
    body.pipe(res);
  } catch (err) {
    console.error('S3 stream error:', err);
    const notFound =
      err?.name === 'NoSuchKey' ||
      err?.Code === 'NoSuchKey' ||
      err?.$metadata?.httpStatusCode === 404 ||
      /does not exist/i.test(String(err?.message || ''));
    return res.status(notFound ? 404 : 500).json({
      error: err instanceof Error ? err.message : 'S3 stream failed'
    });
  }
}

export async function removeHandler(req, res) {
  if (!isS3Configured()) {
    return s3NotConfigured(res);
  }
  const bucket = bucketOrFail(res);
  if (!bucket) {
    return;
  }
  const key = decodeURIComponent(req.params.key);
  try {
    await deleteObject(bucket, key);
    let dbRemoved = false;
    try {
      const { deletedCount } = await deleteModelByS3Key(key);
      dbRemoved = deletedCount > 0;
    } catch (dbErr) {
      console.error('S3 deleted but Model3D DB delete failed:', dbErr);
      return res.status(200).json({
        deleted: key,
        dbRemoved: false,
        warning: 'File removed from S3 but database record could not be deleted.'
      });
    }
    return res.json({ deleted: key, dbRemoved });
  } catch (err) {
    console.error('S3 delete error:', err);
    return res.status(500).json({
      error: err instanceof Error ? err.message : 'S3 delete failed'
    });
  }
}

export { upload };
