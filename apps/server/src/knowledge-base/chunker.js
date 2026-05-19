/**
 * @param {string} text
 * @param {{ maxChars?: number, overlap?: number }} [options]
 * @returns {string[]}
 */
export function chunkText(text, { maxChars = 800, overlap = 120 } = {}) {
  const t = String(text).replace(/\r\n/g, '\n').trim();
  if (!t) {
    return [];
  }

  const chunks = [];
  let start = 0;
  const safeOverlap = Math.min(overlap, maxChars - 1);

  while (start < t.length) {
    const end = Math.min(start + maxChars, t.length);
    chunks.push(t.slice(start, end));
    if (end >= t.length) {
      break;
    }
    start = end - safeOverlap;
    if (start < 0) {
      start = 0;
    }
    if (chunks.length > 10000) {
      break;
    }
  }

  return chunks;
}
