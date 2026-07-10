import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isMongoReady } from '../db/connect-mongo.js';
import { Model3D } from './model-schema.js';

const __dir = path.dirname(fileURLToPath(import.meta.url));
const gltfDir = path.resolve(__dir, '..', '..', '..', 'gltf');

async function listLocalGltfModels() {
  try {
    const names = await readdir(gltfDir);
    return names
      .filter((n) => /\.(gltf|glb)$/i.test(n))
      .map((name) => ({
        id: `local:${name}`,
        s3Key: null,
        localPath: `/gltf/${name}`,
        title: name,
        source: 'local-gltf'
      }));
  } catch {
    return [];
  }
}

export async function listModels({ ownerUserId } = {}) {
  if (!isMongoReady()) {
    return { models: await listLocalGltfModels() };
  }

  const filter = ownerUserId ? { ownerUserId } : {};
  const docs = await Model3D.find(filter).sort({ createdAt: -1 }).lean();
  const models = (docs || []).map((doc) => ({
    id: doc._id?.toString(),
    s3Key: doc.s3Key,
    ownerUserId: doc.ownerUserId ? doc.ownerUserId.toString() : null,
    ownerNickname: doc.ownerNickname || null,
    title: doc.title || null,
    createdAt: doc.createdAt || null,
    source: 'mongodb'
  }));

  if (models.length === 0) {
    const local = await listLocalGltfModels();
    return { models: local.length ? local : models };
  }

  return { models };
}

export async function createModel({ s3Key, ownerUserId, ownerNickname, title }) {
  if (!s3Key || !ownerUserId) {
    return null;
  }
  return Model3D.findOneAndUpdate(
    { s3Key },
    {
      s3Key,
      ownerUserId,
      ownerNickname: ownerNickname || undefined,
      ...(title ? { title } : {})
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

export async function deleteModelByS3Key(s3Key) {
  if (!s3Key || typeof s3Key !== 'string') {
    return { deletedCount: 0 };
  }
  const r = await Model3D.deleteOne({ s3Key: s3Key.trim() });
  return { deletedCount: r.deletedCount ?? 0 };
}
