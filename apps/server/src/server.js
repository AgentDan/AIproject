import { createApp } from './app.js';
import { isProduction, runtimeLabel } from './config/runtime.js';
import { warnProductionClientDistMissing } from './config/client-dist.js';

export async function startServer() {
  if (isProduction) {
    warnProductionClientDistMissing();
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
