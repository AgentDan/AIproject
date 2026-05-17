import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * ESM загружает все статические import до выполнения тела следующих модулей,
 * поэтому `dotenv.config()` здесь — до динамического import `./app.js`/`runtime`.
 * 1) `.env` в корне монорепо
 * 2) `apps/server/.env` (если есть) — перекрывает ключи
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRootEnv = path.resolve(__dirname, '..', '..', '..', '.env');
const serverEnv = path.resolve(__dirname, '..', '.env');

if (fs.existsSync(repoRootEnv)) {
  dotenv.config({ path: repoRootEnv });
}
if (fs.existsSync(serverEnv)) {
  dotenv.config({ path: serverEnv, override: true });
}

const { createApp } = await import('./app.js');
const { runtimeLabel } = await import('./config/runtime.js');

const port = Number(process.env.PORT) || 3001;
/** In containers and PaaS, bind all interfaces so the port is reachable from outside localhost. */
const host = process.env.HOST || '0.0.0.0';

const server = createApp();

server.listen(port, host, () => {
  console.log(
    `[${runtimeLabel()}] Server is running on http://${host}:${port}`
  );
});
