import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const TEXT_EXT = new Set(['.md', '.txt', '.json']);

/**
 * @param {string} sourceDir
 * @returns {Promise<Array<{ path: string, content: string, ext: string }>>}
 */
export async function loadDocumentsFromDir(sourceDir) {
  const out = [];

  async function walk(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const ent of entries) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        await walk(full);
        continue;
      }
      const ext = path.extname(ent.name).toLowerCase();
      if (!TEXT_EXT.has(ext)) {
        continue;
      }
      const content = await readFile(full, 'utf8');
      out.push({
        path: path.relative(sourceDir, full) || ent.name,
        content,
        ext
      });
    }
  }

  try {
    await walk(sourceDir);
  } catch (e) {
    if (/** @type {NodeJS.ErrnoException} */ (e).code === 'ENOENT') {
      return [];
    }
    throw e;
  }

  return out;
}
