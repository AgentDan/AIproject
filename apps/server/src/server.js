import { createApp } from './app.js';
import { warnProductionClientDistMissing } from './config/client-dist.js';
import { isProduction, runtimeLabel } from './config/runtime.js';
import { ensureStorage } from './storage/local-storage.js';

export async function startServer() {
  if (isProduction) {
    warnProductionClientDistMissing();
  }

  try {
    const { root } = await ensureStorage();
    console.log(`[storage] ready at ${root}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[storage] ensureStorage failed: ${msg}`);
    console.error(
      '[storage] Fix permissions on apps/server/data or set SERVER_STORAGE_DIR to a writable directory.'
    );
  }

  const port = Number(process.env.PORT) || 3001;
  const host = process.env.HOST || '0.0.0.0';

  const app = createApp();

  await new Promise((resolve, reject) => {
    const httpServer = app.listen(port, host, () => {
      console.log(
        `[${runtimeLabel()}] Server is running on http://${host}:${port}`
      );
      resolve(httpServer);
    });
    httpServer.on('error', reject);
  });
}
