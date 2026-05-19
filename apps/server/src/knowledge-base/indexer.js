#!/usr/bin/env node
/**
 * CLI: построение векторного индекса из data/source/
 * Запуск: npm run kb:index --workspace apps/server
 */
import path from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { loadDocumentsFromDir } from './loader.js';
import { chunkText } from './chunker.js';
import { embedText } from './embeddings.js';

const __dirnameIndexer = path.dirname(fileURLToPath(import.meta.url));
const sourceDir = path.join(__dirnameIndexer, 'data', 'source');
const defaultIndexPath = path.join(
  __dirnameIndexer,
  'data',
  'index',
  'index.json'
);

function resolveIndexPath() {
  const raw = process.env.KB_INDEX_PATH?.trim();
  if (!raw) {
    return defaultIndexPath;
  }
  return path.isAbsolute(raw)
    ? path.normalize(raw)
    : path.resolve(process.cwd(), raw);
}

async function main() {
  const docs = await loadDocumentsFromDir(sourceDir);
  const chunks = [];
  let id = 0;

  for (const doc of docs) {
    const parts = chunkText(doc.content);
    for (const text of parts) {
      const embedding = await embedText(text);
      id += 1;
      chunks.push({
        id: `chunk-${id}`,
        text,
        source: doc.path,
        embedding,
        metadata: { type: doc.ext.replace('.', ''), tags: [] }
      });
    }
  }

  const indexPath = resolveIndexPath();
  await mkdir(path.dirname(indexPath), { recursive: true });
  await writeFile(
    indexPath,
    `${JSON.stringify({ version: 1, chunks }, null, 2)}\n`,
    'utf8'
  );
  console.log(`[kb:index] записано чанков: ${chunks.length} → ${indexPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
