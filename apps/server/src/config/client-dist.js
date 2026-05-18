import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirnameConfig = path.dirname(fileURLToPath(import.meta.url));

/** Абсолютный путь к `apps/client/dist` или к пути из `CLIENT_DIST_PATH`. */
export function resolveClientDistPath() {
  const raw = process.env.CLIENT_DIST_PATH?.trim();
  if (raw) {
    return path.isAbsolute(raw)
      ? path.normalize(raw)
      : path.normalize(path.resolve(process.cwd(), raw));
  }
  return path.resolve(__dirnameConfig, '..', '..', '..', '..', 'apps', 'client', 'dist');
}

/** В production один раз предупреждаем, если нет сборки клиента. */
export function warnProductionClientDistMissing() {
  const dist = resolveClientDistPath();
  const indexHtml = path.join(dist, 'index.html');
  if (!fs.existsSync(indexHtml)) {
    console.warn(
      `[production] Клиент не собран или путь неверён: не найден ${indexHtml}. Выполните «npm run build» в монорепо или задайте CLIENT_DIST_PATH.`
    );
  }
}
