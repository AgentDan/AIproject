import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = path.dirname(fileURLToPath(import.meta.url));

/**
 * @param {number[]} a
 * @param {number[]} b
 */
function cosineSimilarity(a, b) {
  if (!a?.length || !b?.length || a.length !== b.length) {
    return 0;
  }
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const d = Math.sqrt(na) * Math.sqrt(nb);
  return d === 0 ? 0 : dot / d;
}

function defaultIndexPath() {
  const raw = process.env.KB_INDEX_PATH?.trim();
  if (raw) {
    return path.isAbsolute(raw)
      ? path.normalize(raw)
      : path.resolve(process.cwd(), raw);
  }
  return path.join(__dir, 'data', 'index', 'index.json');
}

/** @type {{ version: number, chunks: Array<{ id: string, text: string, source: string, embedding: number[], metadata?: object }> } | null} */
let cached = null;
/** @type {string | null} */
let cachedPath = null;

async function loadIndex() {
  const indexPath = defaultIndexPath();
  if (cached && cachedPath === indexPath) {
    return cached;
  }
  try {
    const raw = await readFile(indexPath, 'utf8');
    cached = JSON.parse(raw);
    cachedPath = indexPath;
  } catch (e) {
    if (/** @type {NodeJS.ErrnoException} */ (e).code === 'ENOENT') {
      cached = { version: 1, chunks: [] };
      cachedPath = indexPath;
      return cached;
    }
    throw e;
  }
  return cached;
}

/**
 * @param {number[]} queryEmbedding
 * @param {number} topK
 * @returns {Promise<Array<{ id: string, text: string, source: string, score: number, metadata: object }>>}
 */
export async function searchVectors(queryEmbedding, topK = 5) {
  const index = await loadIndex();
  const chunks = index.chunks || [];
  if (!queryEmbedding?.length) {
    return [];
  }

  const ranked = chunks
    .filter(
      (c) =>
        Array.isArray(c.embedding) &&
        c.embedding.length === queryEmbedding.length
    )
    .map((chunk) => ({
      chunk,
      score: cosineSimilarity(queryEmbedding, chunk.embedding)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  return ranked.map(({ chunk, score }) => ({
    id: chunk.id,
    text: chunk.text,
    source: chunk.source,
    score,
    metadata:
      chunk.metadata && typeof chunk.metadata === 'object' ? chunk.metadata : {}
  }));
}
