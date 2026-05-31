import os from 'node:os';
import path from 'node:path';
import { mkdir, unlink } from 'node:fs/promises';

export const LAB_TMP_ROOT =
  process.env.LAB_TMP_DIR?.trim() || path.join(os.tmpdir(), 'fitchi-lab');

async function ensureDir(dirPath) {
  await mkdir(dirPath, { recursive: true });
}

/** @param {{ userId: string | number, key: string }} params */
export async function getLabTempFilePath({ userId, key }) {
  const safeUser = String(userId || 'anonymous');
  const safeKey = String(key || 'asset').replace(/[^\w.\-]/g, '_');
  const userDir = path.join(LAB_TMP_ROOT, safeUser);
  await ensureDir(userDir);
  return path.join(userDir, safeKey);
}

/** @param {{ userId: string | number, key: string }} params */
export async function deleteLabTempFile({ userId, key }) {
  const tempPath = await getLabTempFilePath({ userId, key });
  try {
    await unlink(tempPath);
  } catch (err) {
    if (/** @type {NodeJS.ErrnoException} */ (err).code !== 'ENOENT') {
      throw err;
    }
  }
}
