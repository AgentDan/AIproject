import { createRetrievedChunk } from '@ai-product-scene-platform/contracts';
import { embedText } from '../knowledge-base/embeddings.js';
import { searchVectors } from '../knowledge-base/vector-store.js';

/**
 * RAG: эмбеддинг команды → поиск в vector store → top-K чанков для промпта.
 * @param {string} command
 * @param {{ topK?: number }} [options]
 */
export async function retrieve(command, options = {}) {
  const fromEnv = Number(process.env.KB_TOP_K);
  const topK =
    typeof options.topK === 'number'
      ? options.topK
      : (Number.isFinite(fromEnv) ? fromEnv : 5) || 5;

  const embedding = await embedText(command || '');
  const hits = await searchVectors(embedding, topK);

  return hits.map((h) =>
    createRetrievedChunk({
      id: h.id,
      text: h.text,
      source: h.source,
      score: h.score,
      metadata: h.metadata
    })
  );
}
