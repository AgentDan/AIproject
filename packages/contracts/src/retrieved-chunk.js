/**
 * RAG: фрагмент из базы знаний, передаётся в Prompt Builder.
 * @param {Partial<{ id: string, text: string, source: string, score: number, metadata: { type?: string, tags?: string[] } }>} partial
 */
export function createRetrievedChunk(partial = {}) {
  const meta =
    partial.metadata && typeof partial.metadata === 'object'
      ? partial.metadata
      : {};
  const tags = Array.isArray(meta.tags)
    ? meta.tags.map((t) => String(t))
    : [];
  const type = typeof meta.type === 'string' ? meta.type : '';

  return {
    id: String(partial.id ?? ''),
    text: String(partial.text ?? ''),
    source: String(partial.source ?? ''),
    score: typeof partial.score === 'number' ? partial.score : 0,
    metadata: { type, tags }
  };
}
