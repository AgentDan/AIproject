import crypto from 'node:crypto';

const STUB_DIM = 96;

/**
 * Детерминированный вектор для dev без API (тот же размер, что и у проиндексированных чанков).
 * @param {string} text
 * @returns {number[]}
 */
function stubEmbedding(text) {
  const hash = crypto.createHash('sha256').update(String(text)).digest();
  const vec = new Array(STUB_DIM);
  for (let i = 0; i < STUB_DIM; i += 1) {
    const b = hash[i % hash.length];
    vec[i] = b / 128 - 1;
  }
  const mag = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
  return vec.map((v) => v / mag);
}

/**
 * @param {string} text
 * @returns {Promise<number[]>}
 */
async function embedOpenAI(text, apiKey) {
  const model =
    process.env.EMBEDDINGS_MODEL?.trim() || 'text-embedding-3-small';
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({ model, input: text })
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI embeddings: ${res.status} ${err}`);
  }
  /** @type {{ data: Array<{ embedding: number[] }> }} */
  const data = await res.json();
  const embedding = data.data?.[0]?.embedding;
  if (!Array.isArray(embedding)) {
    throw new Error('OpenAI embeddings: missing embedding in response');
  }
  return embedding;
}

/**
 * @param {string} text
 * @returns {Promise<number[]>}
 */
export async function embedText(text) {
  const provider = (
    process.env.EMBEDDINGS_PROVIDER || 'stub'
  ).toLowerCase().trim();
  const key = process.env.EMBEDDINGS_API_KEY?.trim();

  if (provider === 'openai' && key) {
    return embedOpenAI(text, key);
  }

  return stubEmbedding(text);
}
